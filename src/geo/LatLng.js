/*
 * L.LatLng represents a geographical point with latitude and longitude coordinates.
 */

import {Earth} from './crs/CRS.Earth'
import {LatLngBounds} from './LatLngBounds'

let earth = new Earth()

export class LatLng {

	constructor(lat, lng, alt=undefined, crs=earth) {
		this.crs = crs
		if (!(typeof lat === 'number' && Number.isFinite(lat) &&
					typeof lng === 'number' && Number.isFinite(lng))) {
			throw new Error('Invalid LatLng object: (' + lat + ', ' + lng + ')')
		}

		this.lat = +lat
		this.lng = +lng

		if (alt !== undefined) {
			this.alt = +alt
		}
	}

	equals(obj, maxMargin) {
		if (!obj) { return false }

		obj = LatLng.latLng(obj)

		let margin = Math.max(
		        Math.abs(this.lat - obj.lat),
		        Math.abs(this.lng - obj.lng))

		return margin <= (maxMargin === undefined ? 1.0E-9 : maxMargin)
	}

	toString(precision) {
		return `LatLng(${this.lat.toPrecision(precision)}, ${this.lng.toPrecision(precision)})`
	}

	distanceTo(other) {
		return this.crs.distance(this, LatLng.latLng(other))
	}

	wrap() { // (CoordinateReferenceSystem)
		return this.crs.wrapLatLng(this)
	}

	toBounds(sizeInMeters) {
		let latAccuracy = 180 * sizeInMeters / 40075017,
		    lngAccuracy = latAccuracy / Math.cos((Math.PI / 180) * this.lat)

		return LatLngBounds.latLngBounds(
		        [this.lat - latAccuracy, this.lng - lngAccuracy],
		        [this.lat + latAccuracy, this.lng + lngAccuracy])
	}

	clone() {
		return new LatLng(this.lat, this.lng, this.alt)
	}

  // constructs LatLng with different signatures
  // (LatLng) or ([Number, Number]) or (Number, Number) or (Object)

	static latLng(a, b, c) {
		if (a instanceof LatLng) {
			return a
		}
		if (Array.isArray(a) && typeof a[0] !== 'object') {
			if (a.length === 3) {
				return new LatLng(a[0], a[1], a[2])
			}
			if (a.length === 2) {
				return new LatLng(a[0], a[1])
			}
			return null
		}
		if (a === undefined || a === null) {
			return a
		}
		if (typeof a === 'object' && 'lat' in a) {
			return new LatLng(a.lat, 'lng' in a ? a.lng : a.lon, a.alt)
		}
		if (b === undefined) {
			return null
		}
		return new LatLng(a, b, c)
	}
}



