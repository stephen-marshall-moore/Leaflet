import {Browser} from 'src/core/Browser'
import {Util} from 'src/core/Util'
import {DomUtil} from 'src/dom/DomUtil'
import {DomEvent} from 'src/dom/DomEvent'
import {Renderer} from './Renderer'

/*
 * L.SVG renders vector layers with SVG. All SVG-specific code goes here.
 */

let _default_svg_options = {}

export class SVG extends Renderer {

	constructor(options = undefined) {
		super()
		Object.assign(this.options, _default_svg_options, options)
	}

	getEvents() {
		//let events = L.Renderer.prototype.getEvents.call(this)
		let events = super.getEvents()
		events.zoomstart = this._onZoomStart
		return events
	}

	_initContainer() {
		this._container = SVG.create('svg')

		// makes it possible to click through svg root we'll reset it back in individual paths
		this._container.setAttribute('pointer-events', 'none')

		this._rootGroup = SVG.create('g')
		this._container.appendChild(this._rootGroup)
	}

	_onZoomStart() {
		// Drag-then-pinch interactions might mess up the center and zoom.
		// In this case, the easiest way to prevent this is re-do the renderer
		//   bounds and padding when the zooming starts.
		this._update()
	}

	_update() {
		if (this._map._animatingZoom && this._bounds) { return }

		//L.Renderer.prototype._update.call(this)
		super._update()

		let b = this._bounds,
		    size = b.size,
		    container = this._container

		// set size of svg-container if changed
		if (!this._svgSize || !this._svgSize.equals(size)) {
			this._svgSize = size
			container.setAttribute('width', size.x)
			container.setAttribute('height', size.y)
		}

		// movement: update container viewBox so that we don't have to change coordinates of individual layers
		DomUtil.setPosition(container, b.min)
		container.setAttribute('viewBox', [b.min.x, b.min.y, size.x, size.y].join(' '))
	}

	// methods below are called by vector layers implementations

	_initPath(layer) {
		let path = layer._path = SVG.create('path')

		if (layer.options.className) {
			DomUtil.addClass(path, layer.options.className)
		}

		if (layer.options.interactive) {
			DomUtil.addClass(path, 'leaflet-interactive')
		}

		this._updateStyle(layer)
	}

	_addPath(layer) {
		this._rootGroup.appendChild(layer._path)
		layer.addInteractiveTarget(layer._path)
	}

	_removePath(layer) {
		DomUtil.remove(layer._path)
		layer.removeInteractiveTarget(layer._path)
	}

	_updatePath(layer) {
		layer._project()
		layer._update()
	}

	_updateStyle(layer) {
		var path = layer._path,
		    options = layer.options

		if (!path) { return }

		if (options.stroke) {
			path.setAttribute('stroke', options.color)
			path.setAttribute('stroke-opacity', options.opacity)
			path.setAttribute('stroke-width', options.weight)
			path.setAttribute('stroke-linecap', options.lineCap)
			path.setAttribute('stroke-linejoin', options.lineJoin)

			if (options.dashArray) {
				path.setAttribute('stroke-dasharray', options.dashArray)
			} else {
				path.removeAttribute('stroke-dasharray')
			}

			if (options.dashOffset) {
				path.setAttribute('stroke-dashoffset', options.dashOffset)
			} else {
				path.removeAttribute('stroke-dashoffset')
			}
		} else {
			path.setAttribute('stroke', 'none')
		}

		if (options.fill) {
			path.setAttribute('fill', options.fillColor || options.color)
			path.setAttribute('fill-opacity', options.fillOpacity)
			path.setAttribute('fill-rule', options.fillRule || 'evenodd')
		} else {
			path.setAttribute('fill', 'none')
		}

		path.setAttribute('pointer-events', options.pointerEvents || (options.interactive ? 'visiblePainted' : 'none'))
	}

	_updatePoly(layer, closed) {
		this._setPath(layer, SVG.pointsToPath(layer._parts, closed))
	}

	_updateCircle(layer) {
		let p = layer._point,
		    r = layer._radius,
		    r2 = layer._radiusY || r,
		    arc = 'a' + r + ',' + r2 + ' 0 1,0 '

		// drawing a circle with two half-arcs
		let d = layer._empty() ? 'M0 0' :
				'M' + (p.x - r) + ',' + p.y +
				arc + (r * 2) + ',0 ' +
				arc + (-r * 2) + ',0 '

		this._setPath(layer, d)
	}

	_setPath(layer, path) {
		layer._path.setAttribute('d', path)
	}

	// SVG does not have the concept of zIndex so we resort to changing the DOM order of elements
	_bringToFront(layer) {
		DomUtil.toFront(layer._path)
	}

	_bringToBack(layer) {
		DomUtil.toBack(layer._path)
	}

	static create(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name)
	}

	// generates SVG path string for multiple rings, with each ring turning into "M..L..L.." instructions
	static pointsToPath(rings, closed) {
		var str = '',
		    i, j, len, len2, points, p

		for (i = 0, len = rings.length; i < len; i++) {
			points = rings[i]

			for (j = 0, len2 = points.length; j < len2; j++) {
				p = points[j]
				str += (j ? 'L' : 'M') + p.x + ' ' + p.y
			}

			// closes the ring for polygons "x" is VML syntax
			str += closed ? (Browser.svg ? 'z' : 'x') : ''
		}

		// SVG complains about empty path strings
		return str || 'M0 0'
	}

}

/***
L.extend(L.SVG, {
	create(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name)
	}

	// generates SVG path string for multiple rings, with each ring turning into "M..L..L.." instructions
	pointsToPath(rings, closed) {
		var str = '',
		    i, j, len, len2, points, p

		for (i = 0, len = rings.length i < len i++) {
			points = rings[i]

			for (j = 0, len2 = points.length j < len2 j++) {
				p = points[j]
				str += (j ? 'L' : 'M') + p.x + ' ' + p.y
			}

			// closes the ring for polygons "x" is VML syntax
			str += closed ? (L.Browser.svg ? 'z' : 'x') : ''
		}

		// SVG complains about empty path strings
		return str || 'M0 0'
	}
})

L.Browser.svg = !!(document.createElementNS && L.SVG.create('svg').createSVGRect)

L.svg = function (options) {
	return L.Browser.svg || L.Browser.vml ? new L.SVG(options) : null
}
***/
