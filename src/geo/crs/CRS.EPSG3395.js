/*
 * L.CRS.EPSG3857 (World Mercator) CRS implementation.
 */
import Earth from './CRS.Earth';

export class EPSG3395 extends Earth {
  
  constructor() {
    super();
    this.code = 'EPSG:3395';
    this.projection = new Mercator();
    this.transformation = () => {
      let scale = 0.5 / (Math.PI * this.projection.R);
      return new Transformation(scale, 0.5, -scale, 0.5);
    };
  }
}

