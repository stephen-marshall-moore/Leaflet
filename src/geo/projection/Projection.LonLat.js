/*
 * Simple equirectangular (Plate Carree) projection, used by CRS like EPSG:4326 and Simple.
 */

import {Point} from '../../geometry/Point';
import {Bounds} from '../../geometry/Bounds';
import {LatLng} from '../LatLng';
import {Projection} from './Projection';

export class LonLat extends Projection {

	constructor(a = new Bounds([[-180, -90], [180, 90]])) {
		super(a);
	}

	project(latlng) { return new Point(latlng.lng, latlng.lat); }

	unproject(point) { return new LatLng(point.y, point.x); }
}
