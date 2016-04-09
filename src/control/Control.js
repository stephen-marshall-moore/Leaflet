import {DomUtil} from 'src/dom/DomUtil'

/*
 * L.Control is a base class for implementing map controls. Handles positioning.
 * All other controls extend from this class.
 */

let _default_control_options = {
		position: 'topright'
	}

export class Control {

	constructor(options) {
		this.options = {}
		Object.assign(this.options, _default_control_options, options)
	}

	get position() {
		return this.options.position
	}

	set position(position) {
		let map = this._map

		if (map) {
			map.removeControl(this)
		}

		this.options.position = position

		if (map) {
			map.addControl(this)
		}
	}

	get container() {
		return this._container
	}

	addTo(map) {
		this.remove()
		this._map = map

		let container = this._container = this.onAdd(map),
		    pos = this.position,
		    corner = map._controlCorners[pos]

		DomUtil.addClass(container, 'leaflet-control')

		if (pos.indexOf('bottom') !== -1) {
			corner.insertBefore(container, corner.firstChild)
		} else {
			corner.appendChild(container)
		}

		return this
	}

	remove() {
		if (!this._map) {
			return this
		}

		DomUtil.remove(this._container)

		if (this.onRemove) {
			this.onRemove(this._map)
		}

		this._map = null

		return this
	}

	_refocusOnMap(e) {
		// if map exists and event is not a keyboard event
		if (this._map && e && e.screenX > 0 && e.screenY > 0) {
			this._map.container.focus()
		}
	}
}


// adds control-related methods to L.Map

export const ControlMixin = sup => class extends sup {

	addControl(control) {
		control.addTo(this)
		return this
	}

	removeControl(control) {
		control.remove()
		return this
	}

	_initControlPos() {
		let corners = this._controlCorners = {},
		    l = 'leaflet-',
		    container = this._controlContainer =
		            DomUtil.create('div', l + 'control-container', this._container)

		function createCorner(vSide, hSide) {
			var className = l + vSide + ' ' + l + hSide

			corners[vSide + hSide] = DomUtil.create('div', className, container)
		}

		createCorner('top', 'left')
		createCorner('top', 'right')
		createCorner('bottom', 'left')
		createCorner('bottom', 'right')
	}

	_clearControlPos() {
		DomUtil.remove(this._controlContainer)
	}
}

