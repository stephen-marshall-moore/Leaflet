/*
 * Spherical Mercator is the most popular map projection, used by EPSG:3857 CRS used by default.
 */
import {Point} from '../../geometry/Point';
import {Bounds} from '../../geometry/Bounds';
import {LatLng} from '../LatLng';
import {Projection} from './Projection';

export class SphericalMercator extends Projection {

	constructor(r = 6378137, maxLatitude = 6356752.314245179, b = new Bounds([[-6378137 * Math.PI, -6378137 * Math.PI], [6378137 * Math.PI, 6378137 * Math.PI]])) {
		super(b);
		this.R = r;
		this.MAX_LATITUDE = maxLatitude;
	}

	project(latlng) {
		let d = Math.PI / 180,
		    max = this.MAX_LATITUDE,
		    lat = Math.max(Math.min(max, latlng.lat), -max),
		    sin = Math.sin(lat * d);

		return new Point(
				this.R * latlng.lng * d,
				this.R * Math.log((1 + sin) / (1 - sin)) / 2);
	}

	unproject(point) {
		let d = 180 / Math.PI;

		return new LatLng(
			(2 * Math.atan(Math.exp(point.y / this.R)) - (Math.PI / 2)) * d,
			point.x * d / this.R);
	}

}
