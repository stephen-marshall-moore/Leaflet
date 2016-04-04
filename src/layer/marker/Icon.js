import {Browser} from '../../core/Browser'
import {Point} from '../../geometry/Point'
/*
 * L.Icon is an image-based icon class that you can use with L.Marker for custom markers.
 */

export class Icon {
	/*
	options: {
		iconUrl: (String) (required)
		iconRetinaUrl: (String) (optional, used for retina devices if detected)
		iconSize: (Point) (can be set through CSS)
		iconAnchor: (Point) (centered by default, can be set in CSS with negative margins)
		popupAnchor: (Point) (if not specified, popup opens in the anchor point)
		shadowUrl: (String) (no shadow by default)
		shadowRetinaUrl: (String) (optional, used for retina devices if detected)
		shadowSize: (Point)
		shadowAnchor: (Point)
		className: (String)
	}
	*/

	constructor(options = undefined) {
		this.options = options || {}
	}

	createIcon(oldIcon) {
		return this._createIcon('icon', oldIcon)
	}

	createShadow(oldIcon) {
		return this._createIcon('shadow', oldIcon)
	}

	_createIcon(name, oldIcon) {
		let src = this._getIconUrl(name)

		if (!src) {
			if (name === 'icon') {
				throw new Error('iconUrl not set in Icon options (see the docs).')
			}
			return null
		}

		let img = this._createImg(src, oldIcon && oldIcon.tagName === 'IMG' ? oldIcon : null)
		this._setIconStyles(img, name)

		return img
	}

	_setIconStyles(img, name) {
		let options = this.options,
		    size = Point.point(options[name + 'Size']),
		    anchor = Point.point(name === 'shadow' && options.shadowAnchor || options.iconAnchor ||
		            size && size.divideBy(2, true))

		img.className = 'leaflet-marker-' + name + ' ' + (options.className || '')

		if (anchor) {
			img.style.marginLeft = (-anchor.x) + 'px'
			img.style.marginTop  = (-anchor.y) + 'px'
		}

		if (size) {
			img.style.width  = size.x + 'px'
			img.style.height = size.y + 'px'
		}
	}

	_createImg(src, el) {
		el = el || document.createElement('img')
		el.src = src
		return el
	}

	_getIconUrl(name) {
		return Browser.retina && this.options[name + 'RetinaUrl'] || this.options[name + 'Url']
	}
}

