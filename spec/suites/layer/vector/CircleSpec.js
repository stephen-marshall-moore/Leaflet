"use strict"

import {LatLng} from 'src/geo/LatLng'
import {Circle} from 'src/layer/vector/Circle'
import {RendererMixin} from 'src/layer/vector/RendererMixin'
import {Map as MapBase} from 'src/map/Map'

describe('Circle', function () {

	describe('#init', function () {

		it('uses default radius if not given', function () {
			let circle = new Circle([0, 0])
			expect(circle.radius).to.eql(10)
		})

	})

	describe('#getBounds', function () {

		class Map extends RendererMixin(MapBase) {}
		let map, circle

		beforeEach(function () {
			map = new Map(document.createElement('div'))
			map.view = {center: [0, 0], zoom: 4}
			circle = new Circle([50, 30], {radius: 200})
			circle.addTo(map)
		})

		it('returns bounds', function () {
			let bounds = circle.bounds

			expect(bounds.southWest).nearLatLng(new LatLng(49.94347, 29.91211))
			expect(bounds.northEast).nearLatLng(new LatLng(50.05646, 30.08789))
		})
	})

})
