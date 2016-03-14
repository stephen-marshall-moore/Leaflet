"use strict";

import {Point} from 'src/geometry/Point';
import {Bounds} from 'src/geometry/Bounds';
import {PolyUtil} from 'src/geometry/PolyUtil';

describe('PolyUtil', function () {

	describe('#clipPolygon', function () {
		it('clips polygon by bounds', function () {
			let bounds = Bounds.bounds([0, 0], [10, 10]);

			let points = [
				new Point(5, 5),
				new Point(15, 10),
				new Point(10, 15)
			];

			// check clip without rounding
			let clipped = PolyUtil.clipPolygon(points, bounds);

			for (let i = 0, len = clipped.length; i < len; i++) {
				delete clipped[i]._code;
			}

			expect(clipped).to.eql([
				new Point(7.5, 10),
				new Point(5, 5),
				new Point(10, 7.5),
				new Point(10, 10)
			]);

			// check clip with rounding
			let clippedRounded = PolyUtil.clipPolygon(points, bounds, true);

			for (let i = 0, len = clippedRounded.length; i < len; i++) {
				delete clippedRounded[i]._code;
			}

			expect(clippedRounded).to.eql([
				new Point(8, 10),
				new Point(5, 5),
				new Point(10, 8),
				new Point(10, 10)
			]);
		});
	});
});
