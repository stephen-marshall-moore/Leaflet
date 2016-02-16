/*
 * Base for Projections
 */
import LatLngBounds from '../LatLngBounds';

export class Projection {
  
  constructor( a, b ) {
    this.bounds = LatLngBounds.bounds(a, b);
  }

  get bounds() { return this.bounds; }
}

