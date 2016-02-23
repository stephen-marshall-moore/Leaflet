/*
 * L.CRS.EPSG3857 (World Mercator) CRS implementation.
 */
import {Transformation} from '../../geometry/Transformation';
import {Mercator} from '../projection/Projection.Mercator';
import {Earth} from './CRS.Earth';

export class EPSG3395 extends Earth {

	constructor() {
		super();
		this.code = 'EPSG:3395';
		this.projection = new Mercator();

		let scale = 0.5 / (Math.PI * this.projection.R);
		this.transformation = new Transformation(scale, 0.5, -scale, 0.5);
	}
}

