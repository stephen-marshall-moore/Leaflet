"use strict"

import {LatLng} from 'src/geo/LatLng'
import {Polyline} from 'src/layer/vector/Polyline'
import {RendererMixin} from 'src/layer/vector/RendererMixin'
import {Map as MapBase} from 'src/map/Map'

describe('PolylineGeometry', function () {
	
	class Map extends RendererMixin(MapBase) {}

	let c = document.createElement('div')
	c.style.width = '400px'
	c.style.height = '400px'
	let map = new Map(c)
	map.view = {center: new LatLng(55.8, 37.6), zoom: 6}

	describe("#distanceTo", function () {
		it("calculates distances to points", function () {
			let p1 = map.latLngToLayerPoint(new LatLng(55.8, 37.6))
			let p2 = map.latLngToLayerPoint(new LatLng(57.123076977278, 44.861962891635))
			let latlngs = [[56.485503424111, 35.545556640339], [55.972522915346, 36.116845702918], [55.502459116923, 34.930322265253], [55.31534617509, 38.973291015816]]
			.map(function (ll) {
				return new LatLng(ll[0], ll[1])
			})
			let polyline = new Polyline([], {
				'noClip': true
			})
			map.addLayer(polyline)

			expect(polyline.closestLayerPoint(p1)).to.be(null)

			polyline.latLngs = latlngs
			let point = polyline.closestLayerPoint(p1)
			expect(point).not.to.be(null)
			expect(point.distance).to.not.be(Infinity)
			expect(point.distance).to.not.be(NaN)

			let point2 = polyline.closestLayerPoint(p2)

			expect(point.distance).to.be.lessThan(point2.distance)
		})
	})
})
