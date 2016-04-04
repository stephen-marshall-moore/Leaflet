import {DomUtil} from '../../dom/DomUtil'
import {LatLng} from '../../geo/LatLng'
import {Layer} from '../Layer'
import {DefaultIcon} from './Icon.Default'
import {MarkerDrag} from './Marker.Drag'

/*
 * L.Marker is used to display clickable/draggable icons on the map.
 */

let _default_marker_options = {
		pane: 'markerPane',
		nonBubblingEvents: ['click', 'dblclick', 'mouseover', 'mouseout', 'contextmenu'],

		icon: new DefaultIcon,
		// title: '',
		// alt: '',
		interactive: true,
		// draggable: false,
		keyboard: true,
		zIndexOffset: 0,
		opacity: 1,
		// riseOnHover: false,
		riseOffset: 250
	}

export class Marker extends Layer {

	constructor(latlng, options = undefined) {
		super()
		
		this._latlng = LatLng.latLng(latlng) 

		Object.assign(this.options, _default_marker_options, options)

	}

	onAdd(map) {
		this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation

		this._initIcon()
		this.update()
	}

	onRemove() {
		if (this.dragging && this.dragging.enabled) {
			this.options.draggable = true
			this.dragging.removeHooks()
		}

		this._removeIcon()
		this._removeShadow()
	}	

	getEvents() {
		var events = {
			zoom: this.update,
			viewreset: this.update
		}

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom
		}

		return events
	}
	

	getLatLng() {
		return this._latlng
	}
	
	setLatLng(latlng) {
		var oldLatLng = this._latlng
		this._latlng = LatLng.latLng(latlng)
		this.update()
		return this.fire('move', {oldLatLng: oldLatLng, latlng: this._latlng})
	}
	
	setZIndexOffset(offset) {
		this.options.zIndexOffset = offset
		return this.update()
	}

	setIcon(icon) {
		this.options.icon = icon

		if (this._map) {
			this._initIcon()
			this.update()
		}

		if (this._popup) {
			this.bindPopup(this._popup, this._popup.options)
		}

		return this
	}
	

	getElement() {
		return this._icon
	}

	update() {
		if (this._icon) {
			var pos = this._map.latLngToLayerPoint(this._latlng).round()
			this._setPos(pos)
		}

		return this
	}
	
	_initIcon() {
		var options = this.options,
		    classToAdd = 'leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide')

		var icon = options.icon.createIcon(this._icon),
		    addIcon = false

		// if we're not reusing the icon, remove the old one and init new one
		if (icon !== this._icon) {
			if (this._icon) {
				this._removeIcon()
			}
			addIcon = true

			if (options.title) {
				icon.title = options.title
			}
			if (options.alt) {
				icon.alt = options.alt
			}
		}

		DomUtil.addClass(icon, classToAdd)

		if (options.keyboard) {
			icon.tabIndex = '0'
		}

		this._icon = icon

		if (options.riseOnHover) {
			this.on({
				mouseover: this._bringToFront,
				mouseout: this._resetZIndex
			})
		}

		var newShadow = options.icon.createShadow(this._shadow),
		    addShadow = false

		if (newShadow !== this._shadow) {
			this._removeShadow()
			addShadow = true
		}

		if (newShadow) {
			DomUtil.addClass(newShadow, classToAdd)
		}
		this._shadow = newShadow


		if (options.opacity < 1) {
			this._updateOpacity()
		}


		if (addIcon) {
			this.getPane().appendChild(this._icon)
		}
		this._initInteraction()
		if (newShadow && addShadow) {
			this.getPane('shadowPane').appendChild(this._shadow)
		}
	}

	_removeIcon() {
		if (this.options.riseOnHover) {
			this.off({
				mouseover: this._bringToFront,
				mouseout: this._resetZIndex
			})
		}

		DomUtil.remove(this._icon)
		this.removeInteractiveTarget(this._icon)

		this._icon = null
	}

	_removeShadow() {
		if (this._shadow) {
			DomUtil.remove(this._shadow)
		}
		this._shadow = null
	}

	_setPos(pos) {
		DomUtil.setPosition(this._icon, pos)

		if (this._shadow) {
			DomUtil.setPosition(this._shadow, pos)
		}

		this._zIndex = pos.y + this.options.zIndexOffset

		this._resetZIndex()
	}

	_updateZIndex(offset) {
		this._icon.style.zIndex = this._zIndex + offset
	}

	_animateZoom(opt) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round()

		this._setPos(pos)
	}

	_initInteraction() {

		if (!this.options.interactive) { return }

		DomUtil.addClass(this._icon, 'leaflet-interactive')

		this.addInteractiveTarget(this._icon)

		if (MarkerDrag) {
			let draggable = this.options.draggable
			if (this.dragging) {
				draggable = this.dragging.enabled
				this.dragging.disable()
			}

			this.dragging = new MarkerDrag(this)

			if (draggable) {
				this.dragging.enable()
			}
		}
	}

	setOpacity(opacity) {
		this.options.opacity = opacity
		if (this._map) {
			this._updateOpacity()
		}

		return this
	}

	_updateOpacity() {
		var opacity = this.options.opacity

		DomUtil.setOpacity(this._icon, opacity)

		if (this._shadow) {
			DomUtil.setOpacity(this._shadow, opacity)
		}
	}

	_bringToFront() {
		this._updateZIndex(this.options.riseOffset)
	}

	_resetZIndex() {
		this._updateZIndex(0)
	}
}

