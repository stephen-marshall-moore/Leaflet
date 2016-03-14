/*
 * L.DomEvent contains functions for working with DOM events.
 * Inspired by John Resig, Dean Edwards and YUI addEvent implementations.
 */
"use strict"

import {Util} from 'src/core/Util'
import {Browser} from 'src/core/Browser'
import {Point} from 'src/geometry/Point'

var DomEvent = {
	eventsKey: '_leaflet_events',

	_skipEvents: {},

	on: function(obj, types, fn, context) {

		if (typeof types === 'object') {
			for (let type in types) {
				this._on(obj, type, types[type], fn)
			}
		} else {
			types = Util.splitWords(types)

			for (let i = 0, len = types.length; i < len; i++) {
				this._on(obj, types[i], fn, context)
			}
		}

		return this
	},
	
	addListener: function(obj, types, fn, context) {
		return DomEvent.on(obj, types, fn, context)
	},

	off: function(obj, types, fn, context) {

		if (typeof types === 'object') {
			for (let type in types) {
				this._off(obj, type, types[type], fn)
			}
		} else {
			types = Util.splitWords(types)

			for (let i = 0, len = types.length; i < len; i++) {
				this._off(obj, types[i], fn, context)
			}
		}

		return this
	},
	
	removeListener: function(obj, types, fn, context) {
		return DomEvent.off(obj, types, fn, context)
	},

	_on: function(obj, type, fn, context) {
		let id = type + Util.stamp(fn) + (context ? '_' + Util.stamp(context) : '')

		if (obj[DomEvent.eventsKey] && obj[DomEvent.eventsKey][id]) { return this }

		let handler = function (e) {
			return fn.call(context || obj, e || window.event)
		}

		let originalHandler = handler

		if (Browser.pointer && type.indexOf('touch') === 0) {
			this.addPointerListener(obj, type, handler, id)

		} else if (Browser.touch && (type === 'dblclick') && this.addDoubleTapListener) {
			this.addDoubleTapListener(obj, handler, id)

		} else if ('addEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.addEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, false)

			} else if ((type === 'mouseenter') || (type === 'mouseleave')) {
				handler = function (e) {
					e = e || window.event
					if (DomEvent._isExternalTarget(obj, e)) {
						originalHandler(e)
					}
				}
				obj.addEventListener(type === 'mouseenter' ? 'mouseover' : 'mouseout', handler, false)

			} else {
				if (type === 'click' && Browser.android) {
					handler = function (e) {
						return DomEvent._filterClick(e, originalHandler)
					}
				}
				obj.addEventListener(type, handler, false)
			}

		} else if ('attachEvent' in obj) {
			obj.attachEvent('on' + type, handler)
		}

		obj[DomEvent.eventsKey] = obj[DomEvent.eventsKey] || {}
		obj[DomEvent.eventsKey][id] = handler

		return this
	},

	_off: function(obj, type, fn, context) {

		let id = type + Util.stamp(fn) + (context ? '_' + Util.stamp(context) : ''),
		    handler = obj[DomEvent.eventsKey] && obj[DomEvent.eventsKey][id]

		if (!handler) { return this }

		if (Browser.pointer && type.indexOf('touch') === 0) {
			this.removePointerListener(obj, type, id)

		} else if (Browser.touch && (type === 'dblclick') && this.removeDoubleTapListener) {
			this.removeDoubleTapListener(obj, id)

		} else if ('removeEventListener' in obj) {

			if (type === 'mousewheel') {
				obj.removeEventListener('onwheel' in obj ? 'wheel' : 'mousewheel', handler, false)

			} else {
				obj.removeEventListener(
					type === 'mouseenter' ? 'mouseover' :
					type === 'mouseleave' ? 'mouseout' : type, handler, false)
			}

		} else if ('detachEvent' in obj) {
			obj.detachEvent('on' + type, handler)
		}

		obj[DomEvent.eventsKey][id] = null

		return this
	},

	stopPropagation: function(e) {

		if (e.stopPropagation) {
			e.stopPropagation()
		} else if (e.originalEvent) {  // In case of Leaflet event.
			e.originalEvent._stopped = true
		} else {
			e.cancelBubble = true
		}
		DomEvent._skipped(e)

		return this
	},

	disableScrollPropagation: function(el) {
		return DomEvent.on(el, 'mousewheel', DomEvent.stopPropagation)
	},

	disableClickPropagation: function(el) {
		let stop = this.stopPropagation

		this.on(el, Draggable.START.join(' '), stop)

		return this.on(el, {
			click: DomEvent._fakeStop,
			dblclick: stop
		})
	},

	preventDefault: function(e) {

		if (e.preventDefault) {
			e.preventDefault()
		} else {
			e.returnValue = false
		}
		return this
	},

	stop: function(e) {
		return DomEvent
			.preventDefault(e)
			.stopPropagation(e)
	},

	getMousePosition: function(e, container) {
		if (!container) {
			return new Point(e.clientX, e.clientY)
		}

		let rect = container.getBoundingClientRect()

		return new Point(
			e.clientX - rect.left - container.clientLeft,
			e.clientY - rect.top - container.clientTop)
	},

	getWheelDelta: function(e) {
		return (e.deltaY && e.deltaMode === 0) ? -e.deltaY :        // Pixels
		       (e.deltaY && e.deltaMode === 1) ? -e.deltaY * 18 :   // Lines
		       (e.deltaY && e.deltaMode === 2) ? -e.deltaY * 52 :   // Pages
		       (e.deltaX || e.deltaZ) ? 0 :	// Skip horizontal/depth wheel events
		       e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : // Legacy IE pixels
		       (e.detail && Math.abs(e.detail) < 32765) ? -e.detail * 18 : // Legacy Moz lines
		       e.detail ? e.detail / -32765 * 52 : // Legacy Moz pages
		       0
	},

	_fakeStop: function(e) {
		// fakes stopPropagation by setting a special event flag, checked/reset with DomEvent._skipped(e)
		DomEvent._skipEvents[e.type] = true
	},

	_skipped: function(e) {
		let skipped = this._skipEvents[e.type]
		// reset when checking, as it's only used in map container and propagates outside of the map
		this._skipEvents[e.type] = false
		return skipped
	},

	// check if element really left/entered the event target (for mouseenter/mouseleave)
	_isExternalTarget: function(el, e) {

		let related = e.relatedTarget

		if (!related) { return true }

		try {
			while (related && (related !== el)) {
				related = related.parentNode
			}
		} catch (err) {
			return false
		}
		return (related !== el)
	},

	// this is a horrible workaround for a bug in Android where a single touch triggers two click events
	_filterClick: function(e, handler) {
		let timeStamp = (e.timeStamp || e.originalEvent.timeStamp),
		    elapsed = DomEvent._lastClick && (timeStamp - DomEvent._lastClick)

		// are they closer together than 500ms yet more than 100ms?
		// Android typically triggers them ~300ms apart while multiple listeners
		// on the same event should be triggered far faster;
		// or check if click is simulated on the element, and if it is, reject any non-simulated events

		if ((elapsed && elapsed > 100 && elapsed < 500) || (e.target._simulatedClick && !e._simulated)) {
			this.stop(e)
			return
		}

		this._lastClick = timeStamp

		handler(e)
	}
}

export {DomEvent}


