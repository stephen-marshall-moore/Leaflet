/*
 * L.Evented is a base class that Leaflet classes inherit from to handle custom events.
 */
import {Util} from './Util'

export class Evented {

  constructor(parent) {
    this._events = {}
    this._eventParents = {}

    if (parent) {
      this._eventParents[Util.stamp(parent)] = parent
    }
  }

	on(types, fn, context) {

		// types can be a map of types/handlers
		if (typeof types === 'object') {
			for (let type in types) {
				// we don't process space-separated events here for performance
				// it's a hot path since Layer uses the on(obj) syntax
				this._on(type, types[type], fn)
			}

		} else {
			// types can be a string of space-separated words
			types = types.trim().split(' ')

			for (let type of types) {
				this._on(type, fn, context)
			}
		}

		return this
	}

	off(types, fn, context) {

		if (!types) {
			// clear all listeners if called without arguments
			delete this._events

		} else if (typeof types === 'object') {
			for (let type in types) {
				this._off(type, types[type], fn)
			}

		} else {
			types = types.trim().split(' ')

			for (let type of types) {
				this._off(type, fn, context)
			}
		}

		return this
	}

	// attach listener (without syntactic sugar now)
	_on(type, fn, context) {

		let events = this._events = this._events || {},
		    contextId = context && context !== this && Util.stamp(context)

		if (contextId) {
			// store listeners with custom context in a separate hash (if it has an id)
			// gives a major performance boost when firing and removing events (e.g. on map object)

			let indexKey = type + '_idx',
			    indexLenKey = type + '_len',
			    typeIndex = events[indexKey] = events[indexKey] || {},
			    id = Util.stamp(fn) + '_' + contextId

			if (!typeIndex[id]) {
				typeIndex[id] = {fn: fn, ctx: context}

				// keep track of the number of keys in the index to quickly check if it's empty
				events[indexLenKey] = (events[indexLenKey] || 0) + 1
			}

		} else {
			// individual layers mostly use "this" for context and don't fire listeners too often
			// so simple array makes the memory footprint better while not degrading performance

			events[type] = events[type] || []
			events[type].push({fn: fn})
		}
	}

	_off(type, fn, context) {
		let events = this._events,
		    indexKey = type + '_idx',
		    indexLenKey = type + '_len'

		if (!events) { return }

		if (!fn) {
			// clear all listeners for a type if function isn't specified
			delete events[type]
			delete events[indexKey]
			delete events[indexLenKey]
			return
		}

		let contextId = context && context !== this && Util.stamp(context),
		    listeners, i, len, listener, id

		if (contextId) {
			id = Util.stamp(fn) + '_' + contextId
			listeners = events[indexKey]

			if (listeners && listeners[id]) {
				listener = listeners[id]
				delete listeners[id]
				events[indexLenKey]--
			}

		} else {
			listeners = events[type]

			if (listeners) {
				for (let i = 0, len = listeners.length; i < len; i++) {
					if (listeners[i].fn === fn) {
						listener = listeners[i]
						listeners.splice(i, 1)
						break
					}
				}
			}
		}

		// set the removed listener to noop so that's not called if remove happens in fire
		if (listener) {
			listener.fn = Util.falseFn
		}
	}

	fire(type, data, propagate) {
		if (!this.listens(type, propagate)) { return this }

		let event = Util.extend({}, data, {type: type, target: this}),
		    events = this._events

		if (events) {
			var typeIndex = events[type + '_idx'],
			    i, len, listeners, id

			if (events[type]) {
				// make sure adding/removing listeners inside other listeners won't cause infinite loop
				listeners = events[type].slice()

				for (i = 0, len = listeners.length; i < len; i++) {
					listeners[i].fn.call(this, event)
				}
			}

			// fire event for the context-indexed listeners as well
			for (id in typeIndex) {
				typeIndex[id].fn.call(typeIndex[id].ctx, event)
			}
		}

		if (propagate) {
			// propagate the event to parents (set with addEventParent)
			this._propagateEvent(event)
		}

		return this
	}

	listens(type, propagate) {
		let events = this._events

		if (events && (events[type] || events[type + '_len'])) { return true }

		if (propagate) {
			// also check parents for listeners if event propagates
			for (let id in this._eventParents) {
				if (this._eventParents[id].listens(type, propagate)) { return true }
			}
		}
		return false
	}

	once(types, fn, context) {

		if (typeof types === 'object') {
			for (let type in types) {
				this.once(type, types[type], fn)
			}
			return this
		}

		var handler = Util.bind(function () {
			this
			    .off(types, fn, context)
			    .off(types, handler, context)
		}, this)

		// add a listener that's executed once and removed after that
		return this
		    .on(types, fn, context)
		    .on(types, handler, context)
	}

	// adds a parent to propagate events to (when you fire with true as a 3rd argument)
	addEventParent(obj) {
		this._eventParents = this._eventParents || {}
		this._eventParents[Util.stamp(obj)] = obj
		return this
	}

	removeEventParent(obj) {
		if (this._eventParents) {
			delete this._eventParents[Util.stamp(obj)]
		}
		return this
	}

	_propagateEvent(e) {
		for (let id in this._eventParents) {
			this._eventParents[id].fire(e.type, Util.extend({layer: e.target}, e), true)
		}
	}
}

