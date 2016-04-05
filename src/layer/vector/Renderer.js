import {Browser} from 'src/core/Browser'
import {Util} from 'src/core/Util'
import {DomUtil} from 'src/dom/DomUtil'
import {Bounds} from 'src/geometry/Bounds'
import {Layer} from '../Layer'

/*
 * L.Renderer is a base class for renderer implementations (SVG, Canvas)
 * handles renderer container, bounds and zoom animation.
 */

let _default_renderer_options = {
		// how much to extend the clip area around the map view (relative to its size)
		// e.g. 0.1 would be 10% of map view in each direction defaults to clip with the map view
		padding: 0.1
	}

export class Renderer extends Layer {

	constructor(options = undefined) {
		super()
		Object.assign(this.options, _default_renderer_options, options)
		Util.stamp(this)
	}

	onAdd() {
		if (!this._container) {
			this._initContainer() // defined by renderer implementations

			if (this._zoomAnimated) {
				DomUtil.addClass(this._container, 'leaflet-zoom-animated')
			}
		}

		this.getPane().appendChild(this._container)
		this._update()
	}

	onRemove() {
		DomUtil.remove(this._container)
	}

	getEvents() {
		var events = {
			viewreset: this._reset,
			zoom: this._onZoom,
			moveend: this._update
		}
		if (this._zoomAnimated) {
			events.zoomanim = this._onAnimZoom
		}
		return events
	}

	_onAnimZoom(ev) {
		this._updateTransform(ev.center, ev.zoom)
	}

	_onZoom() {
		this._updateTransform(this._map.center, this._map.zoom)
	}

	_updateTransform(center, zoom) {
		let scale = this._map.getZoomScale(zoom, this._zoom),
		    position = DomUtil.getPosition(this._container),
		    viewHalf = this._map.size.multiplyBy(0.5 + this.options.padding),
		    currentCenterPoint = this._map.project(this._center, zoom),
		    destCenterPoint = this._map.project(center, zoom),
		    centerOffset = destCenterPoint.subtract(currentCenterPoint),
		    topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset)

		if (Browser.any3d) {
			DomUtil.setTransform(this._container, topLeftOffset, scale)
		} else {
			DomUtil.setPosition(this._container, topLeftOffset)
		}
	}

	_reset() {
		this._update()
		this._updateTransform(this._center, this._zoom)
	}

	_update() {
		// update pixel bounds of renderer container (for positioning/sizing/clipping later)
		var p = this.options.padding,
		    size = this._map.size,
		    min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round()

		this._bounds = new Bounds(min, min.add(size.multiplyBy(1 + p * 2)).round())

		this._center = this._map.center
		this._zoom = this._map.zoom
	}
}

