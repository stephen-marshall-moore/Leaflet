"use strict"

import {Path} from 'src/layer/vector/Path'

describe('Path', function () {
	describe('#bringToBack', function () {
		it('is a no-op for layers not on a map', function () {
			let path = new Path()
			expect(path.bringToBack()).to.equal(path)
		})
	})

	describe('#bringToFront', function () {
		it('is a no-op for layers not on a map', function () {
			let path = new Path()
			expect(path.bringToFront()).to.equal(path)
		})
	})
})
