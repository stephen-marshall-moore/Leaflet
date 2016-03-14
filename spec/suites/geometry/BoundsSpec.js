"use strict"

import {Point} from 'src/geometry/Point'
import {Bounds} from 'src/geometry/Bounds'

describe('Bounds', function () {

	let a, b, c

	beforeEach(function () {
		a = new Bounds(
			new Point(14, 12),
			new Point(30, 40))
		b = new Bounds([
			new Point(20, 12),
			new Point(14, 20),
			new Point(30, 40)
		])
		c = new Bounds()
	})

	describe('constructor', function () {
		it('creates bounds with proper min & max on (Point, Point)', function () {
			expect(a.min).to.eql(new Point(14, 12))
			expect(a.max).to.eql(new Point(30, 40))
		})
		it('creates bounds with proper min & max on (Point[])', function () {
			expect(b.min).to.eql(new Point(14, 12))
			expect(b.max).to.eql(new Point(30, 40))
		})
	})

	describe('#extend', function () {
		it('extends the bounds to contain the given point', function () {
			a.extend(new Point(50, 20))
			expect(a.min).to.eql(new Point(14, 12))
			expect(a.max).to.eql(new Point(50, 40))

			b.extend(new Point(25, 50))
			expect(b.min).to.eql(new Point(14, 12))
			expect(b.max).to.eql(new Point(30, 50))
		})
	})

	describe('#getCenter', function () {
		it('returns the center point', function () {
			expect(a.getCenter()).to.eql(new Point(22, 26))
		})
	})

	describe('#contains', function () {
		it('contains other bounds or point', function () {
			a.extend(new Point(50, 10))
			expect(a.contains(b)).to.be.ok()
			expect(b.contains(a)).to.not.be.ok()
			expect(a.contains(new Point(24, 25))).to.be.ok()
			expect(a.contains(new Point(54, 65))).to.not.be.ok()
		})
	})

	describe('#isValid', function () {
		it('returns true if properly set up', function () {
			expect(a.isValid()).to.be.ok()
		})
		it('returns false if is invalid', function () {
			expect(c.isValid()).to.not.be.ok()
		})
		it('returns true if extended', function () {
			c.extend([0, 0])
			expect(c.isValid()).to.be.ok()
		})
	})

	describe('#getSize', function () {
		it('returns the size of the bounds as point', function () {
			expect(a.getSize()).to.eql(new Point(16, 28))
		})
	})

	describe('#intersects', function () {
		it('returns true if bounds intersect', function () {
			expect(a.intersects(b)).to.be(true)
			expect(a.intersects(new Bounds(new Point(100, 100), new Point(120, 120)))).to.eql(false)
		})
	})

	describe('Bounds factory', function () {
		it('creates bounds from array of number arrays', function () {
			var bounds = Bounds.bounds([[14, 12], [30, 40]])
			expect(bounds).to.eql(a)
		})
	})
})
