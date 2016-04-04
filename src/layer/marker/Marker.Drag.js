import {DomUtil} from 'src/dom/DomUtil'
import {Draggable} from 'src/dom/Draggable'

/*
 * L.Handler.MarkerDrag is used internally by L.Marker to make the markers draggable.
 */

export class MarkerDrag {
	constructor(marker) {
		this._element = marker
		this._enabled = false
	}

	enable() {
		if (this._enabled) { return }

		this._enabled = true
		this.addHooks()
	}

	disable() {
		if (!this._enabled) { return }

		this._enabled = false
		this.removeHooks()
	}

	get enabled() {
		return !!this._enabled
	}

	addHooks() {
		let icon = this._element._icon

		if (!this._draggable) {
			this._draggable = new Draggable(icon, icon, true)
		}

		this._draggable.on({
			dragstart: this._onDragStart,
			drag: this._onDrag,
			dragend: this._onDragEnd
		}, this).enable()

		DomUtil.addClass(icon, 'leaflet-marker-draggable')
	}

	removeHooks() {
		this._draggable.off({
			dragstart: this._onDragStart,
			drag: this._onDrag,
			dragend: this._onDragEnd
		}, this).disable()

		if (this._element._icon) {
			DomUtil.removeClass(this._element._icon, 'leaflet-marker-draggable');
		}
	}

	moved() {
		return this._draggable && this._draggable._moved
	}

	_onDragStart() {
		this._element
		    .closePopup()
		    .fire('movestart')
		    .fire('dragstart')
	}

	_onDrag(e) {
		var marker = this._element,
		    shadow = marker._shadow,
		    iconPos = DomUtil.getPosition(marker._icon),
		    latlng = marker._map.layerPointToLatLng(iconPos)

		// update shadow position
		if (shadow) {
			DomUtil.setPosition(shadow, iconPos)
		}

		marker._latlng = latlng
		e.latlng = latlng

		marker
		    .fire('move', e)
		    .fire('drag', e)
	}

	_onDragEnd(e) {
		this._element
		    .fire('moveend')
		    .fire('dragend', e)
	}
}
