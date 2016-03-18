import {Evented} from '../core/Events'
import {Util} from '../core/Util'

export class Layer extends Evented {

	constructor() {
		super()
		this.options = {
			pane: 'overlayPane',
			nonBubblingEvents: []  // Array of events that should not be bubbled to DOM parents (like the map)
		}
	}

	addTo(map) {
		map.addLayer(this)
		return this
	}

	remove(){
		return this.removeFrom(this._map || this._mapToAdd)
	}

	removeFrom(obj) {
		if (obj) {
			obj.removeLayer(this)
		}
		return this
	}

	getPane(name) {
		return this._map.getPane(name ? (this.options[name] || name) : this.options.pane)
	}

	addInteractiveTarget(targetEl) {
		this._map._targets[Util.stamp(targetEl)] = this
		return this
	}

	removeInteractiveTarget(targetEl) {
		delete this._map._targets[Util.stamp(targetEl)]
		return this
	}

	_layerAdd(e) {
		let map = e.target

		// check in case layer gets added and then removed before the map is ready
		if (!map.hasLayer(this)) { return }

		this._map = map
		this._zoomAnimated = map._zoomAnimated

		if (this.getEvents) {
			map.on(this.getEvents(), this)
		}

		this.onAdd(map)

		if (this.getAttribution && this._map.attributionControl) {
			this._map.attributionControl.addAttribution(this.getAttribution())
		}

		this.fire('add')
		map.fire('layeradd', {layer: this})
	}

	addLayer(layer) {
		var id = Util.stamp(layer)
		if (this._layers[id]) { return layer }
		this._layers[id] = layer

		layer._mapToAdd = this

		if (layer.beforeAdd) {
			layer.beforeAdd(this)
		}

		this.whenReady(layer._layerAdd, layer)

		return this
	}

	removeLayer(layer) {
		var id = Util.stamp(layer)

		if (!this._layers[id]) { return this }

		if (this._loaded) {
			layer.onRemove(this)
		}

		if (layer.getAttribution && this.attributionControl) {
			this.attributionControl.removeAttribution(layer.getAttribution())
		}

		if (layer.getEvents) {
			this.off(layer.getEvents(), layer)
		}

		delete this._layers[id]

		if (this._loaded) {
			this.fire('layerremove', {layer: layer})
			layer.fire('remove')
		}

		layer._map = layer._mapToAdd = null

		return this
	}

	hasLayer(layer) {
		return !!layer && (Util.stamp(layer) in this._layers)
	}

	eachLayer(method, context) {
		for (var i in this._layers) {
			method.call(context, this._layers[i])
		}
		return this
	}

	_addLayers(layers) {
		layers = layers ? (L.Util.isArray(layers) ? layers : [layers]) : []

		for (var i = 0, len = layers.length; i < len; i++) {
			this.addLayer(layers[i])
		}
	}

	_addZoomLimit(layer) {
		if (isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
			this._zoomBoundLayers[Util.stamp(layer)] = layer
			this._updateZoomLevels()
		}
	}

	_removeZoomLimit(layer) {
		var id = Util.stamp(layer)

		if (this._zoomBoundLayers[id]) {
			delete this._zoomBoundLayers[id]
			this._updateZoomLevels()
		}
	}

	_updateZoomLevels() {
		let minZoom = Infinity,
		    maxZoom = -Infinity,
		    oldZoomSpan = this._getZoomSpan()

		for (let i in this._zoomBoundLayers) {
			let options = this._zoomBoundLayers[i].options

			minZoom = options.minZoom === undefined ? minZoom : Math.min(minZoom, options.minZoom)
			maxZoom = options.maxZoom === undefined ? maxZoom : Math.max(maxZoom, options.maxZoom)
		}

		this._layersMaxZoom = maxZoom === -Infinity ? undefined : maxZoom
		this._layersMinZoom = minZoom === Infinity ? undefined : minZoom

		if (oldZoomSpan !== this._getZoomSpan()) {
			this.fire('zoomlevelschange')
		}
	}
}

