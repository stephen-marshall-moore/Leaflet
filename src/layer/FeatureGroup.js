import {Util} from 'src/core/Util'
import {LayerGroup} from './LayerGroup'

/*
 * L.FeatureGroup extends L.LayerGroup by introducing mouse events and additional methods
 * shared between a group of interactive layers (like vectors or markers).
 */

export class FeatureGroup extends LayerGroup {

	constructor(layers) {
		super(layers)
	}

	addLayer(layer) {
		if (this.hasLayer(layer)) {
			return this
		}

		layer.addEventParent(this)

		//L.LayerGroup.prototype.addLayer.call(this, layer)
		super.addLayer(layer)

		return this.fire('layeradd', {layer: layer})
	}

	removeLayer(layer) {
		if (!this.hasLayer(layer)) {
			return this
		}
		if (layer in this._layers) {
			layer = this._layers[layer]
		}

		layer.removeEventParent(this)

		//L.LayerGroup.prototype.removeLayer.call(this, layer)
		super.removeLayer(layer)

		return this.fire('layerremove', {layer: layer})
	}

	setStyle(style) {
		return this.invoke('setStyle', style)
	}

	bringToFront() {
		return this.invoke('bringToFront')
	}

	bringToBack() {
		return this.invoke('bringToBack')
	}

	getBounds() {
		let bounds = new LatLngBounds()

		for (let id in this._layers) {
			let layer = this._layers[id]
			bounds.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng())
		}
		return bounds
	}
}
