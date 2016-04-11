import {ControlMixin} from 'src/control/Control'
import {Scale} from 'src/control/Control.Scale'
import {Map as MapBase} from 'src/map/Map'

describe("Control.Scale", function () {
	let map

	class Map extends ControlMixin(MapBase) {}

	beforeEach(function () {
		map = new Map(document.createElement('div'))
	})

	it("can be added to an unloaded map", function () {
		new Scale().addTo(map)
	})
})
