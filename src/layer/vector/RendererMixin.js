import {Canvas} from './Canvas'
import {SVG} from './SVG'


export const RendererMixin = sup => class extends sup {
	// used by each vector layer to decide which renderer to use
	getRenderer(layer) {
		let renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer

		if (!renderer) {
			renderer = this._renderer = (this.options.preferCanvas && new Canvas()) || new SVG()
		}

		if (!this.hasLayer(renderer)) {
			this.addLayer(renderer)
		}
		return renderer
	}

	_getPaneRenderer(name) {
		if (name === 'overlayPane' || name === undefined) {
			return false
		}

		let renderer = this._paneRenderers[name]
		if (renderer === undefined) {
			renderer = (SVG && new SVG({pane: name})) || (Canvas && new Canvas({pane: name}))
			this._paneRenderers[name] = renderer
		}
		return renderer
	}
}
