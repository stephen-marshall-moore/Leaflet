import { Point } from '../../../src/geometry/Point';
import { Transformation } from '../../../src/geometry/Transformation';

describe("Transformation", () => {
	let t, p;

	beforeEach(() => {
		t = new Transformation(1, 2, 3, 4);
		p = new Point(10, 20);
	})

	describe('#transform', () => {
		it("performs a transformation", () => {
			let p2 = t.transform(p, 2);
			expect(p2).toEqual(new Point(24, 128));
		})
		it('assumes a scale of 1 if not specified', () => {
			let p2 = t.transform(p);
			expect(p2).toEqual(new Point(12, 64));
		})
	})

	describe('#untransform', () => {
		it("performs a reverse transformation", () => {
			let p2 = t.transform(p, 2);
			let p3 = t.untransform(p2, 2);
			expect(p3).toEqual(p);
		})
		it('assumes a scale of 1 if not specified', () => {
			let p2 = t.transform(p);
			expect(t.untransform(new Point(12, 64))).toEqual(new Point(10, 20));
		})
	})
})
