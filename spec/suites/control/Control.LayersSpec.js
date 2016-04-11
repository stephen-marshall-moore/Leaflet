import {DomUtil} from 'src/dom/DomUtil'
import {ControlMixin} from 'src/control/Control'
import {Layers} from 'src/control/Control.Layers'
import {TileLayer} from 'src/layer/tile/TileLayer'
import {Marker} from 'src/layer/marker/Marker'
import {Map as MapBase} from 'src/map/Map'

describe("Control.Layers", function () {
	let map

	class Map extends ControlMixin(MapBase) {}

	beforeEach(function () {
		map = new Map(document.createElement('div'))
	})

	describe("baselayerchange event", function () {

		beforeEach(function () {
			map.view = {center: [0, 0], zoom: 14}
		})

		it("is fired on input that changes the base layer", function () {
			var baseLayers = {"Layer 1": new TileLayer(''), "Layer 2": new TileLayer('')},
			    layers = new Layers(baseLayers).addTo(map),
			    spy = sinon.spy()

			map.on('baselayerchange', spy)
			happen.click(layers._baseLayersList.getElementsByTagName("input")[0])
			expect(spy.called).to.be.ok()
			expect(spy.args[0][0].name).to.be("Layer 1")
			expect(spy.args[0][0].layer).to.be(baseLayers["Layer 1"])
			happen.click(layers._baseLayersList.getElementsByTagName("input")[1])
			expect(spy.calledTwice).to.be.ok()
			expect(spy.args[1][0].name).to.be("Layer 2")
			expect(spy.args[1][0].layer).to.be(baseLayers["Layer 2"])
		})

		it("is not fired on input that doesn't change the base layer", function () {
			var overlays = {"Marker 1": new Marker([0, 0]), "Marker 2": new Marker([0, 0])},
			    layers = new Layers({}, overlays).addTo(map),
			    spy = sinon.spy()

			map.on('baselayerchange', spy)
			happen.click(layers._overlaysList.getElementsByTagName("input")[0])

			expect(spy.called).to.not.be.ok()
		})
	})

	describe("updates", function () {
		beforeEach(function () {
			map.view = {center: [0, 0], zoom: 14}
		})

		it("when an included layer is addded or removed", function () {
			let baseLayer = new TileLayer(),
			    overlay = new Marker([0, 0]),
			    layers = new Layers({"Base": baseLayer}, {"Overlay": overlay}).addTo(map)

			let spy = sinon.spy(layers, '_update')

			map.addLayer(overlay)
			map.removeLayer(overlay)

			expect(spy.called).to.be.ok()
			expect(spy.callCount).to.eql(2)
		})

		it("not when a non-included layer is added or removed", function () {
			let baseLayer = new TileLayer(),
			    overlay = new Marker([0, 0]),
			    layers = new Layers({"Base": baseLayer}).addTo(map)

			let spy = sinon.spy(layers, '_update')

			map.addLayer(overlay)
			map.removeLayer(overlay)

			expect(spy.called).to.not.be.ok()
		})
	})

	describe("is removed cleanly", function () {
		beforeEach(function () {
			map.view = {center: [0, 0], zoom: 14}
		})

		it("and layers in the control can still be removed", function () {
			var baseLayer = new TileLayer('').addTo(map)
			var layersCtrl = new Layers({'Base': baseLayer}).addTo(map)
			map.removeControl(layersCtrl)

			expect(function () {
				map.removeLayer(baseLayer)
			}).to.not.throwException()

		})
	})

})
