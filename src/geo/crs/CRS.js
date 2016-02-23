/*
 * L.CRS is the base object for all defined CRS (Coordinate Reference Systems) in Leaflet.
 */
import {Util} from '../../core/Util';
import {Bounds} from '../../geometry/Bounds';
import {LatLng} from '../LatLng';

export class CRS {

	constructor(wraplng = false, wraplat = false, r = undefined) {
		this.wrapLng = wraplng;
		this.wrapLat = wraplat;
		this.R = r;
		this.infinite = false;
	}

	// converts geo coords to pixel ones
	latLngToPoint(latlng, zoom) {
		let projectedPoint = this.projection.project(latlng),
		    scale = this.scale(zoom);

		return this.transformation._transform(projectedPoint, scale);
	}

	// converts pixel coords to geo coords
	pointToLatLng(point, zoom) {
		let scale = this.scale(zoom),
		    untransformedPoint = this.transformation.untransform(point, scale);

		return this.projection.unproject(untransformedPoint);
	}

	// converts geo coords to projection-specific coords (e.g. in meters)
	project(latlng) { return this.projection.project(latlng); }

	// converts projected coords to geo coords
	unproject(point) { return this.projection.unproject(point); }

	// defines how the world scales with zoom
	scale(zoom) { return 256 * Math.pow(2, zoom); }

	zoom(scale) { return Math.log(scale / 256) / Math.LN2; }

	// returns the bounds of the world in projected coords if applicable
	getProjectedBounds(zoom) {
		if (this.infinite) { return null; }

		let b = this.projection.bounds,
		    s = this.scale(zoom),
		    min = this.transformation.transform(b.min, s),
		    max = this.transformation.transform(b.max, s);

		return Bounds.bounds(min, max);
	}

	// whether a coordinate axis wraps in a given range (e.g. longitude from -180 to 180); depends on CRS
	// wrapLng: [min, max],
	// wrapLat: [min, max],

	// if true, the coordinate space will be unbounded (infinite in all directions)
	// infinite: false,

	// wraps geo coords in certain ranges if applicable
	wrapLatLng(latlng) {
		let lng = this.wrapLng ? Util.wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng,
		    lat = this.wrapLat ? Util.wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat,
		    alt = latlng.alt;

		return LatLng.latLng(lat, lng, alt);
	}
}

