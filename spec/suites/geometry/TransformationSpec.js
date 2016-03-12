"use strict";

import {Point} from 'src/geometry/Point'
import {Transformation} from 'src/geometry/Transformation'

describe('Transformation', function () {

	let t, p;

	beforeEach(function () {
		t = new Transformation(1, 2, 3, 4);
		p = new Point(10, 20);
	})

	describe('#transform', function () {
		it("performs a transformation", function () {
			let p2 = t.transform(p, 2);
			expect(p2).to.eql(new Point(24, 128));
		})
		it('assumes a scale of 1 if not specified', function () {
			let p2 = t.transform(p);
			expect(p2).to.eql(new Point(12, 64));
		})
	})

	describe('#untransform', function () {
		it("performs a reverse transformation", function () {
			let p2 = t.transform(p, 2);
			let p3 = t.untransform(p2, 2);
			expect(p3).to.eql(p);
		})
		it('assumes a scale of 1 if not specified', function () {
			let p2 = t.transform(p);
			expect(t.untransform(new Point(12, 64))).to.eql(new Point(10, 20));
		})
	})
})
