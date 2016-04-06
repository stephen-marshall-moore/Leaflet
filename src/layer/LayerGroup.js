import {Util} from 'src/core/Util'
import {Layer} from './Layer'

/*
 * L.LayerGroup is a class to combine several layers into one so that
 * you can manipulate the group (e.g. add/remove it) as one layer.
 */

export class LayerGroup extends Layer {

	constructor(layers) {
		super()
		this._layers = {}

		let i, len

		if (layers) {
			for (i = 0, len = layers.length; i < len; i++) {
				this.addLayer(layers[i])
			}
		}
	}

	addLayer(layer) {
		let id = this.getLayerId(layer)

		this._layers[id] = layer

		if (this._map) {
			this._map.addLayer(layer)
		}

		return this
	}

	removeLayer(layer) {
		let id = layer in this._layers ? layer : this.getLayerId(layer)

		if (this._map && this._layers[id]) {
			this._map.removeLayer(this._layers[id])
		}

		delete this._layers[id]

		return this
	}

	hasLayer(layer) {
		return !!layer && (layer in this._layers || this.getLayerId(layer) in this._layers)
	}

	clearLayers() {
		for (let i in this._layers) {
			this.removeLayer(this._layers[i])
		}
		return this
	}

	invoke(methodName) {
		let args = Array.prototype.slice.call(arguments, 1),
		    i, layer

		for (i in this._layers) {
			layer = this._layers[i]

			if (layer[methodName]) {
				layer[methodName].apply(layer, args)
			}
		}

		return this
	}

	onAdd(map) {
		for (let i in this._layers) {
			map.addLayer(this._layers[i])
		}
	}

	onRemove(map) {
		for (let i in this._layers) {
			map.removeLayer(this._layers[i])
		}
	}

	eachLayer(method, context) {
		for (let i in this._layers) {
			method.call(context, this._layers[i])
		}
		return this
	}

	getLayer(id) {
		return this._layers[id]
	}

	getLayers() {
		let layers = []

		for (let i in this._layers) {
			layers.push(this._layers[i])
		}
		return layers
	}

	setZIndex(zIndex) {
		return this.invoke('setZIndex', zIndex)
	}

	getLayerId(layer) {
		return Util.stamp(layer)
	}
}

