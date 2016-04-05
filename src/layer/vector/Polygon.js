import {Point} from 'src/geometry/Point'
import {Bounds} from 'src/geometry/Bounds'
import {PolyUtil} from 'src/geometry/PolyUtil'
import {LatLng} from 'src/geo/LatLng'
import {LatLngBounds} from 'src/geo/LatLngBounds'
import {Polyline} from './Polyline'

/*
 * L.Polygon implements polygon vector layer (closed polyline with a fill inside).
 */

let _default_polygon_options = {
		fill: true
	}

export class Polygon extends Polyline {

	constructor(latlng, options = undefined) {
		super(latlng)
		Object.assign(this.options, _default_polygon_options, options)

		if (Polyline._flat(this._latlngs)) {
			this._latlngs = [this._latlngs]
		}
	}

	isEmpty() {
		return !this._latlngs.length || !this._latlngs[0].length
	}

	get center() {
		let i, j, p1, p2, f, area, x, y, center,
		    points = this._rings[0],
		    len = points.length

		if (!len) { return null }

		// polygon centroid algorithm; only uses the first ring if there are multiple

		area = x = y = 0

		for (i = 0, j = len - 1; i < len; j = i++) {
			p1 = points[i]
			p2 = points[j]

			f = p1.y * p2.x - p2.y * p1.x
			x += (p1.x + p2.x) * f
			y += (p1.y + p2.y) * f
			area += f * 3
		}

		if (area === 0) {
			// Polygon is so small that all points are on same pixel.
			center = points[0]
		} else {
			center = [x / area, y / area]
		}
		return this._map.layerPointToLatLng(center)
	}

	_convertLatLngs(latlngs) {
		var result = Polyline.prototype._convertLatLngs.call(this, latlngs),
		    len = result.length

		// remove last point if it equals first one
		if (len >= 2 && result[0] instanceof LatLng && result[0].equals(result[len - 1])) {
			result.pop()
		}
		return result
	}

	_setLatLngs(latlngs) {
		//L.Polyline.prototype._setLatLngs.call(this, latlngs)
		super._setLatLngs(latlngs)
		if (Polyline._flat(this._latlngs)) {
			this._latlngs = [this._latlngs]
		}
	}

	_defaultShape() {
		return Polyline._flat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0]
	}

	_clipPoints() {
		// polygons need a different clipping algorithm so we redefine that

		let bounds = this._renderer._bounds,
		    w = this.options.weight,
		    p = new Point(w, w)

		// increase clip padding by stroke width to avoid stroke on clip edges
		bounds = new Bounds(bounds.min.subtract(p), bounds.max.add(p))

		this._parts = []
		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
			return
		}

		if (this.options.noClip) {
			this._parts = this._rings
			return
		}

		for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
			clipped = PolyUtil.clipPolygon(this._rings[i], bounds, true)
			if (clipped.length) {
				this._parts.push(clipped)
			}
		}
	}

	_updatePath() {
		this._renderer._updatePoly(this, true)
	}
}

