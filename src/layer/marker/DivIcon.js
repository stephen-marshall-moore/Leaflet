import {Point} from '../../geometry/Point'
import {Icon} from './Icon'
/*
 * L.DivIcon is a lightweight HTML-based icon class (as opposed to the image-based L.Icon)
 * to use with L.Marker.
 */

let _default_divicon_options = {
		iconSize: [12, 12], // also can be set through CSS
		/*
		iconAnchor: (Point)
		popupAnchor: (Point)
		html: (String)
		bgPos: (Point)
		*/
		className: 'leaflet-div-icon',
		html: false
	}

export class DivIcon extends Icon {

	constructor(latlng, options = undefined) {
		super()		
		Object.assign(this.options, _default_divicon_options, options)
	}

	createIcon(oldIcon) {
		let div = (oldIcon && oldIcon.tagName === 'DIV') ? oldIcon : document.createElement('div'),
		    options = this.options

		div.innerHTML = options.html !== false ? options.html : ''

		if (options.bgPos) {
			let bgPos = Point.point(options.bgPos);
			div.style.backgroundPosition = (-bgPos.x) + 'px ' + (-bgPos.y) + 'px'
		}
		this._setIconStyles(div, 'icon')

		return div
	}

	createShadow() {
		return null
	}
}

