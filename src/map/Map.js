"use strict"

import {Evented} from '../core/Events'
import {Browser} from '../core/Browser'
import {Util} from '../core/Util'
import {DomUtil} from '../dom/DomUtil'
import {DomEvent} from '../dom/DomEvent'
import {Point} from '../geometry/Point'
import {Bounds} from '../geometry/Bounds'
import {LatLng} from '../geo/LatLng'
import {LatLngBounds} from '../geo/LatLngBounds'
import {EPSG3857} from '../geo/crs/CRS.EPSG3857'

/*
 * L.Map is the central class of the API - it is used to create a map.
 */
	const _default_map_options = {
			crs: new EPSG3857(),
			zoom: 5,
			minZoom: 4,
			maxZoom: 25,
			/*
			center: LatLng,
			zoom: Number,
			layers: Array,
			*/

			fadeAnimation: true,
			trackResize: true,
			markerZoomAnimation: true,
			maxBoundsViscosity: 0.0,
			transform3DLimit: 8388608, // Precision limit of a 32-bit float
			zoomSnap: 1,
			zoomDelta: 1
		}

export class Map extends Evented {

	constructor(id, options = undefined) {
		super()
		
		this.options = {}
		if(options) {
			Object.assign(this.options, _default_map_options, options)
		} else {
			this.options = _default_map_options
			options = {}
		}

		this._initContainer(id)
		this._initLayout()

		// hack for https://github.com/Leaflet/Leaflet/issues/1980
		//this._onResize = L.bind(this._onResize, this);

		this._initEvents()

		//not where this should go
		//this._loaded = true

		if (options.maxBounds !== undefined) {
			this.setMaxBounds(options.maxBounds)
		}

		if (options.zoom !== undefined) {
			this._zoom = this._limitZoom(options.zoom)
		}

		if (options.center && options.zoom !== undefined) {
			this.view = {center: LatLng.latLng(options.center), zoom: options.zoom, options: {reset: true}}
		}

		this._handlers = []
		this._layers = {}
		this._zoomBoundLayers = {}
		this._sizeChanged = true

		//this.callInitHooks()

		//this._addLayers(this.options.layers)
	}

	// public methods that modify map state

	// replaced by animation-powered implementation in Map.PanAnimation.js
	set view({center: c, zoom: z}) {
		this._zoom = z === undefined ? this._zoom : z
		this._lastCenter = LatLng.latLng(c)
		this._resetView(this._lastCenter, this._zoom)
		//return {center: this.center, zoom: this.zoom}
	}

	get view() {
		return {center: this.center, zoom: this.zoom}
	}

	get zoom() {
		return this._zoom
	}

	set center(latlng) {
		this._lastCenter = LatLng.latLng(latlng)
		this._resetView(this.center, this.zoom)
	}

	//set zoom({zoom: zoom, options: options = {}}) {
	set zoom(zoom) {
		//if (!this._loaded) {
		this._zoom = zoom
		this._resetView(this.center, this.zoom)
			//return this
		//}
		//return this.view = {center: this.center, zoom: zoom}
		// decided this was useless, return 6
	}

	zoomIn(delta, options) {
		delta = delta || (Browser.any3d ? this.options.zoomDelta : 1)
		return this.zoom({zoom: this._zoom + delta, options: options})
	}

	zoomOut(delta, options) {
		delta = delta || (Browser.any3d ? this.options.zoomDelta : 1)
		return this.setZoom({zoom: this._zoom - delta, options: options})
	}

