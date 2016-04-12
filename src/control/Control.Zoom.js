import {DomUtil} from 'src/dom/DomUtil'
import {DomEvent} from 'src/dom/DomEvent'
import {Control} from './Control'

/*
 * L.Control.Zoom is used for the default zoom buttons on the map.
 */


let _default_zoom_options = {
		position: 'topleft',
		zoomInText: '+',
		zoomInTitle: 'Zoom in',
		zoomOutText: '-',
		zoomOutTitle: 'Zoom out'
	}

export class Zoom extends Control {

	constructor(options) {
		super()
		Object.assign(this.options, _default_zoom_options, options)
	}

	onAdd(map) {
		let zoomName = 'leaflet-control-zoom',
		    container = DomUtil.create('div', zoomName + ' leaflet-bar'),
		    options = this.options

		this._zoomInButton  = this._createButton(options.zoomInText, options.zoomInTitle,
		        zoomName + '-in',  container, this._zoomIn)
		this._zoomOutButton = this._createButton(options.zoomOutText, options.zoomOutTitle,
		        zoomName + '-out', container, this._zoomOut)

		this._updateDisabled()
		map.on('zoomend zoomlevelschange', this._updateDisabled, this)

		return container
	}

	onRemove(map) {
		map.off('zoomend zoomlevelschange', this._updateDisabled, this)
	}

	disable() {
		this._disabled = true
		this._updateDisabled()
		return this
	}

	enable() {
		this._disabled = false
		this._updateDisabled()
		return this
	}

	_zoomIn(e) {
		if (!this._disabled) {
			this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1))
		}
	}

	_zoomOut(e) {
		if (!this._disabled) {
			this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1))
		}
	}

	_createButton(html, title, className, container, fn) {
		let link = DomUtil.create('a', className, container)
		link.innerHTML = html
		link.href = '#'
		link.title = title

		DomEvent
		    .on(link, 'mousedown dblclick', DomEvent.stopPropagation)
		    .on(link, 'click', DomEvent.stop)
		    .on(link, 'click', fn, this)
		    .on(link, 'click', this._refocusOnMap, this)

		return link
	}

	_updateDisabled() {
		let map = this._map,
		    className = 'leaflet-disabled'

		DomUtil.removeClass(this._zoomInButton, className)
		DomUtil.removeClass(this._zoomOutButton, className)

		if (this._disabled || map._zoom === map.minZoom) {
			DomUtil.addClass(this._zoomOutButton, className)
		}
		if (this._disabled || map._zoom === map.maxZoom) {
			DomUtil.addClass(this._zoomInButton, className)
		}
	}
}

/***
L.Map.mergeOptions({
	zoomControl: true
})

L.Map.addInitHook(function () {
	if (this.options.zoomControl) {
		this.zoomControl = new L.Control.Zoom()
		this.addControl(this.zoomControl)
	}
})
***/

