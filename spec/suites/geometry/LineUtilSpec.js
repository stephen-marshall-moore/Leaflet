"use strict";

import {Point} from 'src/geometry/Point';
import {Bounds} from 'src/geometry/Bounds';
import {LineUtil} from 'src/geometry/LineUtil';

describe("LineUtil", function () {

	describe('#clipSegment', function () {

		let bounds;
    let lu;

		beforeEach( function () {
			bounds = Bounds.bounds([5, 0], [15, 10]);
      //lu = new LineUtil();
		});

		it('clips a segment by bounds', function () {
			let a = new Point(0, 0);
			let b = new Point(15, 15);

			let { segment: seg1, lastCode:lc1 } = LineUtil.clipSegment(a, b, bounds);
			//let ro = LineUtil.clipSegment(a, b, bounds);
			//let seg1 = ro.segment;
			//let lc1 = ro.lastCode;

			expect(seg1[0]).to.eql(new Point(5, 5));
			expect(seg1[1]).to.eql(new Point(10, 10));
			expect(lc1).to.eql(8);

			let c = new Point(5, -5);
			let d = new Point(20, 10);

			let { segment: seg2, lastCode:lc2 }  = LineUtil.clipSegment(c, d, bounds);
			//ro = LineUtil.clipSegment(a, b, bounds);
			//let seg2 = ro.segment;
			//let lc2 = ro.lastCode;

			expect(seg2[0]).to.eql(new Point(10, 0));
			expect(seg2[1]).to.eql(new Point(15, 5));
			expect(lc2).to.eql(2);
		});

		it('clips array of segments by bounds', function () {
			let a = new Point(0, 0);
			let b = new Point(15, 15);
			let c = new Point(5, -5);
			let d = new Point(20, 10);

			let testdata = [  { segment: [a.clone(), b.clone()], result: [new Point(5, 5),new Point(10, 10)], lastCode: 8 },
                        { segment: [c.clone(), d.clone()], result: [new Point(10, 0),new Point(15, 5)], lastCode: 2 } ];

      for( let td of testdata ) {

			  let { segment: seg1, lastCode:lc1 } = LineUtil.clipSegment(td.segment[0], td.segment[1], bounds);
				//let ro = LineUtil.clipSegment(a, b, bounds);
				//let seg1 = ro.segment;
				//let lc1 = ro.lastCode;

			  expect(seg1).to.eql(td.result);
			  expect(lc1).to.eql(td.lastCode);
      }
		});

		it('uses last bit code and reject segments out of bounds', function () {
			let a = new Point(15, 15);
			let b = new Point(25, 20);
      //lu._lastCode = 0;
			let { segment: s, lastCode:lc } = LineUtil.clipSegment(a, b, bounds, true, 8);

			expect(s).to.be(false);
		});

		it('can round numbers in clipped bounds', function () {
			let a = new Point(4, 5);
			let b = new Point(8, 6);

			let { segment: s1, lastCode:lc1 } = LineUtil.clipSegment(a, b, bounds);

			expect(s1[0]).to.eql(new Point(5, 5.25));
			expect(s1[1]).to.eql(b);

			let { segment: s2, lastCode:lc2 } = LineUtil.clipSegment(a, b, bounds, false, lc1, true);

			expect(s2[0]).to.eql(new Point(5, 5));
			expect(s2[1]).to.eql(b);
		});

	});
	
/**/
	describe('#pointToSegmentDistance and #closestPointOnSegment', function () {

		it('calculates distance from point to segment', function () {
			let p1 = new Point(0, 10);
			let p2 = new Point(10, 0);
			let p = new Point(0, 0);
			expect(LineUtil.pointToSegmentDistance(p, p1, p2)).to.eql(Math.sqrt(200) / 2);
		});

		it('calculates point closest to segment', function () {
			let p1 = new Point(0, 10);
			let p2 = new Point(10, 0);
			let p = new Point(0, 0);
			expect(LineUtil.closestPointOnSegment(p, p1, p2)).to.eql(new Point(5, 5));
		});
	});
/**/

	describe('#simplify', function () {
		it('simplifies polylines according to tolerance', function () {
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

			expect(simplified).to.eql([
				new Point(0, 0),
				new Point(1, 0),
				new Point(2, 1)
			]);
		});
	});
/**/

});
