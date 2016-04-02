import {Browser} from '../../core/Browser'
import {Util} from '../../core/Util'
import {DomUtil} from '../../dom/DomUtil'
import {Point} from '../../geometry/Point'
import {Bounds} from '../../geometry/Bounds'
import {Layer} from '../Layer'

/*
 * L.GridLayer is used as base class for grid-like layers like TileLayer.
 */
let _default_grid_options = {
		pane: 'tilePane',

		tileSize: 256,
		opacity: 1,
		zIndex: 1,

		updateWhenIdle: Browser.mobile,
		updateInterval: 200,

		attribution: null,
		bounds: null,

		minZoom: 0
		// maxZoom: <Number>
		// noWrap: false
	}

export class GridLayer extends Layer {

	constructor(options = undefined) {
		super()
		Object.assign(this.options, _default_grid_options, options)
	}

	onAdd() {
		this._initContainer()

		this._levels = {}
		this._tiles = {}

		this._resetView()
		this._update()
	}

	beforeAdd(map) {
		map._addZoomLimit(this)
	}

	onRemove(map) {
		this._removeAllTiles()
		DomUtil.remove(this._container)
		map._removeZoomLimit(this)
		this._container = null
		this._tileZoom = null
	}

	bringToFront() {
		if (this._map) {
			DomUtil.toFront(this._container)
			this._setAutoZIndex(Math.max)
		}
		return this
	}

	bringToBack() {
		if (this._map) {
			DomUtil.toBack(this._container)
			this._setAutoZIndex(Math.min)
		}
		return this
	}

	getAttribution() {
		return this.options.attribution
	}

	getContainer() {
		return this._container
	}

	setOpacity(opacity) {
		this.options.opacity = opacity
		this._updateOpacity()
		return this
	}

	setZIndex(zIndex) {
		this.options.zIndex = zIndex
		this._updateZIndex()

		return this
	}

	isLoading() {
		return this._loading
	}

	redraw() {
		if (this._map) {
			this._removeAllTiles()
			this._update()
		}
		return this
	}

	getEvents() {
		var events = {
			viewprereset: this._invalidateAll,
			viewreset: this._resetView,
			zoom: this._resetView,
			moveend: this._onMoveEnd
		}

		if (!this.options.updateWhenIdle) {
			// update tiles on move, but not more often than once per given interval
			if (!this._onMove) {
				this._onMove = Util.throttle(this._onMoveEnd, this.options.updateInterval, this)
			}

			events.move = this._onMove
		}

		if (this._zoomAnimated) {
			events.zoomanim = this._animateZoom
		}

		return events
	}

	createTile() {
		//console.log('GridLayer.createTile')
		return document.createElement('div')
	}

	getTileSize() {
		var s = this.options.tileSize
		return s instanceof Point ? s : new Point(s, s)
	}

	_updateZIndex() {
		if (this._container && this.options.zIndex !== undefined && this.options.zIndex !== null) {
			this._container.style.zIndex = this.options.zIndex
		}
	}

	_setAutoZIndex(compare) {
		// go through all other layers of the same pane, set zIndex to max + 1 (front) or min - 1 (back)

		var layers = this.getPane().children,
		    edgeZIndex = -compare(-Infinity, Infinity) // -Infinity for max, Infinity for min

		for (var i = 0, len = layers.length, zIndex; i < len; i++) {

			zIndex = layers[i].style.zIndex

			if (layers[i] !== this._container && zIndex) {
				edgeZIndex = compare(edgeZIndex, +zIndex)
			}
		}

		if (isFinite(edgeZIndex)) {
			this.options.zIndex = edgeZIndex + compare(-1, 1)
			this._updateZIndex()
		}
	}

	_updateOpacity() {
		if (!this._map) { return }

		// IE doesn't inherit filter opacity properly, so we're forced to set it on tiles
		if (Browser.ielt9 || !this._map._fadeAnimated) {
			return
		}

		DomUtil.setOpacity(this._container, this.options.opacity)

		var now = +new Date(),
		    nextFrame = false,
		    willPrune = false

		for (var key in this._tiles) {
			var tile = this._tiles[key]
			if (!tile.current || !tile.loaded) { continue }

			var fade = Math.min(1, (now - tile.loaded) / 200)

			DomUtil.setOpacity(tile.el, fade)
			if (fade < 1) {
				nextFrame = true
			} else {
				if (tile.active) { willPrune = true }
				tile.active = true
			}
		}

		if (willPrune && !this._noPrune) { this._pruneTiles() }

		if (nextFrame) {
			Util.cancelAnimFrame(this._fadeFrame)
			//this._fadeFrame = Util.requestAnimFrame(this._updateOpacity, this)
			this._fadeFrame = Util.requestAnimFrame(() => this._updateOpacity())
		}
	}

