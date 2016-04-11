import {DomUtil} from 'src/dom/DomUtil'
import {ControlMixin} from 'src/control/Control'
import {Attribution} from 'src/control/Control.Attribution'
import {Map as MapBase} from 'src/map/Map'

describe("Control.Attribution", function () {
	let map, control, container

	class Map extends ControlMixin(MapBase) {}

	beforeEach(function () {
		map = new Map(document.createElement('div'))
		control = new Attribution({
			prefix: 'prefix'
		}).addTo(map)
		container = control.container
	})

	it("contains just prefix if no attributions added", function () {
		expect(container.innerHTML).to.eql('prefix')
	})

	describe('#addAttribution', function () {
		it('adds one attribution correctly', function () {
			control.addAttribution('foo')
			expect(container.innerHTML).to.eql('prefix | foo')
		})

		it('adds no duplicate attributions', function () {
			control.addAttribution('foo')
			control.addAttribution('foo')
			expect(container.innerHTML).to.eql('prefix | foo')
		})

		it('adds several attributions listed with comma', function () {
			control.addAttribution('foo')
			control.addAttribution('bar')
			expect(container.innerHTML).to.eql('prefix | foo, bar')
		})
	})

	describe('#removeAttribution', function () {
		it('removes attribution correctly', function () {
			control.addAttribution('foo')
			control.addAttribution('bar')
			control.removeAttribution('foo')
			expect(container.innerHTML).to.eql('prefix | bar')
		})
		it('does nothing if removing attribution that was not present', function () {
			control.addAttribution('foo')
			control.addAttribution('baz')
			control.removeAttribution('bar')
			control.removeAttribution('baz')
			control.removeAttribution('baz')
			control.removeAttribution('')
			expect(container.innerHTML).to.eql('prefix | foo')
		})
	})

	describe('#setPrefix', function () {
		it('changes prefix', function () {
			control.prefix = 'bla'
			expect(container.innerHTML).to.eql('bla')
		})
	})

	// is factory function useful/neccessary?
	describe('control.attribution factory', function () {
		it('creates Control.Attribution instance', function () {
			let options = {prefix: 'prefix'}
			expect(new Attribution(options)).to.eql(new Attribution(options))
		})
	})

})
