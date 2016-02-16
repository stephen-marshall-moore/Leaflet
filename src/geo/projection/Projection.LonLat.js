/*
 * Simple equirectangular (Plate Carree) projection, used by CRS like EPSG:4326 and Simple.
 */

import Point from '../../geometry/Point';
import LatLng from '../LatLng';
import Projection from './Projection';

export class LonLat extends Projection {

  constructor(a = [-180, -90] , b = [180, 90]) {
    super(a, b);
  }

  project(latlng) { return new Point(latlng.lng, latlng.lat); }

	unproject(point) { return new LatLng(point.y, point.x); }
}
