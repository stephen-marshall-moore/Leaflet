import {Util} from 'src/core/Util'
import {DomUtil} from 'src/dom/DomUtil'
import {DomEvent} from 'src/dom/DomEvent'
import {Point} from 'src/geometry/Point'
import {LatLng} from 'src/geo/LatLng'
import {Layer} from 'src/layer/Layer'

/*
 * L.Popup is used for displaying popups on the map.
 */

//L.Map.mergeOptions({
//	closePopupOnClick: true
//})

let _default_popup_options = {
		pane: 'popupPane',

		minWidth: 50,
		maxWidth: 300,
		// maxHeight: <Number>,
		offset: [0, 7],

		autoPan: true,
		autoPanPadding: [5, 5],
		// autoPanPaddingTopLeft: <Point>,
		// autoPanPaddingBottomRight: <Point>,

		closeButton: true,
		autoClose: true,
		// keepInView: false,
		// className: '',
		zoomAnimation: true
	}

export class Popup extends Layer {

	constructor(source, options = undefined) {
		super()
		this._source = source
		Object.assign(this.options, _default_popup_options, options)
	}

	onAdd(map) {
		this._zoomAnimated = this._zoomAnimated && this.options.zoomAnimation

		if (!this._container) {
			this._initLayout()
		}

		if (map._fadeAnimated) {
			DomUtil.setOpacity(this._container, 0)
		}

		clearTimeout(this._removeTimeout)
		this.getPane().appendChild(this._container)
		this.update()

		if (map._fadeAnimated) {
			DomUtil.setOpacity(this._container, 1)
		}

		map.fire('popupopen', {popup: this})

		if (this._source) {
			this._source.fire('popupopen', {popup: this}, true)
			this._source.on('preclick', DomEvent.stopPropagation)
		}
	}

	openOn(map) {
		map.openPopup(this)
		return this
	}

	onRemove(map) {
		if (map._fadeAnimated) {
			DomUtil.setOpacity(this._container, 0)
			this._removeTimeout = setTimeout(Util.bind(DomUtil.remove, DomUtil, this._container), 200)
		} else {
			DomUtil.remove(this._container)
		}

		map.fire('popupclose', {popup: this})

		if (this._source) {
			this._source.fire('popupclose', {popup: this}, true)
			this._source.off('preclick', DomEvent.stopPropagation)
		}
	}

	getLatLng() {
		return this._latlng
	}

	setLatLng(latlng) {
		this._latlng = LatLng.latLng(latlng)
		if (this._map) {
			this._updatePosition()
			this._adjustPan()
		}
		return this
	}

	getContent() {
		return this._content
	}

	setContent(content) {
		this._content = content
		this.update()
		return this
	}

	getElement() {
		return this._container
	}

	update() {
		if (!this._map) { return }

		this._container.style.visibility = 'hidden'

		this._updateContent()
		this._updateLayout()
		this._updatePosition()

		this._container.style.visibility = ''

		this._adjustPan()
	}

