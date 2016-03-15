/*
 * LatLngBounds represents a rectangular area on the map in geographical coordinates.
 */
import {LatLng} from './LatLng'


export class LatLngBounds {

	constructor(southWest, northEast) { // (LatLng, LatLng) or (LatLng[])
		if (!southWest) { return }

		let latlngs = northEast ? [southWest, northEast] : southWest

		for (let latlng of latlngs) {
			this.extend(latlng)
		}
	}

	// extend the bounds to contain the given point or bounds
	extend(obj) { // (LatLng) or (LatLngBounds)
		let sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2

		if (obj instanceof LatLng) {
			sw2 = obj
			ne2 = obj

		} else if (obj instanceof LatLngBounds) {
			sw2 = obj._southWest
			ne2 = obj._northEast

			if (!sw2 || !ne2) { return this }

		} else {
			return obj ? this.extend(LatLng.latLng(obj) || LatLngBounds.latLngBounds(obj)) : this
		}

		if (!sw && !ne) {
			this._southWest = new LatLng(sw2.lat, sw2.lng)
			this._northEast = new LatLng(ne2.lat, ne2.lng)
		} else {
			sw.lat = Math.min(sw2.lat, sw.lat)
			sw.lng = Math.min(sw2.lng, sw.lng)
			ne.lat = Math.max(ne2.lat, ne.lat)
			ne.lng = Math.max(ne2.lng, ne.lng)
		}

		return this
	}

	// extend the bounds by a percentage
	pad(bufferRatio) { // (Number) -> LatLngBounds
		let sw = this._southWest,
		    ne = this._northEast,
		    heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio,
		    widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio

		return new LatLngBounds(
		        new LatLng(sw.lat - heightBuffer, sw.lng - widthBuffer),
		        new LatLng(ne.lat + heightBuffer, ne.lng + widthBuffer))
	}

	get center() {
		return new LatLng((this._southWest.lat + this._northEast.lat) / 2,
			(this._southWest.lng + this._northEast.lng) / 2) }

	get southWest() { return this._southWest }

	get northEast() { return this._northEast }

	get northWest() { return new LatLng(this.north, this.west) }

	get southEast() { return new LatLng(this.south, this.east) }

	get west() { return this._southWest.lng }

	get south() { return this._southWest.lat }

	get east() { return this._northEast.lng }

	get north() { return this._northEast.lat }

	contains(obj) { // (LatLngBounds) or (LatLng) -> Boolean
		if (typeof obj[0] === 'number' || obj instanceof LatLng) {
			obj = LatLng.latLng(obj)
		} else {
			obj = LatLngBounds.latLngBounds(obj)
		}

		let sw = this._southWest,
		    ne = this._northEast,
		    sw2, ne2

		if (obj instanceof LatLngBounds) {
			sw2 = obj.southWest
			ne2 = obj.northEast
		} else {
			sw2 = ne2 = obj
		}

		return (sw2.lat >= sw.lat) && (ne2.lat <= ne.lat) &&
		       (sw2.lng >= sw.lng) && (ne2.lng <= ne.lng)
	}

	intersects(bounds) { // (LatLngBounds) -> Boolean
		bounds = LatLngBounds.latLngBounds(bounds)

		let sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.southWest,
		    ne2 = bounds.northEast,

		    latIntersects = (ne2.lat >= sw.lat) && (sw2.lat <= ne.lat),
		    lngIntersects = (ne2.lng >= sw.lng) && (sw2.lng <= ne.lng)

		return latIntersects && lngIntersects
	}

	overlaps(bounds) { // (LatLngBounds) -> Boolean
		bounds = LatLngBounds.latLngBounds(bounds)

		let sw = this._southWest,
		    ne = this._northEast,
		    sw2 = bounds.southWest,
		    ne2 = bounds.northEast,

		    latOverlaps = (ne2.lat > sw.lat) && (sw2.lat < ne.lat),
		    lngOverlaps = (ne2.lng > sw.lng) && (sw2.lng < ne.lng)

		return latOverlaps && lngOverlaps
	}

	toBBoxString() { return [this.west, this.south, this.east, this.north].join(',') }

	equals(bounds) { // (LatLngBounds)
		if (!bounds) { return false }

		bounds = LatLngBounds.latLngBounds(bounds)

		return this._southWest.equals(bounds.southWest) &&
		       this._northEast.equals(bounds.northEast)
	}

	isValid() { return !!(this._southWest && this._northEast) }

  // TODO International date line?

	//static bounds(a, b) { // (LatLngBounds) or (LatLng, LatLng)
	static latLngBounds(a, b) { // (LatLngBounds) or (LatLng, LatLng)
		if (!a || a instanceof LatLngBounds) {
			return a
		}
		return new LatLngBounds(a, b)
	}
}

