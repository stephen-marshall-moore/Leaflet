import {LatLngBounds} from 'src/geo/LatLngBounds'
import {Earth} from 'src/geo/crs/CRS.Earth'
import {CircleMarker} from './CircleMarker'

/*
 * L.Circle is a circle overlay (with a certain radius in meters).
 * It's an approximation and starts to diverge from a real circle closer to poles (due to projection distortion)
 */

export class Circle extends CircleMarker {

	constructor(latlng, options) {
		super(latlng, options)
		this._mRadius = this.options.radius
	}

	set radius(radius) {
		this._mRadius = radius
		this.redraw()
	}

	get radius() {
		return this._mRadius
	}

	get bounds() {
		let half = [this._radius, this._radiusY || this._radius]

		return new LatLngBounds(
			this._map.layerPointToLatLng(this._point.subtract(half)),
			this._map.layerPointToLatLng(this._point.add(half)))
	}

	// setStyle: L.Path.prototype.setStyle,

	_project() {

		let lng = this._latlng.lng,
		    lat = this._latlng.lat,
		    map = this._map,
		    crs = map.options.crs

		//if (crs.distance === Earth.distance) {
		if (true) {
			let d = Math.PI / 180,
			    latR = (this._mRadius / crs.R) / d,
			    top = map.project([lat + latR, lng]),
			    bottom = map.project([lat - latR, lng]),
			    p = top.add(bottom).divideBy(2),
			    lat2 = map.unproject(p).lat,
			    lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) /
			            (Math.cos(lat * d) * Math.cos(lat2 * d))) / d

			if (isNaN(lngR) || lngR === 0) {
				lngR = latR / Math.cos(Math.PI / 180 * lat) // Fallback for edge case, #2425
			}

			this._point = p.subtract(map.pixelOrigin)
			this._radius = isNaN(lngR) ? 0 : Math.max(Math.round(p.x - map.project([lat2, lng - lngR]).x), 1)
			this._radiusY = Math.max(Math.round(p.y - top.y), 1)

		} else {
			let latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]))

			this._point = map.latLngToLayerPoint(this._latlng)
			this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x
		}

		this._updateBounds()
	}
}

