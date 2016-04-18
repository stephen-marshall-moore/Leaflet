import {Point} from 'src/geometry/Point'
import {Layer} from 'src/layer/Layer'
import {Popup} from 'src/layer/Popup'
import {FeatureGroup} from 'src/layer/FeatureGroup'

/*
 * Adds popup-related methods to all layers.
 */

//export const PopupLayerMixin = sup => class extends sup {

	Layer.prototype.bindPopup = function(content, options) {

		if (content instanceof Popup) {
			Object.assign(content, options)
			this._popup = content
			content._source = this
		} else {
			if (!this._popup || options) {
				this._popup = new Popup(options, this)
			}
			this._popup.setContent(content)
		}

		if (!this._popupHandlersAdded) {
			this.on({
				click: this._openPopup,
				remove: this.closePopup,
				move: this._movePopup
			})
			this._popupHandlersAdded = true
		}

		// save the originally passed offset
		this._originalPopupOffset = this._popup.options.offset

		return this
	}

	Layer.prototype.unbindPopup = function() {
		if (this._popup) {
			this.off({
				click: this._openPopup,
				remove: this.closePopup,
				move: this._movePopup
			})
			this._popupHandlersAdded = false
			this._popup = null
		}
		return this
	}

	Layer.prototype.openPopup = function(layer, latlng) {
		if (!(layer instanceof Layer)) {
			latlng = layer
			layer = this
		}

		if (layer instanceof FeatureGroup) {
			for (let id in this._layers) {
				layer = this._layers[id]
				break
			}
		}

		if (!latlng) {
			latlng = layer.getCenter ? layer.getCenter() : layer.getLatLng()
		}

		if (this._popup && this._map) {
			// set the popup offset for this layer
			this._popup.options.offset = this._popupAnchor(layer)

			// set popup source to this layer
			this._popup._source = layer

			// update the popup (content, layout, ect...)
			this._popup.update()

			// open the popup on the map
			this._map.openPopup(this._popup, latlng)
		}

		return this
	}

	Layer.prototype.closePopup = function() {
		if (this._popup) {
			this._popup._close()
		}
		return this
	}

	Layer.prototype.togglePopup = function(target) {
		if (this._popup) {
			if (this._popup._map) {
				this.closePopup()
			} else {
				this.openPopup(target)
			}
		}
		return this
	}

	Layer.prototype.isPopupOpen = function() {
		return this._popup.isOpen()
	}

	Layer.prototype.setPopupContent = function(content) {
		if (this._popup) {
			this._popup.setContent(content)
		}
		return this
	}

	Layer.prototype.getPopup = function() {
		return this._popup
	}

	Layer.prototype._openPopup = function(e) {
		var layer = e.layer || e.target

		if (!this._popup) {
			return
		}

		if (!this._map) {
			return
		}

		// if this inherits from Path its a vector and we can just
		// open the popup at the new location
		/*** TODO: add this back in
		if (layer instanceof L.Path) {
			this.openPopup(e.layer || e.target, e.latlng)
			return
		}
		***/

		// otherwise treat it like a marker and figure out
		// if we should toggle it open/closed
		if (this._map.hasLayer(this._popup) && this._popup._source === layer) {
			this.closePopup()
		} else {
			this.openPopup(layer, e.latlng)
		}
	}

	Layer.prototype._popupAnchor = function(layer) {
		// where shold we anchor the popup on this layer?
		var anchor = layer._getPopupAnchor ? layer._getPopupAnchor() : [0, 0]

		// add the users passed offset to that
		var offsetToAdd = this._originalPopupOffset || Popup.prototype.options.offset

		// return the final point to anchor the popup
		return Point.point(anchor).add(offsetToAdd)
	}

	Layer.prototype._movePopup = function(e) {
		this._popup.setLatLng(e.latlng)
	}
//}
