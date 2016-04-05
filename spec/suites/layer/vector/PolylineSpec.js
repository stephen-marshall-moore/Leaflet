"use strict"

import {LatLng} from 'src/geo/LatLng'
import {Polyline} from 'src/layer/vector/Polyline'
import {RendererMixin} from 'src/layer/vector/RendererMixin'
import {Map as MapBase} from 'src/map/Map'

describe('Polyline', function () {
	
	class Map extends RendererMixin(MapBase) {}

	let c = document.createElement('div')
	c.style.width = '400px'
	c.style.height = '400px'
	let map = new Map(c)
	map.view = {center: new LatLng(55.8, 37.6), zoom: 6}

	describe("#initialize", function () {
		it("doesn't overwrite the given latlng array", function () {
			let originalLatLngs = [
				[1, 2],
				[3, 4]
			]
			let sourceLatLngs = originalLatLngs.slice()

			let polyline = new Polyline(sourceLatLngs)

			expect(sourceLatLngs).to.eql(originalLatLngs)
			expect(polyline._latlngs).to.not.eql(sourceLatLngs)
			expect(polyline.latLngs).to.eql(polyline._latlngs)
		})

		it("should accept a multi", function () {
			let latLngs = [
				[[1, 2], [3, 4], [5, 6]],
				[[11, 12], [13, 14], [15, 16]]
			]

			let polyline = new Polyline(latLngs)

			expect(polyline._latlngs[0]).to.eql([LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])])
			expect(polyline._latlngs[1]).to.eql([LatLng.latLng([11, 12]), LatLng.latLng([13, 14]), LatLng.latLng([15, 16])])
			expect(polyline.latLngs).to.eql(polyline._latlngs)
		})

		it("should accept an empty array", function () {

			let polyline = new Polyline([])

			expect(polyline._latlngs).to.eql([])
			expect(polyline.latLngs).to.eql(polyline._latlngs)
		})

		it("can be added to the map when empty", function () {
			let polyline = new Polyline([]).addTo(map)
			expect(map.hasLayer(polyline)).to.be(true)
		})

	})

	describe("#isEmpty", function () {

		it('should return true for a polyline with no latlngs', function () {
			let polyline = new Polyline([])
			expect(polyline.isEmpty()).to.be(true)
		})

		it('should return false for simple polyline', function () {
			let latLngs = [[1, 2], [3, 4]]
			let polyline = new Polyline(latLngs)
			expect(polyline.isEmpty()).to.be(false)
		})

		it('should return false for multi-polyline', function () {
			let latLngs = [
				[[1, 2], [3, 4]],
				[[11, 12], [13, 14]]
			]
			let polyline = new Polyline(latLngs)
			expect(polyline.isEmpty()).to.be(false)
		})

	})

	describe("#set LatLngs", function () {
		it("doesn't overwrite the given latlng array", function () {
			let originalLatLngs = [
				[1, 2],
				[3, 4]
			]
			let sourceLatLngs = originalLatLngs.slice()

			let polyline = new Polyline(sourceLatLngs)

			polyline.latLngs = sourceLatLngs

			expect(sourceLatLngs).to.eql(originalLatLngs)
		})

		it("can be set a multi", function () {
			let latLngs = [
				[[1, 2], [3, 4], [5, 6]],
				[[11, 12], [13, 14], [15, 16]]
			]

			let polyline = new Polyline([])
			polyline.latLngs = latLngs

			expect(polyline._latlngs[0]).to.eql([LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])])
			expect(polyline._latlngs[1]).to.eql([LatLng.latLng([11, 12]), LatLng.latLng([13, 14]), LatLng.latLng([15, 16])])
		})
	})

	describe('#get Center', function () {

		it('should compute center of a big flat line on equator', function () {
			let polyline = new Polyline([[0, 0], [0, 90]]).addTo(map)
			expect(polyline.center).to.eql(LatLng.latLng([0, 45]))
		})

		it('should compute center of a big flat line close to the pole', function () {
			let polyline = new Polyline([[80, 0], [80, 90]]).addTo(map)
			expect(polyline.center).to.be.nearLatLng(LatLng.latLng([80, 45]), 1e-2)
		})

		it('should compute center of a big diagonal line', function () {
			let polyline = new Polyline([[0, 0], [80, 80]])
			polyline.addTo(map)
			expect(polyline.center).to.be.nearLatLng(LatLng.latLng([57, 40]), 1)
		})

		it('should compute center of a diagonal line close to the pole', function () {
			let polyline = new Polyline([[70, 70], [84, 84]]).addTo(map)
			expect(polyline.center).to.be.nearLatLng(LatLng.latLng([79, 77]), 1)
		})

		it('should compute center of a big multiline', function () {
			let polyline = new Polyline([[10, -80], [0, 0], [0, 10], [10, 90]]).addTo(map)
			expect(polyline.center).to.be.nearLatLng(LatLng.latLng([0, 5]), 1)
		})

		it('should compute center of a small flat line', function () {
			let polyline = new Polyline([[0, 0], [0, 0.090]]).addTo(map)
			map.zoom = 0  // Make the line disappear in screen
			expect(polyline.center).to.be.nearLatLng(LatLng.latLng([0, 0]), 1e-2)
		})

	})

	describe('#_flat', function () {
		let layer = new Polyline([])

		it('should return true for an array of LatLngs', function () {
			expect(Polyline._flat([LatLng.latLng([0, 0])])).to.be(true)
		})

		it('should return true for an array of LatLngs arrays', function () {
			expect(Polyline._flat([[0, 0]])).to.be(true)
		})

		it('should return true for an empty array', function () {
			expect(Polyline._flat([])).to.be(true)
		})

		it('should return false for a nested array of LatLngs', function () {
			expect(Polyline._flat([[LatLng.latLng([0, 0])]])).to.be(false)
		})

		it('should return false for a nested empty array', function () {
			expect(Polyline._flat([[]])).to.be(false)
		})

	})

	describe("#_defaultShape", function () {

		it("should return latlngs when flat", function () {
			let latLngs = [LatLng.latLng([1, 2]), LatLng.latLng([3, 4])]

			let polyline = new Polyline(latLngs)

			expect(polyline._defaultShape()).to.eql(latLngs)
		})

		it("should return first latlngs on a multi", function () {
			let latLngs = [
				[LatLng.latLng([1, 2]), LatLng.latLng([3, 4])],
				[LatLng.latLng([11, 12]), LatLng.latLng([13, 14])]
			]

			let polyline = new Polyline(latLngs)

			expect(polyline._defaultShape()).to.eql(latLngs[0])
		})

	})

	describe("#addLatLng", function () {

		it("should add latlng to latlngs", function () {
			let latLngs = [
				[1, 2],
				[3, 4]
			]

			let polyline = new Polyline(latLngs)

			polyline.addLatLng([5, 6])

			expect(polyline._latlngs).to.eql([LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])])
		})

		it("should add latlng to first latlngs on a multi", function () {
			let latLngs = [
				[[1, 2], [3, 4]],
				[[11, 12], [13, 14]]
			]

			let polyline = new Polyline(latLngs)

			polyline.addLatLng([5, 6])

			expect(polyline._latlngs[0]).to.eql([LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])])
			expect(polyline._latlngs[1]).to.eql([LatLng.latLng([11, 12]), LatLng.latLng([13, 14])])
		})

		it("should add latlng to latlngs by reference", function () {
			let latLngs = [
				[[11, 12], [13, 14]],
				[[1, 2], [3, 4]]
			]

			let polyline = new Polyline(latLngs)

			polyline.addLatLng([5, 6], polyline._latlngs[1])

			expect(polyline._latlngs[1]).to.eql([LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])])
			expect(polyline._latlngs[0]).to.eql([LatLng.latLng([11, 12]), LatLng.latLng([13, 14])])
		})

		it("should add latlng on empty polyline", function () {
			let polyline = new Polyline([])

			polyline.addLatLng([1, 2])

			expect(polyline._latlngs).to.eql([LatLng.latLng([1, 2])])
		})

	})

})
