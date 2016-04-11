import {DomUtil} from 'src/dom/DomUtil'
import {Control, ControlMixin} from 'src/control/Control'
import {Map as MapBase} from 'src/map/Map'

describe("Control", function () {
	let map

	class Map extends ControlMixin(MapBase) {}

	beforeEach(function () {
		map = new Map(document.createElement('div'))
	})

	function onAdd() {
		return DomUtil.create('div', 'leaflet-test-control')
	}

	describe("#addTo", function () {
		it("adds the container to the map", function () {
			let control = new Control()
			control.onAdd = onAdd
			control.addTo(map)
			expect(map.container.querySelector('.leaflet-test-control')).to.equal(control.container)
		})

		it("removes the control from any existing map", function () {
			let control = new Control()
			control.onAdd = onAdd
			control.addTo(map)
			control.addTo(map)
			expect(map.container.querySelectorAll('.leaflet-test-control').length).to.equal(1)
			expect(map.container.querySelector('.leaflet-test-control')).to.equal(control.container)
		})
	})

	describe("#remove", function () {
		it("removes the container from the map", function () {
			let control = new Control()
			control.onAdd = onAdd
			control.addTo(map).remove()
			expect(map.container.querySelector('.leaflet-test-control')).to.equal(null)
		})

		it("calls onRemove if defined", function () {
			let control = new Control()
			control.onAdd = onAdd
			control.onRemove = sinon.spy()
			control.addTo(map).remove()
			expect(control.onRemove.called).to.be(true)
		})

		it("is a no-op if the control has not been added", function () {
			let control = new Control()
			expect(control.remove()).to.equal(control)
		})
	})
})