	getEvents() {
		var events = {
			zoom: this._updatePosition,
			viewreset: this._updatePosition
		}

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom
		}
		if ('closeOnClick' in this.options ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
			events.preclick = this._close
		}
		if (this.options.keepInView) {
			events.moveend = this._adjustPan
		}
		return events
	}

	isOpen() {
		return !!this._map && this._map.hasLayer(this)
	}

	bringToFront() {
		if (this._map) {
			DomUtil.toFront(this._container)
		}
		return this
	}

	bringToBack() {
		if (this._map) {
			DomUtil.toBack(this._container)
		}
		return this
	}

	_close() {
		if (this._map) {
			this._map.closePopup(this)
		}
	}

	_initLayout() {
		var prefix = 'leaflet-popup',
		    container = this._container = DomUtil.create('div',
			prefix + ' ' + (this.options.className || '') +
			' leaflet-zoom-' + (this._zoomAnimated ? 'animated' : 'hide'))

		if (this.options.closeButton) {
			var closeButton = this._closeButton = DomUtil.create('a', prefix + '-close-button', container)
			closeButton.href = '#close'
			closeButton.innerHTML = '&#215'

			DomEvent.on(closeButton, 'click', this._onCloseButtonClick, this)
		}

		var wrapper = this._wrapper = DomUtil.create('div', prefix + '-content-wrapper', container)
		this._contentNode = DomUtil.create('div', prefix + '-content', wrapper)

		DomEvent
			.disableClickPropagation(wrapper)
			.disableScrollPropagation(this._contentNode)
			.on(wrapper, 'contextmenu', DomEvent.stopPropagation)

		this._tipContainer = DomUtil.create('div', prefix + '-tip-container', container)
		this._tip = DomUtil.create('div', prefix + '-tip', this._tipContainer)
	}

	_updateContent() {
		if (!this._content) { return }

		var node = this._contentNode
		var content = (typeof this._content === 'function') ? this._content(this._source || this) : this._content

		if (typeof content === 'string') {
			node.innerHTML = content
		} else {
			while (node.hasChildNodes()) {
				node.removeChild(node.firstChild)
			}
			node.appendChild(content)
		}
		this.fire('contentupdate')
	}

	_updateLayout() {
		var container = this._contentNode,
		    style = container.style

		style.width = ''
		style.whiteSpace = 'nowrap'

		var width = container.offsetWidth
		width = Math.min(width, this.options.maxWidth)
		width = Math.max(width, this.options.minWidth)

		style.width = (width + 1) + 'px'
		style.whiteSpace = ''

		style.height = ''

		var height = container.offsetHeight,
		    maxHeight = this.options.maxHeight,
		    scrolledClass = 'leaflet-popup-scrolled'

		if (maxHeight && height > maxHeight) {
			style.height = maxHeight + 'px'
			DomUtil.addClass(container, scrolledClass)
		} else {
			DomUtil.removeClass(container, scrolledClass)
		}

		this._containerWidth = this._container.offsetWidth
	}

	_updatePosition() {
		if (!this._map) { return }

		var pos = this._map.latLngToLayerPoint(this._latlng),
		    offset = Point.point(this.options.offset)

		if (this._zoomAnimated) {
			DomUtil.setPosition(this._container, pos)
		} else {
			offset = offset.add(pos)
		}

		var bottom = this._containerBottom = -offset.y,
		    left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x

		// bottom position the popup in case the height of the popup changes (images loading etc)
		this._container.style.bottom = bottom + 'px'
		this._container.style.left = left + 'px'
	}

	_animateZoom(e) {
		var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center)
		DomUtil.setPosition(this._container, pos)
	}

	_adjustPan() {
		if (!this.options.autoPan || (this._map._panAnim && this._map._panAnim._inProgress)) { return }

		var map = this._map,
		    containerHeight = this._container.offsetHeight,
		    containerWidth = this._containerWidth,
		    layerPos = new Point.point(this._containerLeft, -containerHeight - this._containerBottom)

		if (this._zoomAnimated) {
			layerPos._add(DomUtil.getPosition(this._container))
		}

		var containerPos = map.layerPointToContainerPoint(layerPos),
		    padding = Point.point(this.options.autoPanPadding),
		    paddingTL = Point.point(this.options.autoPanPaddingTopLeft || padding),
		    paddingBR = Point.point(this.options.autoPanPaddingBottomRight || padding),
		    size = map.size,
		    dx = 0,
		    dy = 0

		if (containerPos.x + containerWidth + paddingBR.x > size.x) { // right
			dx = containerPos.x + containerWidth - size.x + paddingBR.x
		}
		if (containerPos.x - dx - paddingTL.x < 0) { // left
			dx = containerPos.x - paddingTL.x
		}
		if (containerPos.y + containerHeight + paddingBR.y > size.y) { // bottom
			dy = containerPos.y + containerHeight - size.y + paddingBR.y
		}
		if (containerPos.y - dy - paddingTL.y < 0) { // top
			dy = containerPos.y - paddingTL.y
		}

		if (dx || dy) {
			map
			    .fire('autopanstart')
			    .panBy([dx, dy])
		}
	}

	_onCloseButtonClick(e) {
		this._close()
		DomEvent.stop(e)
	}
}

export const PopupMapMixin = sup => class extends sup {
	openPopup(popup, latlng, options) { // (Popup) or (String || HTMLElement, LatLng[, Object])
		if (!(popup instanceof Popup)) {
			popup = new Popup(options).setContent(popup)
		}

		if (latlng) {
			popup.setLatLng(latlng)
		}

		if (this.hasLayer(popup)) {
			return this
		}

		if (this._popup && this._popup.options.autoClose) {
			this.closePopup()
		}

		this._popup = popup
		return this.addLayer(popup)
	}

	closePopup(popup) {
		if (!popup || popup === this._popup) {
			popup = this._popup
			this._popup = null
		}
		if (popup) {
			this.removeLayer(popup)
		}
		return this
	}
}
