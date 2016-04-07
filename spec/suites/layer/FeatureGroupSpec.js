import {Util} from 'src/core/Util'
import {Marker} from 'src/layer/marker/Marker'
import {LayerGroup} from 'src/layer/LayerGroup'
import {FeatureGroup} from 'src/layer/FeatureGroup'
import {Map} from 'src/map/Map'

﻿describe('FeatureGroup', function () {
	let map
	beforeEach(function () {
		map = new Map(document.createElement('div'))
		map.view = {center: [0, 0], zoom: 1}
	})
	describe("#_propagateEvent", function () {
		let marker
		beforeEach(function () {
			marker = new Marker([0, 0])
		})
		describe("when a Marker is added to multiple FeatureGroups ", function () {
			it("e.layer should be the Marker", function () {
				let fg1 = new FeatureGroup(),
				    fg2 = new FeatureGroup()

				fg1.addLayer(marker)
				fg2.addLayer(marker)

				let wasClicked1,
				    wasClicked2

				fg2.on('click', function (e) {
					expect(e.layer).to.be(marker)
					expect(e.target).to.be(fg2)
					wasClicked2 = true
				})

				fg1.on('click', function (e) {
					expect(e.layer).to.be(marker)
					expect(e.target).to.be(fg1)
					wasClicked1 = true
				})

				marker.fire('click', {type: 'click'}, true)

				expect(wasClicked1).to.be(true)
				expect(wasClicked2).to.be(true)
			})
		})
	})
	describe('addLayer', function () {
		it('adds the layer', function () {
			let fg = new FeatureGroup(),
			    marker = new Marker([0, 0])

			expect(fg.hasLayer(marker)).to.be(false)

			fg.addLayer(marker)

			expect(fg.hasLayer(marker)).to.be(true)
		})
		it('supports non-evented layers', function () {
			let fg = new FeatureGroup(),
			    g = new LayerGroup()

			expect(fg.hasLayer(g)).to.be(false)

			fg.addLayer(g)

			expect(fg.hasLayer(g)).to.be(true)
		})
	})
	describe('removeLayer', function () {
		it('removes the layer passed to it', function () {
			let fg = new FeatureGroup(),
			    marker = new Marker([0, 0])

			fg.addLayer(marker)
			expect(fg.hasLayer(marker)).to.be(true)

			fg.removeLayer(marker)
			expect(fg.hasLayer(marker)).to.be(false)
		})
		it('removes the layer passed to it by id', function () {
			let fg = new FeatureGroup(),
			    marker = new Marker([0, 0])

			fg.addLayer(marker)
			expect(fg.hasLayer(marker)).to.be(true)

			fg.removeLayer(Util.stamp(marker))
			expect(fg.hasLayer(marker)).to.be(false)
		})
	})
})
