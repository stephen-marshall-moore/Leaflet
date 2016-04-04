"use strict"

import {Browser} from 'src/core/Browser'
//import {Util} from 'src/core/Util'
//import {DomUtil} from 'src/dom/DomUtil'
//import {Point} from 'src/geometry/Point'
import {LatLng} from 'src/geo/LatLng'
//import {LatLngBounds} from 'src/geo/LatLngBounds'
import {Map} from 'src/map/Map'
//import {Layer} from 'src/layer/Layer'
//import {GridLayer} from 'src/layer/tile/GridLayer'
import {Icon} from 'src/layer/marker/Icon'
import {DefaultIcon} from 'src/layer/marker/Icon.Default'
import {DivIcon} from 'src/layer/marker/DivIcon'
import {Marker as MarkerBase} from 'src/layer/marker/Marker'
import {PopupLayerMixin} from 'src/layer/Layer.Popup'
import {MarkerDrag} from 'src/layer/marker/Marker.Drag'

describe("Marker", function () {	
	class Marker extends PopupLayerMixin(MarkerBase) {}

	let map,
	    spy,
	    div,
	    icon1,
	    icon2

	beforeEach(function () {
		div = document.createElement('div')
		div.style.height = '100px'
		document.body.appendChild(div)

		map = new Map(div)
		map.view = {center: [0, 0], zoom: 0}
		icon1 = new DefaultIcon()
		icon2 = new DefaultIcon({
			iconUrl: icon1._getIconUrl('icon') + '?2',
			shadowUrl: icon1._getIconUrl('shadow') + '?2'
		})
	})

	afterEach(function () {
		document.body.removeChild(div)
	})

	describe("#setIcon", function () {
		it("changes the icon to another image", function () {
			let marker = new Marker([0, 0], {icon: icon1})
			map.addLayer(marker)

			let beforeIcon = marker._icon
			marker.setIcon(icon2)
			let afterIcon = marker._icon

			expect(beforeIcon).to.be(afterIcon)
			expect(afterIcon.src).to.contain(icon2._getIconUrl('icon'))
		})

		it("preserves draggability", function () {
			let marker = new Marker([0, 0], {icon: icon1})
			map.addLayer(marker)

			marker.dragging.disable()
			marker.setIcon(icon2)

			expect(marker.dragging.enabled).to.be(false)

			marker.dragging.enable()

			marker.setIcon(icon1)

			expect(marker.dragging.enabled).to.be(true)

			map.removeLayer(marker)
			map.addLayer(marker)

			expect(marker.dragging.enabled).to.be(true)

			map.removeLayer(marker)
			// Dragging is still enabled, we should be able to disable it,
			// even if marker is off the map.
			marker.dragging.disable()
			map.addLayer(marker)
		})

		it("changes the icon to another DivIcon", function () {
			let marker = new Marker([0, 0], {icon: new DivIcon({html: 'Inner1Text'})})
			map.addLayer(marker)

			let beforeIcon = marker._icon
			marker.setIcon(new DivIcon({html: 'Inner2Text'}))
			let afterIcon = marker._icon

			expect(beforeIcon).to.be(afterIcon)
			expect(afterIcon.innerHTML).to.contain('Inner2Text')
		})

		it("removes text when changing to a blank DivIcon", function () {
			let marker = new Marker([0, 0], {icon: new DivIcon({html: 'Inner1Text'})})
			map.addLayer(marker)

			marker.setIcon(new DivIcon())
			let afterIcon = marker._icon

			expect(marker._icon.innerHTML).to.not.contain('Inner1Text')
		})

		it("changes a DivIcon to an image", function () {
			let marker = new Marker([0, 0], {icon: new DivIcon({html: 'Inner1Text'})})
			map.addLayer(marker)
			let oldIcon = marker._icon

			marker.setIcon(icon1)

			expect(oldIcon).to.not.be(marker._icon)
			expect(oldIcon.parentNode).to.be(null)

			if (Browser.retina) {
				expect(marker._icon.src).to.contain('marker-icon-2x.png')
			} else {
				expect(marker._icon.src).to.contain('marker-icon.png')
			}
			expect(marker._icon.parentNode).to.be(map._panes.markerPane)
		})

		it("changes an image to a DivIcon", function () {
			let marker = new Marker([0, 0], {icon: icon1})
			map.addLayer(marker)
			let oldIcon = marker._icon

			marker.setIcon(new DivIcon({html: 'Inner1Text'}))

			expect(oldIcon).to.not.be(marker._icon)
			expect(oldIcon.parentNode).to.be(null)

			expect(marker._icon.innerHTML).to.contain('Inner1Text')
			expect(marker._icon.parentNode).to.be(map._panes.markerPane)
		})

		it("reuses the icon/shadow when changing icon", function () {
			let marker = new Marker([0, 0], {icon: icon1})
			map.addLayer(marker)
			let oldIcon = marker._icon
			let oldShadow = marker._shadow

			marker.setIcon(icon2)

			expect(oldIcon).to.be(marker._icon)
			expect(oldShadow).to.be(marker._shadow)

			expect(marker._icon.parentNode).to.be(map._panes.markerPane)
			expect(marker._shadow.parentNode).to.be(map._panes.shadowPane)
		})
	})

	describe("#setLatLng", function () {
		it("fires a move event", function () {

			let marker = new Marker([0, 0], {icon: icon1})
			map.addLayer(marker)

			let beforeLatLng = marker._latlng
			let afterLatLng = new LatLng(1, 2)

			let eventArgs = null
			marker.on('move', function (e) {
				eventArgs = e
			})

			marker.setLatLng(afterLatLng)

			expect(eventArgs).to.not.be(null)
			expect(eventArgs.oldLatLng).to.be(beforeLatLng)
			expect(eventArgs.latlng).to.be(afterLatLng)
			expect(marker.getLatLng()).to.be(afterLatLng)
		})
	})

	describe('events', function () {
		it('fires click event when clicked', function () {
			let spy = sinon.spy()

			let marker = new Marker([0, 0]).addTo(map)

			marker.on('click', spy)
			happen.click(marker._icon)

			expect(spy.called).to.be.ok()
		})

		it('fires click event when clicked with DivIcon', function () {
			let spy = sinon.spy()

			let marker = new Marker([0, 0], {icon: new DivIcon()}).addTo(map)

			marker.on('click', spy)
			happen.click(marker._icon)

			expect(spy.called).to.be.ok()
		})

		it('fires click event when clicked on DivIcon child element', function () {
			let spy = sinon.spy()

			let marker = new Marker([0, 0], {icon: new DivIcon({html: '<img src="data:image/gifbase64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" />'})}).addTo(map)

			marker.on('click', spy)

			happen.click(marker._icon)
			expect(spy.called).to.be.ok()

			happen.click(marker._icon.querySelector('img'))
			expect(spy.calledTwice).to.be.ok()
		})

		it('fires click event when clicked on DivIcon child element set using setIcon', function () {
			let spy = sinon.spy()

			let marker = new Marker([0, 0]).addTo(map)
			marker.setIcon(new DivIcon({html: '<img src="data:image/gifbase64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" />'}))

			marker.on('click', spy)

			happen.click(marker._icon)
			expect(spy.called).to.be.ok()

			happen.click(marker._icon.querySelector('img'))
			expect(spy.calledTwice).to.be.ok()
		})

		it("do not propagate click event", function () {
			let spy = sinon.spy()
			let spy2 = sinon.spy()
			let mapSpy = sinon.spy()
			let marker = new Marker(new LatLng(55.8, 37.6))
			map.addLayer(marker)
			marker.on('click', spy)
			marker.on('click', spy2)
			map.on('click', mapSpy)
			happen.click(marker._icon)
			expect(spy.called).to.be.ok()
			expect(spy2.called).to.be.ok()
			expect(mapSpy.called).not.to.be.ok()
		})

		it("do not propagate dblclick event", function () {
			let spy = sinon.spy()
			let spy2 = sinon.spy()
			let mapSpy = sinon.spy()
			let marker = new Marker(new LatLng(55.8, 37.6))
			map.addLayer(marker)
			marker.on('dblclick', spy)
			marker.on('dblclick', spy2)
			map.on('dblclick', mapSpy)
			happen.dblclick(marker._icon)
			expect(spy.called).to.be.ok()
			expect(spy2.called).to.be.ok()
			expect(mapSpy.called).not.to.be.ok()
		})

		it("do not catch event if it does not listen to it", function () {
			let marker = new Marker([55, 37])
			map.addLayer(marker)
			marker.once('mousemove', function (e) {
				// It should be the marker coordinates
				expect(e.latlng).to.be.nearLatLng(marker.getLatLng())
			})
			happen.mousemove(marker._icon)
			map.once('mousemove', function (e) {
				// It should be the mouse coordinates, not the marker ones
				expect(e.latlng).not.to.be.nearLatLng(marker.getLatLng())
			})
			happen.mousemove(marker._icon)
		})

	})
})
