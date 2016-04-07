import {Browser} from 'src/core/Browser'
import {Layer} from '../Layer'

/*
 * L.Path is the base class for all Leaflet vector layers like polygons and circles.
 */

let _default_path_options = {
		stroke: true,
		color: '#3388ff',
		weight: 3,
		opacity: 1,
		lineCap: 'round',
		lineJoin: 'round',
		// dashArray: null
		// dashOffset: null

		// fill: false
		// fillColor: same as color by default
		fillOpacity: 0.2,
		fillRule: 'evenodd',

		// className: ''
		interactive: true
	}

export class Path extends Layer {

	constructor(options = undefined) {
		super()
		Object.assign(this.options, _default_path_options, options)
	}

	beforeAdd(map) {
		// Renderer is set here because we need to call renderer.getEvents
		// before this.getEvents.
		this._renderer = map.getRenderer(this)
	}

	onAdd() {
		this._renderer._initPath(this)
		this._reset()
		this._renderer._addPath(this)
	}

	onRemove() {
		this._renderer._removePath(this)
	}

	getEvents() {
		return {
			zoomend: this._project,
			moveend: this._update,
			viewreset: this._reset
		}
	}

	redraw() {
		if (this._map) {
			this._renderer._updatePath(this)
		}
		return this
	}

	setStyle(style) {
		//L.setOptions(this, style)
		Object.assign(this.options, style)
		if (this._renderer) {
			this._renderer._updateStyle(this)
		}
		return this
	}

	bringToFront() {
		if (this._renderer) {
			this._renderer._bringToFront(this)
		}
		return this
	}

	bringToBack() {
		if (this._renderer) {
			this._renderer._bringToBack(this)
		}
		return this
	}

	getElement() {
		return this._path
	}

	_reset() {
		// defined in children classes
		this._project()
		this._update()
	}

	_clickTolerance() {
		// used when doing hit detection for Canvas layers
		return (this.options.stroke ? this.options.weight / 2 : 0) + (Browser.touch ? 10 : 0)
	}
}

