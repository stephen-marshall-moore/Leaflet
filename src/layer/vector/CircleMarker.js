import {Bounds} from 'src/geometry/Bounds'
import {LatLng} from 'src/geo/LatLng'
import {Path} from './Path'
/*
 * L.CircleMarker is a circle overlay with a permanent pixel radius.
 */

let _default_circlemarker_options = {
		fill: true,
		radius: 10
	}

export class CircleMarker extends Path {


	constructor(latlng, options = undefined) {
		super()
		Object.assign(this.options, _default_circlemarker_options, options)

		this._latlng = LatLng.latLng(latlng)
		this._radius = this.options.radius
	}

	set latLng(latlng) {
		this._latlng = LatLng.latLng(latlng)
		this.redraw()
		this.fire('move', {latlng: this._latlng})
	}

	get latLng() {
		return this._latlng
	}

	set radius(radius) {
		this.options.radius = this._radius = radius
		this.redraw()
	}

	get radius() {
		return this._radius
	}

	set style (options) {
		let radius = options && options.radius || this._radius
		//L.Path.prototype.setStyle.call(this, options)
		super.setStyle(options)
		this.radius = radius
	}

	_project() {
		this._point = this._map.latLngToLayerPoint(this._latlng)
		this._updateBounds()
	}

	_updateBounds() {
		var r = this._radius,
		    r2 = this._radiusY || r,
		    w = this._clickTolerance(),
		    p = [r + w, r2 + w]
		this._pxBounds = new Bounds(this._point.subtract(p), this._point.add(p))
	}

	_update() {
		if (this._map) {
			this._updatePath()
		}
	}

	_updatePath() {
		this._renderer._updateCircle(this)
	}

	_empty() {
		return this._radius && !this._renderer._bounds.intersects(this._pxBounds)
	}
}
