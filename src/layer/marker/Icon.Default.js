import {Browser} from '../../core/Browser'
import {Icon} from './Icon'
/*
 * L.Icon.Default is the blue marker icon used by default in Leaflet.
 */

let _default_defaulticon_options = {
		iconSize:    [25, 41],
		iconAnchor:  [12, 41],
		popupAnchor: [1, -34],
		shadowSize:  [41, 41]
	}

export class DefaultIcon extends Icon {

	constructor(options)
		let opts = {}
		Object.assign(opts, _default_defaulticon_options, options)
		super(opts)
	}

	_getIconUrl(name) {
		let key = name + 'Url';

		if (this.options[key]) {
			return this.options[key];
		}

		let path = '/images' //DefaultIcon.imagePath

		if (!path) {
			throw new Error('Couldn\'t autodetect Icon.Default.imagePath, set it manually.')
		}

		return path + '/marker-' + name + (Browser.retina && name === 'icon' ? '-2x' : '') + '.png'
	}
})

/****
 **** TODO
L.Icon.Default.imagePath = (function () {
	var scripts = document.getElementsByTagName('script'),
	    leafletRe = /[\/^]leaflet[\-\._]?([\w\-\._]*)\.js\??/;

	var i, len, src, path;

	for (i = 0, len = scripts.length; i < len; i++) {
		src = scripts[i].src || '';

		if (src.match(leafletRe)) {
			path = src.split(leafletRe)[0];
			return (path ? path + '/' : '') + 'images';
		}
	}
}());
 ****/
