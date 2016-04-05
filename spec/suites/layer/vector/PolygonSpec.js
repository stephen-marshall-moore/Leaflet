"use strict"

import {LatLng} from 'src/geo/LatLng'
import {Polyline} from 'src/layer/vector/Polyline'
import {Polygon} from 'src/layer/vector/Polygon'
import {RendererMixin} from 'src/layer/vector/RendererMixin'
import {Map as MapBase} from 'src/map/Map'

describe('Polygon', function () {
	
	class Map extends RendererMixin(MapBase) {}

	let c = document.createElement('div')
	c.style.width = '400px'
	c.style.height = '400px'
	let map = new Map(c)
	map.view = {center: new LatLng(55.8, 37.6), zoom: 6}

	describe("#initialize", function () {
		it("should never be flat", function () {
			let latLngs = [[1, 2], [3, 4]]

			let polygon = new Polygon(latLngs)

			expect(Polyline._flat(polygon._latlngs)).to.be(false)
			expect(polygon.latLngs).to.eql(polygon._latlngs)
		})

		it("doesn't overwrite the given latlng array", function () {
			let originalLatLngs = [
				[1, 2],
				[3, 4]
			]
			let sourceLatLngs = originalLatLngs.slice()

			let polygon = new Polygon(sourceLatLngs)

			expect(sourceLatLngs).to.eql(originalLatLngs)
			expect(polygon._latlngs).to.not.eql(sourceLatLngs)
		})

		it("can be called with an empty array", function () {
			let polygon = new Polygon([])
			expect(polygon._latlngs).to.eql([[]])
			expect(polygon.latLngs).to.eql(polygon._latlngs)
		})

		it("can be initialized with holes", function () {
			let originalLatLngs = [
				[[0, 10], [10, 10], [10, 0]], // external ring
				[[2, 3], [2, 4], [3, 4]] // hole
			]

			let polygon = new Polygon(originalLatLngs)

			expect(polygon._latlngs).to.eql([
				[LatLng.latLng([0, 10]), LatLng.latLng([10, 10]), LatLng.latLng([10, 0])],
				[LatLng.latLng([2, 3]), LatLng.latLng([2, 4]), LatLng.latLng([3, 4])]
			])
			expect(polygon.latLngs).to.eql(polygon._latlngs)
		})

		it("can be initialized with multi including hole", function () {
			let latLngs = [
				[[[10, 20], [30, 40], [50, 60]]],
				[[[0, 10], [10, 10], [10, 0]], [[2, 3], [2, 4], [3, 4]]]
			]

			let polygon = new Polygon(latLngs)

			expect(polygon._latlngs).to.eql([
				[[LatLng.latLng([10, 20]), LatLng.latLng([30, 40]), LatLng.latLng([50, 60])]],
				[[LatLng.latLng([0, 10]), LatLng.latLng([10, 10]), LatLng.latLng([10, 0])], [LatLng.latLng([2, 3]), LatLng.latLng([2, 4]), LatLng.latLng([3, 4])]]
			])
			expect(polygon.latLngs).to.eql(polygon._latlngs)
		})

		it("can be added to the map when empty", function () {
			let polygon = new Polygon([]).addTo(map)
			expect(map.hasLayer(polygon)).to.be(true)
		})

	})

	describe("#isEmpty", function () {

		it('should return true for a polygon with no latlngs', function () {
			let layer = new Polygon([])
			expect(layer.isEmpty()).to.be(true)
		})

		it('should return false for simple polygon', function () {
			let latLngs = [[1, 2], [3, 4], [5, 6]]
			let layer = new Polygon(latLngs)
			expect(layer.isEmpty()).to.be(false)
		})

		it('should return false for a multi-polygon', function () {
			let latLngs = [
				[[[10, 20], [30, 40], [50, 60]]],
				[[[0, 10], [10, 10], [10, 0]], [[2, 3], [2, 4], [3, 4]]]
			]
			let layer = new Polygon(latLngs)
			expect(layer.isEmpty()).to.be(false)
		})

	})

	describe("#set LatLngs", function () {
		it("doesn't overwrite the given latlng array", function () {
			let originalLatLngs = [
				[1, 2],
				[3, 4]
			]
			let sourceLatLngs = originalLatLngs.slice()

			let polygon = new Polygon(sourceLatLngs)

			polygon.latLngs = sourceLatLngs

			expect(sourceLatLngs).to.eql(originalLatLngs)
		})

		it("can be set external ring and holes", function () {
			let latLngs = [
				[[0, 10], [10, 10], [10, 0]], // external ring
				[[2, 3], [2, 4], [3, 4]] // hole
			]

			let polygon = new Polygon([])
			polygon.latLngs = latLngs

			expect(polygon.latLngs).to.eql([
				[LatLng.latLng([0, 10]), LatLng.latLng([10, 10]), LatLng.latLng([10, 0])],
				[LatLng.latLng([2, 3]), LatLng.latLng([2, 4]), LatLng.latLng([3, 4])]
			])
		})

		it("can be set multi including hole", function () {
			let latLngs = [
				[[[10, 20], [30, 40], [50, 60]]],
				[[[0, 10], [10, 10], [10, 0]], [[2, 3], [2, 4], [3, 4]]]
			]

			let polygon = new Polygon([])
			polygon.latLngs = latLngs

			expect(polygon.latLngs).to.eql([
				[[LatLng.latLng([10, 20]), LatLng.latLng([30, 40]), LatLng.latLng([50, 60])]],
				[[LatLng.latLng([0, 10]), LatLng.latLng([10, 10]), LatLng.latLng([10, 0])], [LatLng.latLng([2, 3]), LatLng.latLng([2, 4]), LatLng.latLng([3, 4])]]
			])
		})

	})

	describe('#get Center', function () {

		it('should compute center of a big simple polygon around equator', function () {
			let latlngs = [
				[[0, 0], [10, 0], [10, 10], [0, 10]]
			]
			let layer = new Polygon(latlngs)
			layer.addTo(map)
			expect(layer.center).to.be.nearLatLng(LatLng.latLng([5, 5]), 1e-1)
		})

		it('should compute center of a small simple polygon', function () {
			let latlngs = [
				[[0, 0], [0.010, 0], [0.010, 0.010], [0, 0.010]]
			]
			let layer = new Polygon(latlngs)
			layer.addTo(map)
			map.zoom = 0  // Make the polygon disappear in screen.
			expect(layer.center).to.be.nearLatLng(LatLng.latLng([0, 0]))
		})

	})

	describe("#_defaultShape", function () {

		it("should return latlngs on a simple polygon", function () {
			let latlngs = [
				LatLng.latLng([1, 2]),
				LatLng.latLng([3, 4])
			]

			let polygon = new Polygon(latlngs)

			expect(polygon._defaultShape()).to.eql(latlngs)
		})

		it("should return first latlngs on a polygon with hole", function () {
			let latlngs = [
				[LatLng.latLng([0, 12]), LatLng.latLng([13, 14]), LatLng.latLng([15, 16])],
				[LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])]
			]

			let polygon = new Polygon(latlngs)

			expect(polygon._defaultShape()).to.eql(latlngs[0])
		})

		it("should return first latlngs on a multipolygon", function () {
			let latlngs = [
				[[LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])]],
				[[LatLng.latLng([11, 12]), LatLng.latLng([13, 14]), LatLng.latLng([15, 16])]]
			]

			let polygon = new Polygon(latlngs)

			expect(polygon._defaultShape()).to.eql(latlngs[0][0])
		})

		it("should return first latlngs on a multipolygon with hole", function () {
			let latlngs = [
				[[LatLng.latLng([0, 10]), LatLng.latLng([10, 10]), LatLng.latLng([10, 0])],
				 [LatLng.latLng([2, 3]), LatLng.latLng([2, 4]), LatLng.latLng([3, 4])]],
				[[LatLng.latLng([10, 20]), LatLng.latLng([30, 40]), LatLng.latLng([50, 60])]]
			]

			let polygon = new Polygon(latlngs)

			expect(polygon._defaultShape()).to.eql(latlngs[0][0])
		})

	})

	describe("#addLatLng", function () {
		it("should add latlng to latlngs", function () {
			let latLngs = [
				[1, 2],
				[3, 4]
			]

			let polygon = new Polygon(latLngs)

			polygon.addLatLng([5, 6])

			expect(polygon._latlngs).to.eql([[LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])]])
		})

		it("should add latlng to first latlngs on a polygon with hole", function () {
			let latLngs = [
				[[0, 12], [13, 14], [15, 16]],
				[[1, 2], [3, 4], [5, 6]]
			]

			let polygon = new Polygon(latLngs)

			polygon.addLatLng([17, 0])

			expect(polygon._latlngs[0]).to.eql([LatLng.latLng([0, 12]), LatLng.latLng([13, 14]), LatLng.latLng([15, 16]), LatLng.latLng([17, 0])])
			expect(polygon._latlngs[1]).to.eql([LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])])
		})

		it("should add latlng by reference on a polygon with hole", function () {
			let latLngs = [
				[[0, 12], [13, 14], [15, 16]],
				[[1, 2], [3, 4], [5, 6]]
			]

			let polygon = new Polygon(latLngs)

			polygon.addLatLng([7, 8], polygon._latlngs[1])

			expect(polygon._latlngs[0]).to.eql([LatLng.latLng([0, 12]), LatLng.latLng([13, 14]), LatLng.latLng([15, 16])])
			expect(polygon._latlngs[1]).to.eql([LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6]), LatLng.latLng([7, 8])])
		})

		it("should add latlng to first latlngs on a multi", function () {
			let latLngs = [
				[[[1, 2], [3, 4]]],
				[[[11, 12], [13, 14], [15, 16]]]
			]

			let polygon = new Polygon(latLngs)

			polygon.addLatLng([5, 6])

			expect(polygon._latlngs[0]).to.eql([[LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])]])
			expect(polygon._latlngs[1]).to.eql([[LatLng.latLng([11, 12]), LatLng.latLng([13, 14]), LatLng.latLng([15, 16])]])
		})

		it("should add latlng to latlngs by reference on a multi", function () {
			let latLngs = [
				[[[11, 12], [13, 14], [15, 16]]],
				[[[1, 2], [3, 4]]]
			]

			let polygon = new Polygon(latLngs)

			polygon.addLatLng([5, 6], polygon._latlngs[1][0])

			expect(polygon._latlngs[1]).to.eql([[LatLng.latLng([1, 2]), LatLng.latLng([3, 4]), LatLng.latLng([5, 6])]])
			expect(polygon._latlngs[0]).to.eql([[LatLng.latLng([11, 12]), LatLng.latLng([13, 14]), LatLng.latLng([15, 16])]])
		})

		it("should add latlng on first latlngs by default on a multipolygon with hole", function () {
			let latLngs = [
				[[[0, 10], [10, 10], [10, 0]], [[2, 3], [2, 4], [3, 4]]],
				[[[10, 20], [30, 40], [50, 60]]]
			]

			let polygon = new Polygon(latLngs)

			polygon.addLatLng([-10, -10])

			expect(polygon._latlngs[0][0]).to.eql([LatLng.latLng([0, 10]), LatLng.latLng([10, 10]), LatLng.latLng([10, 0]), LatLng.latLng([-10, -10])])
			expect(polygon._latlngs[0][1]).to.eql([LatLng.latLng([2, 3]), LatLng.latLng([2, 4]), LatLng.latLng([3, 4])])
			expect(polygon._latlngs[1][0]).to.eql([LatLng.latLng([10, 20]), LatLng.latLng([30, 40]), LatLng.latLng([50, 60])])
		})

		it("should add latlng by reference on a multipolygon with hole", function () {
			let latLngs = [
				[[[10, 20], [30, 40], [50, 60]]],
				[[[0, 10], [10, 10], [10, 0]], [[2, 3], [2, 4], [3, 4]]]
			]

			let polygon = new Polygon(latLngs)

			polygon.addLatLng([2, 2], polygon._latlngs[1][1])

			expect(polygon._latlngs[0][0]).to.eql([LatLng.latLng([10, 20]), LatLng.latLng([30, 40]), LatLng.latLng([50, 60])])
			expect(polygon._latlngs[1][0]).to.eql([LatLng.latLng([0, 10]), LatLng.latLng([10, 10]), LatLng.latLng([10, 0])])
			expect(polygon._latlngs[1][1]).to.eql([LatLng.latLng([2, 3]), LatLng.latLng([2, 4]), LatLng.latLng([3, 4]), LatLng.latLng([2, 2])])
		})

	})

})
