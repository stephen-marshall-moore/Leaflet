/*
 * Base for Projections
 */
//import LatLngBounds from '../LatLngBounds';

export class Projection {
  
  constructor( a ) {
    this._bounds = a;
    //this.bounds = LatLngBounds.bounds(a);
  }

  get bounds() { return this._bounds; }
}

