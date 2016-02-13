import { Point } from '../../../src/geometry/Point';
import { Bounds } from '../../../src/geometry/Bounds';
import { LineUtil } from '../../../src/geometry/LineUtil';

describe('LineUtil', () => {

	describe('#clipSegment', () => {

		let bounds;
    let lu;

		beforeEach( () => {
			bounds = Bounds.bounds([5, 0], [15, 10]);
      lu = new LineUtil();
		});

		it('clips a segment by bounds', () => {
			let a = new Point(0, 0);
			let b = new Point(15, 15);

			let segment = lu.clipSegment(a, b, bounds);

			expect(segment[0]).toEqual(new Point(5, 5));
			expect(segment[1]).toEqual(new Point(10, 10));

			let c = new Point(5, -5);
			let d = new Point(20, 10);

			let segment2 = lu.clipSegment(c, d, bounds);

			expect(segment2[0]).toEqual(new Point(10, 0));
			expect(segment2[1]).toEqual(new Point(15, 5));
		});

		it('uses last bit code and reject segments out of bounds', () => {
			let a = new Point(15, 15);
			let b = new Point(25, 20);
      lu._lastCode = 0;
			let segment = lu.clipSegment(a, b, bounds, true);

			expect(segment).toBe(false);
		});

		it('can round numbers in clipped bounds', () => {
			let a = new Point(4, 5);
			let b = new Point(8, 6);

			let segment1 = lu.clipSegment(a, b, bounds);

			expect(segment1[0]).toEqual(new Point(5, 5.25));
			expect(segment1[1]).toEqual(b);

			let segment2 = lu.clipSegment(a, b, bounds, false, true);

			expect(segment2[0]).toEqual(new Point(5, 5));
			expect(segment2[1]).toEqual(b);
		});
	});

	describe('#pointToSegmentDistance & #closestPointOnSegment', () => {
		let p1 = new Point(0, 10);
		let p2 = new Point(10, 0);
		let p = new Point(0, 0);

		it('calculates distance from point to segment', () => {
			expect(LineUtil.pointToSegmentDistance(p, p1, p2)).toEqual(Math.sqrt(200) / 2);
		});

		it('calculates point closest to segment', () => {
			expect(LineUtil.closestPointOnSegment(p, p1, p2)).toEqual(new Point(5, 5));
		});
	});

	describe('#simplify', () => {
		it('simplifies polylines according to tolerance', () => {
			let points = [
				new Point(0, 0),
				new Point(0.01, 0),
				new Point(0.5, 0.01),
				new Point(0.7, 0),
				new Point(1, 0),
				new Point(1.999, 0.999),
				new Point(2, 1)
			];

			let simplified = LineUtil.simplify(points, 0.1);

			expect(simplified).toEqual([
				new Point(0, 0),
				new Point(1, 0),
				new Point(2, 1)
			]);
		});
	});

});
