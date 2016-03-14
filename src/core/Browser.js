/*
 * L.Browser handles different browser and feature detections for internal Leaflet use.
 */

class BrowserClass {
	constructor() {
		let ua = navigator.userAgent.toLowerCase()
	  let doc = document.documentElement

		this.ie			= 'ActiveXObject' in window
		this.ielt9	= this.ie && !document.addEventListener
		this.edge		= 'msLaunchUri' in navigator && !('documentMode' in document)

		this.webkit			= ua.indexOf('webkit') !== -1
	  this.gecko			= ua.indexOf('gecko') !== -1  && !this.webkit && !window.opera && !this.ie
		this.android		= ua.indexOf('android') !== -1
		this.android23	= ua.search('android [23]') !== -1
	  this.chrome			= ua.indexOf('chrome') !== -1
		this.safari			= !chrome && ua.indexOf('safari') !== -1
	  this.phantomjs	= ua.indexOf('phantom') !== -1

		this.ie3d			= this.ie && ('transition' in doc.style)
		this.webkit3d	= ('WebKitCSSMatrix' in window) && ('m11' in new window.WebKitCSSMatrix()) && !this.android23
		this.gecko3d	= 'MozPerspective' in doc.style
		this.opera12	= 'OTransition' in doc.style
		this.any3d		= !window.L_DISABLE_3D && (this.ie3d || this.webkit3d || this.gecko3d) && !this.opera12 && !this.phantomjs

		this.mobile					= typeof orientation !== 'undefined' || ua.indexOf('mobile') !== -1
		this.mobileWebkit		= this.mobile && this.webkit
		this.mobileWebkit3d	= this.mobile && this.webkit3d
		this.mobileOpera		= this.mobile && window.opera
		this.mobileGecko		= this.mobile && this.gecko

		this.msPointer	= !window.PointerEvent && window.MSPointerEvent
		this.pointer		= (window.PointerEvent && navigator.pointerEnabled) || this.msPointer

		this.touch			= !window.L_NO_TOUCH && !this.phantomjs && (this.pointer || 'ontouchstart' in window ||
			(window.DocumentTouch && document instanceof window.DocumentTouch))

		this.retina = (window.devicePixelRatio || (window.screen.deviceXDPI / window.screen.logicalXDPI)) > 1
	}
}

const Browser = new BrowserClass()

export {Browser}
