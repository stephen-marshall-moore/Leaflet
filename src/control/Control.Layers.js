import {Browser} from 'src/core/Browser'
import {Util} from 'src/core/Util'
import {DomUtil} from 'src/dom/DomUtil'
import {DomEvent} from 'src/dom/DomEvent'
import {Control} from './Control'

/*
 * L.Control.Layers is a control to allow users to switch between different layers on the map.
 */

let _default_layers_options = {
		collapsed: true,
		position: 'topright',
		autoZIndex: true,
		hideSingleBase: false
	}

export class Layers extends Control {

	constructor(baseLayers, overlays, options) {
		super()
		Object.assign(this.options, _default_layers_options, options)

		this._layers = {}
		this._lastZIndex = 0
		this._handlingClick = false

		for (let i in baseLayers) {
			this._addLayer(baseLayers[i], i)
		}

		for (i in overlays) {
			this._addLayer(overlays[i], i, true)
		}
	}

	onAdd(map) {
		this._initLayout()
		this._update()

		this._map = map
		map.on('zoomend', this._checkDisabledLayers, this)

		return this._container
	}

	onRemove() {
		this._map.off('zoomend', this._checkDisabledLayers, this)

		for (let id in this._layers) {
			this._layers[id].layer.off('add remove', this._onLayerChange, this)
		}
	}

	addBaseLayer(layer, name) {
		this._addLayer(layer, name)
		return this._update()
	}

	addOverlay(layer, name) {
		this._addLayer(layer, name, true)
		return this._update()
	}

	removeLayer(layer) {
		layer.off('add remove', this._onLayerChange, this)

		delete this._layers[Util.stamp(layer)]
		return this._update()
	}

	_initLayout() {
		let className = 'leaflet-control-layers',
		    container = this._container = DomUtil.create('div', className)

		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true)

		DomEvent.disableClickPropagation(container)
		if (!Browser.touch) {
			DomEvent.disableScrollPropagation(container)
		}

		let form = this._form = DomUtil.create('form', className + '-list')

		if (this.options.collapsed) {
			if (!Browser.android) {
				DomEvent.on(container, {
					mouseenter: this._expand,
					mouseleave: this._collapse
				}, this)
			}

			let link = this._layersLink = DomUtil.create('a', className + '-toggle', container)
			link.href = '#'
			link.title = 'Layers'

			if (Browser.touch) {
				DomEvent
				    .on(link, 'click', DomEvent.stop)
				    .on(link, 'click', this._expand, this)
			} else {
				DomEvent.on(link, 'focus', this._expand, this)
			}

			// work around for Firefox Android issue https://github.com/Leaflet/Leaflet/issues/2033
			DomEvent.on(form, 'click', function () {
				setTimeout(Util.bind(this._onInputClick, this), 0)
			}, this)

			this._map.on('click', this._collapse, this)
			// TODO keyboard accessibility
		} else {
			this._expand()
		}

		this._baseLayersList = DomUtil.create('div', className + '-base', form)
		this._separator = DomUtil.create('div', className + '-separator', form)
		this._overlaysList = DomUtil.create('div', className + '-overlays', form)

