/*
 * A simple CRS that can be used for flat non-Earth maps like panoramas or game maps.
 */
import {CRS} from './CRS'
import {LonLat} from '../projection/Projection.LonLat'
import {Transformation} from '../../geometry/Transformation'

export class Simple extends CRS {

	constructor(wraplng = false, wraplat = false, p = new LonLat(), t = new Transformation(1, 0, -1, 0), infinite = true) {
		super(wraplng, wraplat)
		this.projection = p
		this.transformation = t
		this.infinite = infinite
	}

	scale(zoom) { return Math.pow(2, zoom) }

	zoom(scale) { return Math.log(scale) / Math.LN2 }

	distance(latlng1, latlng2) {
		let dx = latlng2.lng - latlng1.lng,
		    dy = latlng2.lat - latlng1.lat

		return Math.sqrt(dx * dx + dy * dy)
	}
}
