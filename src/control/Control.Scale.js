import {DomUtil} from 'src/dom/DomUtil'
import {DomEvent} from 'src/dom/DomEvent'
import {Control} from './Control'

/*
 * L.Control.Scale is used for displaying metric/imperial scale on the map.
 */

let _default_scale_options = {
		position: 'bottomleft',
		maxWidth: 100,
		metric: true,
		imperial: true
		// updateWhenIdle: false
	}

export class Scale extends Control {

	constructor(options) {
		super()
		Object.assign(this.options, _default_scale_options, options)
	}

	onAdd(map) {
		let className = 'leaflet-control-scale',
		    container = DomUtil.create('div', className),
		    options = this.options

		this._addScales(options, className + '-line', container)

		map.on(options.updateWhenIdle ? 'moveend' : 'move', this._update, this)
		map.whenReady(this._update, this)

		return container
	}

	onRemove(map) {
		map.off(this.options.updateWhenIdle ? 'moveend' : 'move', this._update, this)
	}

	_addScales(options, className, container) {
		if (options.metric) {
			this._mScale = DomUtil.create('div', className, container)
		}
		if (options.imperial) {
			this._iScale = DomUtil.create('div', className, container)
		}
	}

	_update() {
		let map = this._map,
		    y = map.size.y / 2

		let maxMeters = map.distance(
				map.containerPointToLatLng([0, y]),
				map.containerPointToLatLng([this.options.maxWidth, y]))

		this._updateScales(maxMeters)
	}

	_updateScales(maxMeters) {
		if (this.options.metric && maxMeters) {
			this._updateMetric(maxMeters)
		}
		if (this.options.imperial && maxMeters) {
			this._updateImperial(maxMeters)
		}
	}

	_updateMetric(maxMeters) {
		let meters = this._getRoundNum(maxMeters),
		    label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km'

		this._updateScale(this._mScale, label, meters / maxMeters)
	}

	_updateImperial(maxMeters) {
		let maxFeet = maxMeters * 3.2808399,
		    maxMiles, miles, feet

		if (maxFeet > 5280) {
			maxMiles = maxFeet / 5280
			miles = this._getRoundNum(maxMiles)
			this._updateScale(this._iScale, miles + ' mi', miles / maxMiles)

		} else {
			feet = this._getRoundNum(maxFeet)
			this._updateScale(this._iScale, feet + ' ft', feet / maxFeet)
		}
	}

	_updateScale(scale, text, ratio) {
		scale.style.width = Math.round(this.options.maxWidth * ratio) + 'px'
		scale.innerHTML = text
	}

	_getRoundNum(num) {
		let pow10 = Math.pow(10, (Math.floor(num) + '').length - 1),
		    d = num / pow10

		d = d >= 10 ? 10 :
		    d >= 5 ? 5 :
		    d >= 3 ? 3 :
		    d >= 2 ? 2 : 1

		return pow10 * d
	}
}