		container.appendChild(form)
	}

	_addLayer(layer, name, overlay) {
		layer.on('add remove', this._onLayerChange, this)

		let id = Util.stamp(layer)

		this._layers[id] = {
			layer: layer,
			name: name,
			overlay: overlay
		}

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++
			layer.setZIndex(this._lastZIndex)
		}
	}

	_update() {
		if (!this._container) { return this }

		DomUtil.empty(this._baseLayersList)
		DomUtil.empty(this._overlaysList)

		let baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0

		for (i in this._layers) {
			obj = this._layers[i]
			this._addItem(obj)
			overlaysPresent = overlaysPresent || obj.overlay
			baseLayersPresent = baseLayersPresent || !obj.overlay
			baseLayersCount += !obj.overlay ? 1 : 0
		}

		// Hide base layers section if there's only one layer.
		if (this.options.hideSingleBase) {
			baseLayersPresent = baseLayersPresent && baseLayersCount > 1
			this._baseLayersList.style.display = baseLayersPresent ? '' : 'none'
		}

		this._separator.style.display = overlaysPresent && baseLayersPresent ? '' : 'none'

		return this
	}

	_onLayerChange(e) {
		if (!this._handlingClick) {
			this._update()
		}

		let obj = this._layers[Util.stamp(e.target)]

		let type = obj.overlay ?
			(e.type === 'add' ? 'overlayadd' : 'overlayremove') :
			(e.type === 'add' ? 'baselayerchange' : null)

		if (type) {
			this._map.fire(type, obj)
		}
	}

	// IE7 bugs out if you create a radio dynamically, so you have to do it this hacky way (see http://bit.ly/PqYLBe)
	_createRadioElement(name, checked) {

		let radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' +
				name + '"' + (checked ? ' checked="checked"' : '') + '/>'

		let radioFragment = document.createElement('div')
		radioFragment.innerHTML = radioHtml

		return radioFragment.firstChild
	}

	_addItem(obj) {
		let label = document.createElement('label'),
		    checked = this._map.hasLayer(obj.layer),
		    input

		if (obj.overlay) {
			input = document.createElement('input')
			input.type = 'checkbox'
			input.className = 'leaflet-control-layers-selector'
			input.defaultChecked = checked
		} else {
			input = this._createRadioElement('leaflet-base-layers', checked)
		}

		input.layerId = Util.stamp(obj.layer)

		DomEvent.on(input, 'click', this._onInputClick, this)

		let name = document.createElement('span')
		name.innerHTML = ' ' + obj.name

		// Helps from preventing layer control flicker when checkboxes are disabled
		// https://github.com/Leaflet/Leaflet/issues/2771
		let holder = document.createElement('div')

		label.appendChild(holder)
		holder.appendChild(input)
		holder.appendChild(name)

		let container = obj.overlay ? this._overlaysList : this._baseLayersList
		container.appendChild(label)

		this._checkDisabledLayers()
		return label
	}

	_onInputClick() {
		let inputs = this._form.getElementsByTagName('input'),
		    input, layer, hasLayer
		let addedLayers = [],
		    removedLayers = []

		this._handlingClick = true

		for (let i = inputs.length - 1; i >= 0; i--) {
			input = inputs[i]
			layer = this._layers[input.layerId].layer
			hasLayer = this._map.hasLayer(layer)

			if (input.checked && !hasLayer) {
				addedLayers.push(layer)

			} else if (!input.checked && hasLayer) {
				removedLayers.push(layer)
			}
		}

		// Bugfix issue 2318: Should remove all old layers before readding new ones
		for (i = 0; i < removedLayers.length; i++) {
			this._map.removeLayer(removedLayers[i])
		}
		for (i = 0; i < addedLayers.length; i++) {
			this._map.addLayer(addedLayers[i])
		}

		this._handlingClick = false

		this._refocusOnMap()
	}

	_expand() {
		DomUtil.addClass(this._container, 'leaflet-control-layers-expanded')
		this._form.style.height = null
		let acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50)
		if (acceptableHeight < this._form.clientHeight) {
			DomUtil.addClass(this._form, 'leaflet-control-layers-scrollbar')
			this._form.style.height = acceptableHeight + 'px'
		} else {
			DomUtil.removeClass(this._form, 'leaflet-control-layers-scrollbar')
		}
		this._checkDisabledLayers()
	}

	_collapse() {
		DomUtil.removeClass(this._container, 'leaflet-control-layers-expanded')
	}

	_checkDisabledLayers() {
		let inputs = this._form.getElementsByTagName('input'),
		    input,
		    layer,
		    zoom = this._map.zoom

		for (let i = inputs.length - 1; i >= 0; i--) {
			input = inputs[i]
			layer = this._layers[input.layerId].layer
			input.disabled = (layer.options.minZoom !== undefined && zoom < layer.options.minZoom) ||
			                 (layer.options.maxZoom !== undefined && zoom > layer.options.maxZoom)

		}
	}
}

