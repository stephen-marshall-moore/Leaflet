/*
 * L.CRS.EPSG4326 is a CRS popular among advanced GIS specialists.
 */
import { Transformation } from '../../geometry/Transformation';
import { LonLat } from '../projection/Projection.LonLat';
import { Earth } from './CRS.Earth';

export class EPSG4326 extends Earth {
  
  constructor() {
    super();
    this.code = 'EPSG:4326';
    this.projection = new LonLat();
    this.transformation = new Transformation(1 / 180, 0.5, -1 / 180, 0.5);
  }
}

