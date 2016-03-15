"use strict";

import { LatLng } from 'src/geo/LatLng'
import { Earth } from 'src/geo/crs/CRS.Earth'

describe('LatLng', function () {

	describe('constructor', function () {
		it("sets lat and lng", function () {
			let a = new LatLng(25, 74)
			expect(a.lat).to.eql(25)
			expect(a.lng).to.eql(74)

			let b = new LatLng(-25, -74)
			expect(b.lat).to.eql(-25)
			expect(b.lng).to.eql(-74)
		})

		it('throws an error if invalid lat or lng', function () {
			expect(function () {
				let a = new LatLng(NaN, NaN)
			}).to.throwError()
		})

		it('throws an error if invalid lat is not number', function () {
			expect(function () {
				let a = new LatLng('ponyfoo', 25)
			}).to.throwError()
		})

		it('does not set altitude if undefined', function () {
			let a = new LatLng(25, 74)
			expect(typeof a.alt).to.eql('undefined')
		})

		it('sets altitude', function () {
			let a = new LatLng(25, 74, 50)
			expect(a.alt).to.eql(50)

			let b = new LatLng(-25, -74, -50)
			expect(b.alt).to.eql(-50)
		})

	})

	describe('#equals', function () {
		it("returns true if compared objects are equal within a certain margin", function () {
			let a = new LatLng(10, 20)
			let b = new LatLng(10 + 1.0E-10, 20 - 1.0E-10)
			expect(a.equals(b)).to.be(true)
		})

		it("returns false if compared objects are not equal within a certain margin", function () {
			let a = new LatLng(10, 20)
			let b = new LatLng(10, 23.3)
			expect(a.equals(b)).to.be(false)
		})

		it('returns false if passed non-valid object', function () {
			let a = new LatLng(10, 20)
			expect(a.equals(null)).to.eql(false)
		})
	})

	describe('#toString', function () {
		it('formats a string', function () {
			let a = new LatLng(10.333333333, 20.2222222)
			expect(a.toString(5)).to.eql('LatLng(10.333, 20.222)')
		})
	})

	describe('#distanceTo', function () {
		it('calculates distance in meters', function () {
    	let crs = new Earth()
			let a = new LatLng(50.5, 30.5)
			let b = new LatLng(50, 1)

			expect(Math.abs(Math.round(a.distanceTo(crs, b) / 1000) - 2084) < 5).to.eql(true)
		})

		it('does not return NaN if input points are equal', function () {
    	let crs = new Earth()
			let a = new LatLng(50.5, 30.5)
			let b = new LatLng(50.5, 30.5)

			expect(a.distanceTo(crs, b)).to.eql(0)
		})
	})

	describe('LatLng factory', function () {
		it('returns LatLng instance as is', function () {
			let a = new LatLng(50, 30)

			expect(LatLng.latLng(a)).to.eql(a)
		})

		it('accepts an array of coordinates', function () {
			expect(LatLng.latLng([])).to.eql(null)
			expect(LatLng.latLng([50])).to.eql(null)
			expect(LatLng.latLng([50, 30])).to.eql(new LatLng(50, 30))
			expect(LatLng.latLng([50, 30, 100])).to.eql(new LatLng(50, 30, 100))
		})

		it('passes null or undefined as is', function () {
			expect(LatLng.latLng(undefined)).to.eql(undefined)
			expect(LatLng.latLng(null)).to.eql(null)
		})

		it('creates a LatLng object from two coordinates', function () {
			expect(LatLng.latLng(50, 30)).to.eql(new LatLng(50, 30))
		})

		it('accepts an object with lat/lng', function () {
			expect(LatLng.latLng({lat: 50, lng: 30})).to.eql(new LatLng(50, 30))
		})

		it('accepts an object with lat/lon', function () {
			expect(LatLng.latLng({lat: 50, lon: 30})).to.eql(new LatLng(50, 30))
		})

		it('returns null if lng not specified', function () {
			expect(LatLng.latLng(50)).to.be(null)
		})

		it('accepts altitude as third parameter', function () {
			expect(LatLng.latLng(50, 30, 100)).to.eql(new LatLng(50, 30, 100))
		})

		it('accepts an object with alt', function () {
			expect(LatLng.latLng({lat: 50, lng: 30, alt: 100})).to.eql(new LatLng(50, 30, 100))
			expect(LatLng.latLng({lat: 50, lon: 30, alt: 100})).to.eql(new LatLng(50, 30, 100))
		})
	})

	describe('#clone', function () {

		it('should clone attributes', function () {
			let a = new LatLng(50.5, 30.5, 100)
			let b = a.clone()

			expect(b.lat).to.eql(50.5)
			expect(b.lng).to.eql(30.5)
			expect(b.alt).to.eql(100)
		})

		it('should create another reference', function () {
			let a = new LatLng(50.5, 30.5, 100)
			let b = a.clone()

			expect(a === b).to.be(false)
		})

	})

})

