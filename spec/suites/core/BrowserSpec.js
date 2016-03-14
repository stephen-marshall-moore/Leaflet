"use strict"
import {Browser} from 'src/core/Browser'

describe("Browser", function () {

	describe('#chrome', function () {
		it('currently testing only chrome', function () {
			expect(Browser.chrome).to.be(true)
		})
		it('not expecting mobile', function () {
			expect(Browser.mobile).to.be(false)
		})
  })
})
