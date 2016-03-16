/*
 * L.CRS.EPSG3857 (Spherical Mercator) is the most common CRS for web mapping and is used by Leaflet by default.
 */
import {Transformation} from '../../geometry/Transformation'
import {SphericalMercator} from '../projection/Projection.SphericalMercator'
import {Earth} from './CRS.Earth'

export class EPSG3857 extends Earth {

	constructor() {
		super()
		this.code = 'EPSG:3857'
		this.projection = new SphericalMercator()

		let scale = 0.5 / (Math.PI * this.projection.R)
		this.transformation = new Transformation(scale, 0.5, -scale, 0.5)
	}
}

export class EPSG900913 extends EPSG3857 {

	constructor() {
		super()
		this.code = 'EPSG:900913'
	}
}
