/*
 * Base for Projections
 */
import {Bounds} from '../../geometry/Bounds';

export class Projection {

	constructor(a) {
		this._bounds = Bounds.bounds(a);
	}

	get bounds() { return this._bounds; }
}