	setZoomAround(latlng, zoom, options) {
		let scale = this.getZoomScale(zoom),
		    viewHalf = this.size.divideBy(2),
		    containerPoint = latlng instanceof Point ? latlng : this.latLngToContainerPoint(latlng),

		    centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
		    newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset))

		return this.view = { center: newCenter, zoom: zoom, options: {zoom: options}}
	}

	_getBoundsCenterZoom(bounds, options = {}) {

		bounds = bounds.getBounds ? bounds.getBounds() : LatLng.latLngBounds(bounds)

		let paddingTL = Point.point(options.paddingTopLeft || options.padding || [0, 0]),
		    paddingBR = Point.point(options.paddingBottomRight || options.padding || [0, 0]),

		    zoom = this.getBoundsZoom(bounds, false, paddingTL.add(paddingBR));

		zoom = (typeof options.maxZoom === 'number') ? Math.min(options.maxZoom, zoom) : zoom;

		var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2),

		    swPoint = this.project(bounds.southWest, zoom),
		    nePoint = this.project(bounds.northEast, zoom),
		    center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom)

		return {center: center, zoom: zoom}
	}

	fitBounds(bounds, options) {
		let target = this._getBoundsCenterZoom(bounds, options)
		return this.view = {center: target.center, zoom: target.zoom, options: options}
	}

	fitWorld(options) {
		return this.fitBounds([[-90, -180], [90, 180]], options)
	}

	panTo(center, options) { // (LatLng)
		return this.view = {center:center, zoom: this._zoom, options: {pan: options} }
	}

	panBy(offset) { // (Point)
		// replaced with animated panBy in Map.PanAnimation.js
		this.fire('movestart')

		this._rawPanBy(Point.point(offset))

		this.fire('move')
		return this.fire('moveend')
	}

	set maxBounds(bounds) {
		bounds = LatLngBounds.latLngBounds(bounds)

		if (!bounds) {
			return this.off('moveend', this._panInsideMaxBounds)
		} else if (this.options.maxBounds) {
			this.off('moveend', this._panInsideMaxBounds)
		}

		this.options.maxBounds = bounds

		if (this._loaded) {
			this._panInsideMaxBounds()
		}

		return this.on('moveend', this._panInsideMaxBounds)
	}

	get minZoom() {
		return this.options.minZoom === undefined ?
			(this._layersMinZoom === undefined ? 0 : this._layersMinZoom) :
			this.options.minZoom
	}

	set minZoom(zoom) {
		this.options.minZoom = zoom

		if (this._loaded && this.zoom < this.options.minZoom) {
			return this._zoom = zoom
		}

	}

	get maxZoom() {
		return this.options.maxZoom === undefined ?
			(this._layersMaxZoom === undefined ? Infinity : this._layersMaxZoom) :
			this.options.maxZoom
	}

	set maxZoom(zoom) {
		this.options.maxZoom = zoom

		if (this._loaded && this.zoom > this.options.maxZoom) {
			return this._zoom = zoom
		}

	}

	panInsideBounds(bounds, options) {
		this._enforcingBounds = true
		let center = this.center,
		    newCenter = this._limitCenter(center, this._zoom, LatLngBounds.latLngBounds(bounds))

		if (!center.equals(newCenter)) {
			this.panTo(newCenter, options)
		}

		this._enforcingBounds = false
		return this
	}

	invalidateSize(options) {
		if (!this._loaded) { return this }

		options = Util.extend({
			animate: false,
			pan: true
		}, options === true ? {animate: true} : options)

		let oldSize = this.size
		this._sizeChanged = true
		this._lastCenter = null

		let newSize = this.size,
		    oldCenter = oldSize.divideBy(2).round(),
		    newCenter = newSize.divideBy(2).round(),
		    offset = oldCenter.subtract(newCenter)

		if (!offset.x && !offset.y) { return this }

		if (options.animate && options.pan) {
			this.panBy(offset)

		} else {
			if (options.pan) {
				this._rawPanBy(offset)
			}

			this.fire('move')

			if (options.debounceMoveend) {
				clearTimeout(this._sizeTimer)
				this._sizeTimer = setTimeout(Util.bind(this.fire, this, 'moveend'), 200)
			} else {
				this.fire('moveend')
			}
		}

		return this.fire('resize', {oldSize: oldSize, newSize: newSize})
	}

	stop() {
		this.zoom = this._limitZoom(this._zoom)
		return this._stop()
	}

	// TODO handler.addTo
	addHandler(name, HandlerClass) {
		if (!HandlerClass) { return this }

		this[name] = new HandlerClass(this)
		let handler = this[name]

		this._handlers.push(handler)

		if (this.options[name]) {
			handler.enable()
		}

		return this
	}

	remove() {
		this._initEvents(true)

		try {
			// throws error in IE6-8
			delete this._container._leaflet
		} catch (e) {
			this._container._leaflet = undefined
		}

		DomUtil.remove(this._mapPane)

		if (this._clearControlPos) {
			this._clearControlPos()
		}

		this._clearHandlers()

		if (this._loaded) {
			this.fire('unload')
		}

		for (var i in this._layers) {
			this._layers[i].remove()
		}

		return this
	}

	createPane(name, container) {
		let className = 'leaflet-pane' + (name ? ' leaflet-' + name.replace('Pane', '') + '-pane' : ''),
		    pane = DomUtil.create('div', className, container || this._mapPane)

		if (name) {
			this._panes[name] = pane
		}
		return pane
	}

	// public methods for getting map state

	get center() { // (Boolean) -> LatLng
		this._checkIfLoaded()

		if (this._lastCenter && !this._moved()) {
			return this._lastCenter
		}
		return this.layerPointToLatLng(this._getCenterLayerPoint())
	}

	get zoom() {
		return this._zoom
	}

	get bounds() {
		let bounds = this.getPixelBounds(),
		    sw = this.unproject(bounds.bottomLeft),
		    ne = this.unproject(bounds.topRight)

		return new LatLngBounds(sw, ne)
	}

	getBoundsZoom(bounds, inside, padding) { // (LatLngBounds[, Boolean, Point]) -> Number
		bounds = LatLng.latLngBounds(bounds)
		padding = Point.point(padding || [0, 0])

		let zoom = this.zoom || 0,
		    min = this.minZoom,
		    max = this.maxZoom,
		    nw = bounds.northWest,
		    se = bounds.southEast,
		    size = this.size,
		    boundsSize = this.project(se, zoom).subtract(this.project(nw, zoom)).add(padding),
		    snap = Browser.any3d ? this.options.zoomSnap : 1

		let scale = Math.min(size.x / boundsSize.x, size.y / boundsSize.y)
		zoom = this.getScaleZoom(scale, zoom)

		if (snap) {
			zoom = inside ? Math.ceil(zoom / snap) * snap : Math.floor(zoom / snap) * snap;
		}

		return Math.max(min, Math.min(max, zoom))
	}

	get size() {
		if (!this._size || this._sizeChanged) {
			this._size = new Point(this._container.clientWidth, this._container.clientHeight)
			this._sizeChanged = false
		}
		return this._size.clone()
	}

	getPixelBounds(center, zoom) {
		let topLeftPoint = this._getTopLeftPoint(center, zoom)
		return new Bounds(topLeftPoint, topLeftPoint.add(this.size))
	}

	get pixelOrigin() {
		this._checkIfLoaded()
		return this._pixelOrigin
	}

	getPixelWorldBounds(zoom) {
		return this.options.crs.getProjectedBounds(zoom === undefined ? this.zoom : zoom)
	}

	getPane(pane) {
		return typeof pane === 'string' ? this._panes[pane] : pane;
	}

	get panes() {
		return this._panes
	}

	get container() {
		return this._container
	}


	// TODO replace with universal implementation after refactoring projections

	getZoomScale(toZoom, fromZoom) {
		let crs = this.options.crs
		fromZoom = fromZoom === undefined ? this._zoom : fromZoom
		return crs.scale(toZoom) / crs.scale(fromZoom)
	}

	getScaleZoom(scale, fromZoom) {
		let crs = this.options.crs
		fromZoom = fromZoom === undefined ? this.zoom : fromZoom
		return crs.zoom(scale * crs.scale(fromZoom))
	}

	// conversion methods

	project(latlng, zoom) { // (LatLng[, Number]) -> Point
		zoom = zoom === undefined ? this.zoom : zoom
		return this.options.crs.latLngToPoint(LatLng.latLng(latlng), zoom)
	}

	unproject(point, zoom) { // (Point[, Number]) -> LatLng
		zoom = zoom === undefined ? this.zoom : zoom
		return this.options.crs.pointToLatLng(Point.point(point), zoom)
	}

	layerPointToLatLng(point) { // (Point)
		let projectedPoint = Point.point(point).add(this.pixelOrigin)
		return this.unproject(projectedPoint)
	}

	latLngToLayerPoint(latlng) { // (LatLng)
		let projectedPoint = this.project(LatLng.latLng(latlng))._round()
		return projectedPoint._subtract(this.pixelOrigin)
	}

	wrapLatLng(latlng) {
		return this.options.crs.wrapLatLng(LatLng.latLng(latlng))
	}

	distance(latlng1, latlng2) {
		return this.options.crs.distance(LatLng.latLng(latlng1), LatLng.latLng(latlng2))
	}

	containerPointToLayerPoint(point) { // (Point)
		return Point.point(point).subtract(this._getMapPanePos())
	}

	layerPointToContainerPoint(point) { // (Point)
		return Point.point(point).add(this._getMapPanePos())
	}

	containerPointToLatLng(point) {
		let layerPoint = this.containerPointToLayerPoint(Point.point(point))
		return this.layerPointToLatLng(layerPoint)
	}

	latLngToContainerPoint(latlng) {
		return this.layerPointToContainerPoint(this.latLngToLayerPoint(LatLng.latLng(latlng)))
	}

	mouseEventToContainerPoint(e) { // (MouseEvent)
		return L.DomEvent.getMousePosition(e, this._container)
	}

	mouseEventToLayerPoint(e) { // (MouseEvent)
		return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e))
	}

	mouseEventToLatLng(e) { // (MouseEvent)
		return this.layerPointToLatLng(this.mouseEventToLayerPoint(e))
	}


	// map initialization methods

	_initContainer(id) {
		this._container = DomUtil.getById(id)
		let container = this._container

		if (!container) {
			throw new Error('Map container not found.');
		} else if (container._leaflet) {
			throw new Error('Map container is already initialized.');
		}

		DomEvent.on(container, 'scroll', this._onScroll, this)
		container._leaflet = true
	}

	_initLayout() {
		let container = this._container;

		this._fadeAnimated = this.options.fadeAnimation && Browser.any3d

		DomUtil.addClass(container, 'leaflet-container' +
			(Browser.touch ? ' leaflet-touch' : '') +
			(Browser.retina ? ' leaflet-retina' : '') +
			(Browser.ielt9 ? ' leaflet-oldie' : '') +
			(Browser.safari ? ' leaflet-safari' : '') +
			(this._fadeAnimated ? ' leaflet-fade-anim' : ''))

		let position = DomUtil.getStyle(container, 'position')

		if (position !== 'absolute' && position !== 'relative' && position !== 'fixed') {
			container.style.position = 'relative'
		}

		this._initPanes()

		if (this._initControlPos) {
			this._initControlPos()
		}
	}

	_initPanes() {
		this._panes = {}
		this._paneRenderers = {}

		let panes = this._panes

		this._mapPane = this.createPane('mapPane', this._container)
		DomUtil.setPosition(this._mapPane, new Point(0, 0))

		this.createPane('tilePane')
		this.createPane('shadowPane')
		this.createPane('overlayPane')
		this.createPane('markerPane')
		this.createPane('popupPane')

		if (!this.options.markerZoomAnimation) {
			DomUtil.addClass(panes.markerPane, 'leaflet-zoom-hide')
			DomUtil.addClass(panes.shadowPane, 'leaflet-zoom-hide')
		}
	}


	// private methods that modify map state

	_resetView(center, zoom) {
		DomUtil.setPosition(this._mapPane, new Point(0, 0))

		let loading = !this._loaded
		this._loaded = true
		zoom = this._limitZoom(zoom)

		this.fire('viewprereset')

		let zoomChanged = this._zoom !== zoom
		this
			._moveStart(zoomChanged)
			._move(center, zoom)
			._moveEnd(zoomChanged)

		this.fire('viewreset')

		if (loading) {
			this.fire('load')
		}
	}

	_moveStart(zoomChanged) {
		if (zoomChanged) {
			this.fire('zoomstart')
		}
		return this.fire('movestart')
	}

	_move(center, zoom, data) {
		if (zoom === undefined) {
			zoom = this._zoom
		}

		let zoomChanged = this._zoom !== zoom

		this._zoom = zoom
		this._lastCenter = center
		this._pixelOrigin = this._getNewPixelOrigin(center)

		if (zoomChanged) {
			this.fire('zoom', data)
		}
		return this.fire('move', data)
	}

	_moveEnd(zoomChanged) {
		if (zoomChanged) {
			this.fire('zoomend')
		}
		return this.fire('moveend')
	}

	_stop() {
		Util.cancelAnimFrame(this._flyToFrame)
		if (this._panAnim) {
			this._panAnim.stop()
		}
		return this
	}

	_rawPanBy(offset) {
		DomUtil.setPosition(this._mapPane, this._getMapPanePos().subtract(offset))
	}

	_getZoomSpan() {
		return this.maxZoom - this.minZoom
	}

	_panInsideMaxBounds() {
		if (!this._enforcingBounds) {
			this.panInsideBounds(this.options.maxBounds)
		}
	}

	_checkIfLoaded() {
		if (!this._loaded) {
			throw new Error('Set map center and zoom first.')
		}
	}

	// DOM event handling

	_initEvents(remove) {
		if (!DomEvent) { return }

		this._targets = {}
		this._targets[Util.stamp(this._container)] = this

		let onOff = remove ? 'off' : 'on'

		DomEvent[onOff](this._container, 'click dblclick mousedown mouseup ' +
			'mouseover mouseout mousemove contextmenu keypress', this._handleDOMEvent, this)

		if (this.options.trackResize) {
			DomEvent[onOff](window, 'resize', this._onResize, this)
		}

		if (Browser.any3d && this.options.transform3DLimit) {
			this[onOff]('moveend', this._onMoveEnd)
		}
	}

	_onResize() {
		Util.cancelAnimFrame(this._resizeRequest)
		this._resizeRequest = Util.requestAnimFrame(
		        function () { this.invalidateSize({debounceMoveend: true}) }, this)
	}

	_onScroll() {
		this._container.scrollTop  = 0
		this._container.scrollLeft = 0
	}

	_onMoveEnd() {
		let pos = this._getMapPanePos()
		if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
			// https://bugzilla.mozilla.org/show_bug.cgi?id=1203873 but Webkit also have
			// a pixel offset on very high values, see: http://jsfiddle.net/dg6r5hhb/
			this._resetView(this.center, this.zoom)
		}
	}

	_findEventTargets(e, type) {
		let targets = [],
		    target,
		    isHover = type === 'mouseout' || type === 'mouseover',
		    src = e.target || e.srcElement,
		    dragging = false

		while (src) {
			target = this._targets[Util.stamp(src)]
			if (target && (type === 'click' || type === 'preclick') && !e._simulated && this._draggableMoved(target)) {
				// Prevent firing click after you just dragged an object.
				dragging = true
				break
			}
			if (target && target.listens(type, true)) {
				if (isHover && !DomEvent._isExternalTarget(src, e)) { break }
				targets.push(target)
				if (isHover) { break }
			}
			if (src === this._container) { break }
			src = src.parentNode
		}
		if (!targets.length && !dragging && !isHover && DomEvent._isExternalTarget(src, e)) {
			targets = [this]
		}
		return targets
	}

	_handleDOMEvent(e) {
		if (!this._loaded || DomEvent._skipped(e)) { return }

		let type = e.type === 'keypress' && e.keyCode === 13 ? 'click' : e.type

		if (e.type === 'click') {
			// Fire a synthetic 'preclick' event which propagates up (mainly for closing popups).
			let synth = Util.extend({}, e)
			synth.type = 'preclick'
			this._handleDOMEvent(synth)
		}

		if (type === 'mousedown') {
			// prevents outline when clicking on keyboard-focusable element
			DomUtil.preventOutline(e.target || e.srcElement)
		}

		this._fireDOMEvent(e, type)
	}

	_fireDOMEvent(e, type, targets) {
		if (e._stopped) { return }

		// Find the layer the event is propagating from and its parents.
		targets = (targets || []).concat(this._findEventTargets(e, type))

		if (!targets.length) { return }

		let target = targets[0]
		if (type === 'contextmenu' && target.listens(type, true)) {
			DomEvent.preventDefault(e)
		}

		let data = {
			originalEvent: e
		}

		if (e.type !== 'keypress') {
			let isMarker = target instanceof Marker
			data.containerPoint = isMarker ?
					this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e)
			data.layerPoint = this.containerPointToLayerPoint(data.containerPoint)
			data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint)
		}

		for (var i = 0; i < targets.length; i++) {
			targets[i].fire(type, data, true)
			if (data.originalEvent._stopped ||
				(targets[i].options.nonBubblingEvents && L.Util.indexOf(targets[i].options.nonBubblingEvents, type) !== -1)) { return }
		}
	}

	_draggableMoved(obj) {
		obj = obj.options.draggable ? obj : this
		return (obj.dragging && obj.dragging.moved()) || (this.boxZoom && this.boxZoom.moved())
	}

	_clearHandlers() {
		for (var i = 0, len = this._handlers.length; i < len; i++) {
			this._handlers[i].disable()
		}
	}

	whenReady(callback, context) {
		if (this._loaded) {
			callback.call(context || this, {target: this})
		} else {
			this.on('load', callback, context)
		}
		return this
	}


	// private methods for getting map state

	_getMapPanePos() {
		return DomUtil.getPosition(this._mapPane) || new Point(0, 0)
	}

	_moved() {
		let pos = this._getMapPanePos()
		return pos && !pos.equals([0, 0])
	}

	_getTopLeftPoint(center, zoom) {
		let pixelOrigin = center && zoom !== undefined ?
			this._getNewPixelOrigin(center, zoom) : this.pixelOrigin
		return pixelOrigin.subtract(this._getMapPanePos())
	}

	_getNewPixelOrigin(center, zoom) {
		let viewHalf = this.size._divideBy(2)
		return this.project(center, zoom)._subtract(viewHalf)._add(this._getMapPanePos())._round()
	}

	_latLngToNewLayerPoint(latlng, zoom, center) {
		let topLeft = this._getNewPixelOrigin(center, zoom)
		return this.project(latlng, zoom)._subtract(topLeft)
	}

	// layer point of the current center
	_getCenterLayerPoint() {
		return this.containerPointToLayerPoint(this.size._divideBy(2))
	}

	// offset of the specified place to the current center in pixels
	_getCenterOffset(latlng) {
		return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint())
	}

	// adjust center for view to get inside bounds
	_limitCenter(center, zoom, bounds) {

		if (!bounds) { return center }

		let centerPoint = this.project(center, zoom),
		    viewHalf = this.size.divideBy(2),
		    viewBounds = new Bounds(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)),
		    offset = this._getBoundsOffset(viewBounds, bounds, zoom)

		// If offset is less than a pixel, ignore.
		// This prevents unstable projections from getting into
		// an infinite loop of tiny offsets.
		if (offset.round().equals([0, 0])) {
			return center
		}

		return this.unproject(centerPoint.add(offset), zoom)
	}

	// adjust offset for view to get inside bounds
	_limitOffset(offset, bounds) {
		if (!bounds) { return offset }

		let viewBounds = this.getPixelBounds(),
		    newBounds = new Bounds(viewBounds.min.add(offset), viewBounds.max.add(offset))

		return offset.add(this._getBoundsOffset(newBounds, bounds))
	}

	// returns offset needed for pxBounds to get inside maxBounds at a specified zoom
	_getBoundsOffset(pxBounds, maxBounds, zoom) {
		let projectedMaxBounds = Bounds.bounds(
		        this.project(maxBounds.northEast, zoom),
		        this.project(maxBounds.southWest, zoom)
		    ),
		    minOffset = projectedMaxBounds.min.subtract(pxBounds.min),
		    maxOffset = projectedMaxBounds.max.subtract(pxBounds.max),

		    dx = this._rebound(minOffset.x, -maxOffset.x),
		    dy = this._rebound(minOffset.y, -maxOffset.y)

		return new Point(dx, dy)
	}

	_rebound(left, right) {
		return left + right > 0 ?
			Math.round(left - right) / 2 :
			Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right))
	}

	_limitZoom(zoom) {
		let min = this.minZoom,
		    max = this.maxZoom,
		    snap = Browser.any3d ? this.options.zoomSnap : 1

		if (snap) {
			zoom = Math.round(zoom / snap) * snap
		}

		return Math.max(min, Math.min(max, zoom))
	}
}

