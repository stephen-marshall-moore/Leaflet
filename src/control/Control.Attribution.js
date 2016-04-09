import {DomUtil} from 'src/dom/DomUtil'
import {DomEvent} from 'src/dom/DomEvent'
import {Control} from './Control'

/*
 * L.Control.Attribution is used for displaying attribution on the map (added by default).
 */

let _default_attribution_options = {
		position: 'bottomright',
		prefix: '<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a>'
	}

export class Attribution extends Control {

	constructor(options) {
		super()
		Object.assign(this.options, _default_attribution_options, options)
		this._attributions = []
	}

	onAdd(map) {
		this._container = DomUtil.create('div', 'leaflet-control-attribution')
		if (DomEvent) {
			DomEvent.disableClickPropagation(this._container)
		}

		// TODO ugly, refactor
		for (let i in map._layers) {
			if (map._layers[i].getAttribution) {
				this.addAttribution(map._layers[i].getAttribution())
			}
		}

		this._update()

		return this._container
	}

	set prefix(prefix) {
		this.options.prefix = prefix
		this._update()
	}

	addAttribution(text) {
		if (!text) { return this }

		if (!this._attributions[text]) {
			this._attributions[text] = 0
		}
		this._attributions[text]++

		this._update()

		return this
	}

	removeAttribution(text) {
		if (!text) { return this }

		if (this._attributions[text]) {
			this._attributions[text]--
			this._update()
		}

		return this
	}

	_update() {
		if (!this._map) { return }

		let attribs = []

		for (let i in this._attributions) {
			if (this._attributions[i]) {
				attribs.push(i)
			}
		}

		let prefixAndAttribs = []

		if (this.options.prefix) {
			prefixAndAttribs.push(this.options.prefix)
		}
		if (attribs.length) {
			prefixAndAttribs.push(attribs.join(', '))
		}

		this._container.innerHTML = prefixAndAttribs.join(' | ')
	}
}

/***
L.Map.mergeOptions({
	attributionControl: true
})

L.Map.addInitHook(function () {
	if (this.options.attributionControl) {
		this.attributionControl = (new L.Control.Attribution()).addTo(this)
	}
})
***/

