/*
 * L.CRS.Earth is the base class for all CRS representing Earth.
 */
import { CRS } from './CRS';

export class Earth extends CRS {
  
  constructor( wraplng = [-180, 180], wraplat = false, r = 6378137 ) {
    super(wraplng, wraplat, r);  
    //constructor() {
    //super( [-180, 180], false );
    //super();
    //this.wrapLng = [-180, 180];
    //this.wraplat = false;
    //this.R = 6378137;
  }

	// distance between two geographical points using spherical law of cosines approximation
	distance(latlng1, latlng2) {
		let rad = Math.PI / 180,
		    lat1 = latlng1.lat * rad,
		    lat2 = latlng2.lat * rad,
		    a = Math.sin(lat1) * Math.sin(lat2) +
		        Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);

		return this.R * Math.acos(Math.min(a, 1));
	}
}
