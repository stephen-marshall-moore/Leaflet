import {Point} from 'src/geometry/Point'
import {Bounds} from 'src/geometry/Bounds'
import {LineUtil} from 'src/geometry/LineUtil'
import {LatLng} from 'src/geo/LatLng'
import {LatLngBounds} from 'src/geo/LatLngBounds'
import {Path} from './Path'

/*
 * L.Polyline implements polyline vector layer (a set of points connected with lines)
 */

let _default_polyline_options = {
		// how much to simplify the polyline on each zoom level
		// more = better performance and smoother look, less = more accurate
		smoothFactor: 1.0
		// noClip: false
	}

export class Polyline extends Path {

	constructor(latlng, options = undefined) {
		super()
		Object.assign(this.options, _default_polyline_options, options)

		this._setLatLngs(latlng)
	}

	get latLngs() {
		return this._latlngs
	}

	set latLngs(latlngs) {
		this._setLatLngs(latlngs)
		this.redraw()
	}

	isEmpty() {
		return !this._latlngs.length
	}

	closestLayerPoint(p) {
		let minDistance = Infinity,
		    minPoint = null,
		    closest = LineUtil._sqClosestPointOnSegment,
		    p1, p2

		for (let j = 0, jLen = this._parts.length; j < jLen; j++) {
			let points = this._parts[j]

			for (let i = 1, len = points.length; i < len; i++) {
				p1 = points[i - 1]
				p2 = points[i]

				let sqDist = closest(p, p1, p2, true)

				if (sqDist < minDistance) {
					minDistance = sqDist
					minPoint = closest(p, p1, p2)
				}
			}
		}
		if (minPoint) {
			minPoint.distance = Math.sqrt(minDistance)
		}
		return minPoint
	}

	get center() {
		let i, halfDist, segDist, dist, p1, p2, ratio,
		    points = this._rings[0],
		    len = points.length

		if (!len) { return null }

		// polyline centroid algorithm only uses the first ring if there are multiple

		for (i = 0, halfDist = 0; i < len - 1; i++) {
			halfDist += points[i].distanceTo(points[i + 1]) / 2
		}

		// The line is so small in the current view that all points are on the same pixel.
		if (halfDist === 0) {
			return this._map.layerPointToLatLng(points[0])
		}

		for (i = 0, dist = 0; i < len - 1; i++) {
			p1 = points[i]
			p2 = points[i + 1]
			segDist = p1.distanceTo(p2)
			dist += segDist

			if (dist > halfDist) {
				ratio = (dist - halfDist) / segDist
				return this._map.layerPointToLatLng([
					p2.x - ratio * (p2.x - p1.x),
					p2.y - ratio * (p2.y - p1.y)
				])
			}
		}
	}

	get bounds() {
		return this._bounds
	}

	addLatLng(latlng, latlngs) {
		latlngs = latlngs || this._defaultShape()
		latlng = LatLng.latLng(latlng)
		latlngs.push(latlng)
		this._bounds.extend(latlng)
		return this.redraw()
	}

	_setLatLngs(latlngs) {
		this._bounds = new LatLngBounds()
		this._latlngs = this._convertLatLngs(latlngs)
	}

	_defaultShape() {
		return Polyline._flat(this._latlngs) ? this._latlngs : this._latlngs[0]
	}

	// recursively convert latlngs input into actual LatLng instances calculate bounds along the way
	_convertLatLngs(latlngs) {
		let result = [],
		    flat = Polyline._flat(latlngs)

		for (let i = 0, len = latlngs.length; i < len; i++) {
			if (flat) {
				result[i] = LatLng.latLng(latlngs[i])
				this._bounds.extend(result[i])
			} else {
				result[i] = this._convertLatLngs(latlngs[i])
			}
		}

		return result
	}

	_project() {
		let pxBounds = new Bounds()
		this._rings = []
		this._projectLatlngs(this._latlngs, this._rings, pxBounds)

		var w = this._clickTolerance(),
		    p = new Point(w, w)

		if (this._bounds.isValid() && pxBounds.isValid()) {
			pxBounds.min._subtract(p)
			pxBounds.max._add(p)
			this._pxBounds = pxBounds
		}
	}

	// recursively turns latlngs into a set of rings with projected coordinates
	_projectLatlngs(latlngs, result, projectedBounds) {
		let flat = latlngs[0] instanceof LatLng,
		    len = latlngs.length,
		    i, ring

		if (flat) {
			ring = []
			for (i = 0; i < len; i++) {
				ring[i] = this._map.latLngToLayerPoint(latlngs[i])
				projectedBounds.extend(ring[i])
			}
			result.push(ring)
		} else {
			for (i = 0; i < len; i++) {
				this._projectLatlngs(latlngs[i], result, projectedBounds)
			}
		}
	}

	// clip polyline by renderer bounds so that we have less to render for performance
	_clipPoints() {
		let bounds = this._renderer._bounds

		this._parts = []
		if (!this._pxBounds || !this._pxBounds.intersects(bounds)) {
			return
		}

		if (this.options.noClip) {
			this._parts = this._rings
			return
		}

		let parts = this._parts,
		    i, j, k, len, len2, segment, points

		let lastCode = 0

		for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
			points = this._rings[i]

			for (j = 0, len2 = points.length; j < len2 - 1; j++) {
				//segment = LineUtil.clipSegment(points[j], points[j + 1], bounds, j, true)
				//segment = LineUtil.clipSegment(points[j], points[j + 1], bounds, true, j, false)
				let rvalue = LineUtil.clipSegment(points[j], points[j + 1], bounds, false, lastCode, false)
				segment = rvalue.segment
				lastCode = rvalue.lastCode

				console.log(rvalue)
				if (!segment) { continue }

				parts[k] = parts[k] || []
				parts[k].push(segment[0])

				// if segment goes out of screen, or it's the last one, it's the end of the line part
				if ((segment[1] !== points[j + 1]) || (j === len2 - 2)) {
					parts[k].push(segment[1])
					k++
				}
			}
		}
	}

	// simplify each clipped part of the polyline for performance
	_simplifyPoints() {
		let parts = this._parts,
		    tolerance = this.options.smoothFactor

		for (let i = 0, len = parts.length; i < len; i++) {
			parts[i] = LineUtil.simplify(parts[i], tolerance)
		}
	}

	_update() {
		if (!this._map) { return }

		this._clipPoints()
		this._simplifyPoints()
		this._updatePath()
	}

	_updatePath() {
		this._renderer._updatePoly(this)
	}

	static _flat(latlngs) {
		// true if it's a flat array of latlngs false if nested
		return !Array.isArray(latlngs[0]) || (typeof latlngs[0][0] !== 'object' && typeof latlngs[0][0] !== 'undefined')
	}
}
