/*
 * L.CRS.EPSG4326 is a CRS popular among advanced GIS specialists.
 */

L.CRS.EPSG4326 = L.extend({}, L.CRS.Earth, {
	code: 'EPSG:4326',
	projection: L.Projection.LonLat,
	transformation: new L.Transformation(1 / 180, 1, -1 / 180, 0.5)
});

import Earth from './CRS.Earth';

export class EPSG4326 extends Earth {
  
  constructor() {
    super();
    this.code = 'EPSG:4326';
    this.projection = new LonLat();
    this.transformation = new Transformation(1 / 180, 0.5, -1 / 180, 0.5);
  }
}