	_initContainer() {
		if (this._container) { return }

		this._container = DomUtil.create('div', 'leaflet-layer')
		this._updateZIndex()

		if (this.options.opacity < 1) {
			this._updateOpacity()
		}

		this.getPane().appendChild(this._container)
	}

	_updateLevels() {

		var zoom = this._tileZoom,
		    maxZoom = this.options.maxZoom

		if (zoom === undefined) { return undefined }

		for (var z in this._levels) {
			if (this._levels[z].el.children.length || z === zoom) {
				this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom - z)
			} else {
				DomUtil.remove(this._levels[z].el)
				this._removeTilesAtZoom(z)
				delete this._levels[z]
			}
		}

		var level = this._levels[zoom],
		    map = this._map

		if (!level) {
			level = this._levels[zoom] = {}

			level.el = DomUtil.create('div', 'leaflet-tile-container leaflet-zoom-animated', this._container)
			level.el.style.zIndex = maxZoom

			level.origin = map.project(map.unproject(map.pixelOrigin), zoom).round()
			level.zoom = zoom

			this._setZoomTransform(level, map.center, map.zoom)

			// force the browser to consider the newly added element for transition
			Util.falseFn(level.el.offsetWidth)
		}

		this._level = level

		return level
	}

	_pruneTiles() {

		var key, tile

		var zoom = this._map.zoom
		if (zoom > this.options.maxZoom ||
			zoom < this.options.minZoom) { return this._removeAllTiles() }

		for (key in this._tiles) {
			tile = this._tiles[key]
			tile.retain = tile.current
		}

		for (key in this._tiles) {
			tile = this._tiles[key]
			if (tile.current && !tile.active) {
				var coords = tile.coords
				if (!this._retainParent(coords.x, coords.y, coords.z, coords.z - 5)) {
					this._retainChildren(coords.x, coords.y, coords.z, coords.z + 2)
				}
			}
		}

		for (key in this._tiles) {
			if (!this._tiles[key].retain) {
				this._removeTile(key)
			}
		}
	}

	_removeTilesAtZoom(zoom) {
		for (var key in this._tiles) {
			if (this._tiles[key].coords.z !== zoom) {
				continue
			}
			this._removeTile(key)
		}
	}

	_removeAllTiles() {
		for (var key in this._tiles) {
			this._removeTile(key)
		}
	}

	_invalidateAll() {
		for (var z in this._levels) {
			DomUtil.remove(this._levels[z].el)
			delete this._levels[z]
		}
		this._removeAllTiles()

		this._tileZoom = null
	}

	_retainParent(x, y, z, minZoom) {
		var x2 = Math.floor(x / 2),
		    y2 = Math.floor(y / 2),
		    z2 = z - 1,
		    coords2 = new Point(+x2, +y2)
		coords2.z = +z2

		var key = this._tileCoordsToKey(coords2),
		    tile = this._tiles[key]

		if (tile && tile.active) {
			tile.retain = true
			return true

		} else if (tile && tile.loaded) {
			tile.retain = true
		}

		if (z2 > minZoom) {
			return this._retainParent(x2, y2, z2, minZoom)
		}

		return false
	}

	_retainChildren(x, y, z, maxZoom) {

		for (var i = 2 * x; i < 2 * x + 2; i++) {
			for (var j = 2 * y; j < 2 * y + 2; j++) {

				var coords = new Point(i, j)
				coords.z = z + 1

				var key = this._tileCoordsToKey(coords),
				    tile = this._tiles[key]

				if (tile && tile.active) {
					tile.retain = true
					continue

				} else if (tile && tile.loaded) {
					tile.retain = true
				}

				if (z + 1 < maxZoom) {
					this._retainChildren(i, j, z + 1, maxZoom)
				}
			}
		}
	}

	_resetView(e) {
		var animating = e && (e.pinch || e.flyTo)
		this._setView(this._map.center, this._map.zoom, animating, animating)
	}

	_animateZoom(e) {
		this._setView(e.center, e.zoom, true, e.noUpdate)
	}

	_setView(center, zoom, noPrune, noUpdate) {
		var tileZoom = Math.round(zoom)
		if ((this.options.maxZoom !== undefined && tileZoom > this.options.maxZoom) ||
		    (this.options.minZoom !== undefined && tileZoom < this.options.minZoom)) {
			tileZoom = undefined
		}

		var tileZoomChanged = (tileZoom !== this._tileZoom)

		if (!noUpdate || tileZoomChanged) {

			this._tileZoom = tileZoom

			if (this._abortLoading) {
				this._abortLoading()
			}

			this._updateLevels()
			this._resetGrid()

			if (tileZoom !== undefined) {
				this._update(center)
			}

			if (!noPrune) {
				this._pruneTiles()
			}

			// Flag to prevent _updateOpacity from pruning tiles during
			// a zoom anim or a pinch gesture
			this._noPrune = !!noPrune
		}

		this._setZoomTransforms(center, zoom)
	}

	_setZoomTransforms(center, zoom) {
		for (var i in this._levels) {
			this._setZoomTransform(this._levels[i], center, zoom)
		}
	}

	_setZoomTransform(level, center, zoom) {
		var scale = this._map.getZoomScale(zoom, level.zoom),
		    translate = level.origin.multiplyBy(scale)
		        .subtract(this._map._getNewPixelOrigin(center, zoom)).round()

		if (Browser.any3d) {
			DomUtil.setTransform(level.el, translate, scale)
		} else {
			DomUtil.setPosition(level.el, translate)
		}
	}

	_resetGrid() {
		var map = this._map,
		    crs = map.options.crs,
		    tileSize = this._tileSize = this.getTileSize(),
		    tileZoom = this._tileZoom

		var bounds = this._map.getPixelWorldBounds(this._tileZoom)
		if (bounds) {
			this._globalTileRange = this._pxBoundsToTileRange(bounds)
		}

		this._wrapX = crs.wrapLng && !this.options.noWrap && [
			Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
			Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
		]
		this._wrapY = crs.wrapLat && !this.options.noWrap && [
			Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
			Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
		]
	}

	_onMoveEnd() {
		if (!this._map || this._map._animatingZoom) { return }

		this._resetView()
	}

	_getTiledPixelBounds(center) {
		var map = this._map,
		    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.zoom) : map.zoom,
		    scale = map.getZoomScale(mapZoom, this._tileZoom),
		    pixelCenter = map.project(center, this._tileZoom).floor(),
		    halfSize = map.size.divideBy(scale * 2)

		return new Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize))
	}

	// Private method to load tiles in the grid's active zoom level according to map bounds
	_update(center) {
		var map = this._map
		if (!map) { return }
		var zoom = map.zoom

		if (center === undefined) { center = map.center }
		if (this._tileZoom === undefined) { return }	// if out of minzoom/maxzoom

		var pixelBounds = this._getTiledPixelBounds(center),
		    tileRange = this._pxBoundsToTileRange(pixelBounds),
		    tileCenter = tileRange.center,
		    queue = []

		for (var key in this._tiles) {
			this._tiles[key].current = false
		}

		// _update just loads more tiles. If the tile zoom level differs too much
		// from the map's, let _setView reset levels and prune old tiles.
		if (Math.abs(zoom - this._tileZoom) > 1) { this._setView(center, zoom); return }

		// create a queue of coordinates to load tiles from
		for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
			for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
				var coords = new Point(i, j)
				coords.z = this._tileZoom

				if (!this._isValidTile(coords)) { continue }

				var tile = this._tiles[this._tileCoordsToKey(coords)]
				if (tile) {
					tile.current = true
				} else {
					queue.push(coords)
				}
			}
		}

		// sort tile queue to load tiles in order of their distance to center
		queue.sort(function (a, b) {
			return a.distanceTo(tileCenter) - b.distanceTo(tileCenter)
		})

		if (queue.length !== 0) {
			// if its the first batch of tiles to load
			if (!this._loading) {
				this._loading = true
				this.fire('loading')
			}

			// create DOM fragment to append tiles in one batch
			var fragment = document.createDocumentFragment()

			for (i = 0; i < queue.length; i++) {
				this._addTile(queue[i], fragment)
			}

			this._level.el.appendChild(fragment)
		}
	}

	_isValidTile(coords) {
		var crs = this._map.options.crs

		if (!crs.infinite) {
			// don't load tile if it's out of bounds and not wrapped
			var bounds = this._globalTileRange
			if ((!crs.wrapLng && (coords.x < bounds.min.x || coords.x > bounds.max.x)) ||
			    (!crs.wrapLat && (coords.y < bounds.min.y || coords.y > bounds.max.y))) { return false }
		}

		if (!this.options.bounds) { return true }

		// don't load tile if it doesn't intersect the bounds in options
		var tileBounds = this._tileCoordsToBounds(coords)
		return LatLngBounds.latLngBounds(this.options.bounds).overlaps(tileBounds)
	}

	_keyToBounds(key) {
		return this._tileCoordsToBounds(this._keyToTileCoords(key))
	}

	// converts tile coordinates to its geographical bounds
	_tileCoordsToBounds(coords) {

		var map = this._map,
		    tileSize = this.getTileSize(),

		    nwPoint = coords.scaleBy(tileSize),
		    sePoint = nwPoint.add(tileSize),

		    nw = map.wrapLatLng(map.unproject(nwPoint, coords.z)),
		    se = map.wrapLatLng(map.unproject(sePoint, coords.z))

		return new LatLngBounds.latLngBounds(nw, se)
	}

	// converts tile coordinates to key for the tile cache
	_tileCoordsToKey(coords) {
		return coords.x + ':' + coords.y + ':' + coords.z
	}

	// converts tile cache key to coordinates
	_keyToTileCoords(key) {
		var k = key.split(':'),
		    coords = new Point(+k[0], +k[1])
		coords.z = +k[2]
		return coords
	}

	_removeTile(key) {
		var tile = this._tiles[key]
		if (!tile) { return }

		DomUtil.remove(tile.el)

		delete this._tiles[key]

		this.fire('tileunload', {
			tile: tile.el,
			coords: this._keyToTileCoords(key)
		})
	}

	_initTile(tile) {
		DomUtil.addClass(tile, 'leaflet-tile')

		var tileSize = this.getTileSize()
		tile.style.width = tileSize.x + 'px'
		tile.style.height = tileSize.y + 'px'

		tile.onselectstart = Util.falseFn
		tile.onmousemove = Util.falseFn

		// update opacity on tiles in IE7-8 because of filter inheritance problems
		if (Browser.ielt9 && this.options.opacity < 1) {
			DomUtil.setOpacity(tile, this.options.opacity)
		}

		// without this hack, tiles disappear after zoom on Chrome for Android
		// https://github.com/Leaflet/Leaflet/issues/2078
		if (Browser.android && !Browser.android23) {
			tile.style.WebkitBackfaceVisibility = 'hidden'
		}
	}

	_addTile(coords, container) {
		var tilePos = this._getTilePos(coords),
		    key = this._tileCoordsToKey(coords)

		//var tile = this.createTile(this._wrapCoords(coords), Util.bind(this._tileReady, this, coords))
		var tile = this.createTile(this._wrapCoords(coords), () => this._tileReady(coords))
		//var tile = this.createTile(this._wrapCoords(coords))

		this._initTile(tile)

		// if createTile is defined with a second argument ("done" callback),
		// we know that tile is async and will be ready later otherwise
		if (this.createTile.length < 2) {
			// mark tile as ready, but delay one frame for opacity animation to happen
			//Util.requestAnimFrame(Util.bind(this._tileReady, this, coords, null, tile))
			//Util.requestAnimFrame(x => this._tileReady(x, coords, null, tile))
			Util.requestAnimFrame(() => this._tileReady(coords, null, tile))
		}

		DomUtil.setPosition(tile, tilePos)

		// save tile in cache
		this._tiles[key] = {
			el: tile,
			coords: coords,
			current: true
		}

		container.appendChild(tile)
		this.fire('tileloadstart', {
			tile: tile,
			coords: coords
		})
	}

	_tileReady(coords, err, tile) {
		if (!this._map) { return }

		if (err) {
			this.fire('tileerror', {
				error: err,
				tile: tile,
				coords: coords
			})
		}

		var key = this._tileCoordsToKey(coords)
		//console.log('_tileReady', key, arguments)

		tile = this._tiles[key]
		if (!tile) { return }

		tile.loaded = +new Date()
		if (this._map._fadeAnimated) {
			DomUtil.setOpacity(tile.el, 0)
			Util.cancelAnimFrame(this._fadeFrame)
			//this._fadeFrame = Util.requestAnimFrame(this._updateOpacity, this)
			this._fadeFrame = Util.requestAnimFrame(() => this._updateOpacity())
		} else {
			tile.active = true
			this._pruneTiles()
		}

		DomUtil.addClass(tile.el, 'leaflet-tile-loaded')

		this.fire('tileload', {
			tile: tile.el,
			coords: coords
		})

		if (this._noTilesToLoad()) {
			this._loading = false
			this.fire('load')

			if (Browser.ielt9 || !this._map._fadeAnimated) {
				//Util.requestAnimFrame(this._pruneTiles, this)
				Util.requestAnimFrame(() => this._pruneTiles())
			} else {
				// Wait a bit more than 0.2 secs (the duration of the tile fade-in)
				// to trigger a pruning.
				//setTimeout(Util.bind(this._pruneTiles, this), 250)
				setTimeout(() => this._pruneTiles(), 250)
			}
		}
	}

	_getTilePos(coords) {
		return coords.scaleBy(this.getTileSize()).subtract(this._level.origin)
	}

	_wrapCoords(coords) {
		var newCoords = new Point(
			this._wrapX ? Util.wrapNum(coords.x, this._wrapX) : coords.x,
			this._wrapY ? Util.wrapNum(coords.y, this._wrapY) : coords.y)
		newCoords.z = coords.z
		return newCoords
	}

	_pxBoundsToTileRange(bounds) {
		var tileSize = this.getTileSize()
		return new Bounds(
			bounds.min.unscaleBy(tileSize).floor(),
			bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]))
	}

	_noTilesToLoad() {
		for (var key in this._tiles) {
			if (!this._tiles[key].loaded) { return false }
		}
		return true
	}
}

