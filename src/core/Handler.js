/*
	L.Handler is a base class for handler classes that are used internally to inject
	interaction features like dragging to classes like Map and Marker.
*/

export class Handler {
	constructor(el) {
		this._element = el
		this._enabled = false
	}

	enable() {
		if (this._enabled) { return }

		this._enabled = true
		this.addHooks()
	}

	disable() {
		if (!this._enabled) { return }

		this._enabled = false
		this.removeHooks()
	}

	get enabled() {
		return !!this._enabled
	}

	addHooks() {}

	removeHooks() {}
})
