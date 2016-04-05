"use strict"

import {CircleMarker} from 'src/layer/vector/CircleMarker'
import {RendererMixin} from 'src/layer/vector/RendererMixin'
import {Map as MapBase} from 'src/map/Map'

﻿describe('CircleMarker', function () {
	describe("#_radius", function () {
		class Map extends RendererMixin(MapBase) {}

		let map

		beforeEach(function () {
			map = new Map(document.createElement('div'))
			map.view = {center: [0, 0], zoom: 1}
		})

		describe("when a CircleMarker is added to the map ", function () {
			describe("with a radius set as an option", function () {
				it("takes that radius", function () {
					let marker = new CircleMarker([0, 0], {radius: 20})
					marker.addTo(map)

					expect(marker._radius).to.be(20)
				})
			})

			describe("and radius is set before adding it", function () {
				it("takes that radius", function () {
					let marker = new CircleMarker([0, 0], {radius: 20})
					marker.radius = 15
					marker.addTo(map)
					expect(marker._radius).to.be(15)
				})
			})

			describe("and radius is set after adding it", function () {
				it("takes that radius", function () {
					let marker = new CircleMarker([0, 0], {radius: 20})
					marker.addTo(map)
					marker.radius = 15
					expect(marker._radius).to.be(15)
				})
			})

			describe("and setStyle is used to change the radius after adding", function () {
				it("takes the given radius", function () {
					let marker = new CircleMarker([0, 0], {radius: 20})
					marker.addTo(map)
					marker.style = {radius: 15}
					expect(marker._radius).to.be(15)
				})
			})

			describe("and setStyle is used to change the radius before adding", function () {
				it("takes the given radius", function () {
					let marker = new CircleMarker([0, 0], {radius: 20})
					marker.style = {radius: 15}
					marker.addTo(map)
					expect(marker._radius).to.be(15)
				})
			})
		})
	})
})
