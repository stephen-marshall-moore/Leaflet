import {Util} from 'src/core/Util'
import {DomUtil} from 'src/dom/DomUtil'
import {Bounds} from 'src/geometry/Bounds'
import {LatLngBounds} from 'src/geo/LatLngBounds'
import {Layer} from './Layer'

/*
 * L.ImageOverlay is used to overlay images over the map (to specific geographical bounds).
 */

let _default_overlay_options = {
		opacity: 1,
		alt: '',
		interactive: false

		/*
		crossOrigin: <Boolean>,
		*/
	}

export class ImageOverlay extends Layer {

	constructor(url, bounds, options) { // (String, LatLngBounds, Object)
		super()
		Object.assign(this.options, _default_overlay_options, options)

		this._url = url
		this._bounds = LatLngBounds.latLngBounds(bounds)
	}

	onAdd() {
		if (!this._image) {
			this._initImage()

			if (this.options.opacity < 1) {
				this._updateOpacity()
			}
		}

		if (this.options.interactive) {
			DomUtil.addClass(this._image, 'leaflet-interactive')
			this.addInteractiveTarget(this._image)
		}

		this.getPane().appendChild(this._image)
		this._reset()
	}

	onRemove() {
		DomUtil.remove(this._image)
		if (this.options.interactive) {
			this.removeInteractiveTarget(this._image)
		}
	}

	set opacity(opacity) {
		this.options.opacity = opacity

		if (this._image) {
			this._updateOpacity()
		}
	}

	set style(styleOpts) {
		if (styleOpts.opacity) {
			this.opacity = styleOpts.opacity
		}
	}

	bringToFront() {
		if (this._map) {
			DomUtil.toFront(this._image)
		}
		return this
	}

	bringToBack() {
		if (this._map) {
			DomUtil.toBack(this._image)
		}
		return this
	}

	set url(url) {
		this._url = url

		if (this._image) {
			this._image.src = url
		}
	}

	set bounds(bounds) {
		this._bounds = bounds

		if (this._map) {
			this._reset()
		}
	}

	get attribution() {
		return this.options.attribution
	}

	get events() {
		let events = {
			zoom: this._reset,
			viewreset: this._reset
		}

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom
		}

		return events
	}

	get bounds() {
		return this._bounds
	}

	get element() {
		return this._image
	}

	_initImage() {
		let img = this._image = DomUtil.create('img',
				'leaflet-image-layer ' + (this._zoomAnimated ? 'leaflet-zoom-animated' : ''))

		img.onselectstart = () => false //L.Util.falseFn
		img.onmousemove = () => false //L.Util.falseFn

		img.onload = Util.bind(this.fire, this, 'load')

		if (this.options.crossOrigin) {
			img.crossOrigin = ''
		}

		img.src = this._url
		img.alt = this.options.alt
	}

	_animateZoom(e) {
		var scale = this._map.getZoomScale(e.zoom),
		    offset = this._map._latLngToNewLayerPoint(this._bounds.northWest, e.zoom, e.center)

		DomUtil.setTransform(this._image, offset, scale)
	}

	_reset() {
		let image = this._image,
		    bounds = new Bounds(
		        this._map.latLngToLayerPoint(this._bounds.northWest),
		        this._map.latLngToLayerPoint(this._bounds.southEast)),
		    size = bounds.size

		DomUtil.setPosition(image, bounds.min)

		image.style.width  = size.x + 'px'
		image.style.height = size.y + 'px'
	}

	_updateOpacity() {
		DomUtil.setOpacity(this._image, this.options.opacity)
	}
}

