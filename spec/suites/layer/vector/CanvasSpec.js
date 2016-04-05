"use strict"

import {DomEvent} from 'src/dom/DomEvent'
import {LatLng} from 'src/geo/LatLng'
import {Canvas} from 'src/layer/vector/Canvas'
import {Polygon} from 'src/layer/vector/Polygon'
import {RendererMixin} from 'src/layer/vector/RendererMixin'
import {Map as MapBase} from 'src/map/Map'

describe('Canvas', function () {
	
	class Map extends RendererMixin(MapBase) {}

	let c, map, p2ll, latLngs

	before(function () {
		c = document.createElement('div')
		c.style.width = '400px'
		c.style.height = '400px'
		c.style.position = 'absolute'
		c.style.top = '0'
		c.style.left = '0'
		document.body.appendChild(c)
		map = new Map(c, {preferCanvas: true, zoomControl: false})
		map.view = {center: [0, 0], zoom: 6}
		p2ll = function (x, y) {
			return map.layerPointToLatLng([x, y])
		}
		latLngs = [p2ll(0, 0), p2ll(0, 100), p2ll(100, 100), p2ll(100, 0)]
	})

	after(function () {
		document.body.removeChild(c)
	})

	describe("#events", function () {
		let layer

		beforeEach(function () {
			layer = new Polygon(latLngs).addTo(map)
		})

		afterEach(function () {
			layer.remove()
		})

		it("should fire event when layer contains mouse", function () {
			let spy = sinon.spy()
			layer.on('click', spy)
			happen.at('click', 50, 50)  // Click on the layer.
			expect(spy.callCount).to.eql(1)
			happen.at('click', 150, 150)  // Click outside layer.
			expect(spy.callCount).to.eql(1)
			layer.off("click", spy)
		})

		it("DOM events propagate from canvas polygon to map", function () {
			let spy = sinon.spy()
			map.on("click", spy)
			happen.at('click', 50, 50)
			expect(spy.callCount).to.eql(1)
			map.off("click", spy)
		})

		it("DOM events fired on canvas polygon can be cancelled before being caught by the map", function () {
			let mapSpy = sinon.spy()
			let layerSpy = sinon.spy()
			map.on("click", mapSpy)
			layer.on("click", DomEvent.stopPropagation).on("click", layerSpy)
			happen.at('click', 50, 50)
			expect(layerSpy.callCount).to.eql(1)
			expect(mapSpy.callCount).to.eql(0)
			map.off("click", mapSpy)
			layer.off("click", DomEvent.stopPropagation).off("click", layerSpy)
		})

		it("DOM events fired on canvas polygon are propagated only once to the map even when two layers contains the event", function () {
			let spy = sinon.spy()
			let layer2 = new Polygon(latLngs).addTo(map)
			map.on("click", spy)
			happen.at('click', 50, 50)
			expect(spy.callCount).to.eql(1)
			layer2.remove()
			map.off("click", spy)
		})

	})

	describe("#events(interactive=false)", function () {
		let layer

		beforeEach(function () {
			layer = new Polygon(latLngs, {interactive: false}).addTo(map)
		})

		afterEach(function () {
			layer.remove()
		})

		it("should not fire click when not interactive", function () {
			let spy = sinon.spy()
			layer.on('click', spy)
			happen.at('click', 50, 50)  // Click on the layer.
			expect(spy.callCount).to.eql(0)
			happen.at('click', 150, 150)  // Click outside layer.
			expect(spy.callCount).to.eql(0)
			layer.off("click", spy)
		})

	})

})
