import {Browser} from '../../core/Browser'
import {Util} from '../../core/Util'
import {DomEvent} from '../../dom/DomEvent'
import {DomUtil} from '../../dom/DomUtil'
import {GridLayer} from './GridLayer'
/*
 * L.TileLayer is used for standard xyz-numbered tile layers.
 */

let _default_tile_options = {
		maxZoom: 18,

		subdomains: 'abc',
		errorTileUrl: '',
		zoomOffset: 0,

		maxNativeZoom: null, // Number
		tms: false,
		zoomReverse: false,
		detectRetina: false,
		crossOrigin: false
	}

export class TileLayer extends GridLayer {

	constructor(url_template, options = undefined) {
		super()
		this._url = url_template
		Object.assign(this.options, _default_tile_options, options)

		// detecting retina displays, adjusting tileSize and zoom levels
		if (this.options.detectRetina && Browser.retina && this.options.maxZoom > 0) {

			this.options.tileSize = Math.floor(this.options.tileSize / 2)
			this.options.zoomOffset++

			this.options.minZoom = Math.max(0, this.options.minZoom)
			this.options.maxZoom--
		}

		if (typeof this.options.subdomains === 'string') {
			this.options.subdomains = this.options.subdomains.split('')
		}

		// for https://github.com/Leaflet/Leaflet/issues/137
		if (!Browser.android) {
			this.on('tileunload', this._onTileRemove)
		}
	}

	setUrl(url, noRedraw) {
		this._url = url

		if (!noRedraw) {
			this.redraw()
		}
		return this
	}

	createTile(coords, done) {
		var tile = document.createElement('img')

		DomEvent.on(tile, 'load', Util.bind(this._tileOnLoad, this, done, tile))
		DomEvent.on(tile, 'error', Util.bind(this._tileOnError, this, done, tile))

		if (this.options.crossOrigin) {
			tile.crossOrigin = ''
		}

		/*
		 Alt tag is set to empty string to keep screen readers from reading URL and for compliance reasons
		 http://www.w3.org/TR/WCAG20-TECHS/H67
		*/
		tile.alt = ''

		tile.src = this.getTileUrl(coords)

		return tile
	}

	getTileUrl(coords) {
		let r = Browser.retina ? '@2x' : ''
		let s = this._getSubdomain(coords)
		let x = coords.x
		let y = this.options.tms ? this._globalTileRange.max.y - coords.y : coords.y
		let z = this._getZoomForUrl()

		if (typeof(this._url) === 'function') {
			//console.log("function: " + this._url.toString())
			return this._url(x,y,z)
		}

		return this._url
	}

	_tileOnLoad(done, tile) {
		// For https://github.com/Leaflet/Leaflet/issues/3332
		if (Browser.ielt9) {
			setTimeout(Util.bind(done, this, null, tile), 0)
		} else {
			done(null, tile)
		}
	}

	_tileOnError(done, tile, e) {
		var errorUrl = this.options.errorTileUrl
		if (errorUrl) {
			tile.src = errorUrl
		}
		done(e, tile)
	}

	getTileSize() {
		/***
		var map = this._map,
		    tileSize = L.GridLayer.prototype.getTileSize.call(this),
		    zoom = this._tileZoom + this.options.zoomOffset,
		    zoomN = this.options.maxNativeZoom
		***/

		let tileSize = super.getTileSize(),
				map = this._map,
		    zoom = this._tileZoom + this.options.zoomOffset,
		    zoomN = this.options.maxNativeZoom

		// increase tile size when overscaling
		return zoomN !== null && zoom > zoomN ?
				tileSize.divideBy(map.getZoomScale(zoomN, zoom)).round() :
				tileSize
	}

	_onTileRemove(e) {
		e.tile.onload = null
	}

	_getZoomForUrl() {

		var options = this.options,
		    zoom = this._tileZoom

		if (options.zoomReverse) {
			zoom = options.maxZoom - zoom
		}

		zoom += options.zoomOffset

		return options.maxNativeZoom !== null ? Math.min(zoom, options.maxNativeZoom) : zoom
	}

	_getSubdomain(tilePoint) {
		var index = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length
		return this.options.subdomains[index]
	}

	// stops loading all tiles in the background layer
	_abortLoading() {
		let i, tile
		for (i in this._tiles) {
			if (this._tiles[i].coords.z !== this._tileZoom) {
				tile = this._tiles[i].el

				tile.onload = Util.falseFn
				tile.onerror = Util.falseFn

				if (!tile.complete) {
					tile.src = Util.emptyImageUrl
					DomUtil.remove(tile)
				}
			}
		}
	}
}

