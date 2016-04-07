import {Util} from 'src/core/Util'
import {LatLng} from 'src/geo/LatLng'
import {Marker} from './marker/Marker'
import {CircleMarker} from './vector/CircleMarker'
import {Circle} from './vector/Circle'
import {Polyline} from './vector/Polyline'
import {Polygon} from './vector/Polygon'
import {FeatureGroup} from './FeatureGroup'

/*
 * GeoJSON turns any GeoJSON data into a Leaflet layer.
 */

export class GeoJSON extends FeatureGroup {

	constructor(geojson, options) {
		super({})

		this.options = this.options || {}
		Object.assign(this.options, options)

		if (geojson) {
			this.addData(geojson)
		}
	}

	addData(geojson) {
		let features = Array.isArray(geojson) ? geojson : geojson.features,
		    i, len, feature

		if (features) {
			for (i = 0, len = features.length; i < len; i++) {
				// only add this if geometry or geometries are set and not null
				feature = features[i]
				if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
					this.addData(feature)
				}
			}
			return this
		}

		let options = this.options

		if (options.filter && !options.filter(geojson)) { return this; }

		let layer = GeoJSON.geometryToLayer(geojson, options)
		if (!layer) {
			return this
		}
		layer.feature = GeoJSON.asFeature(geojson)

		layer.defaultOptions = layer.options
		this.resetStyle(layer)

		if (options.onEachFeature) {
			options.onEachFeature(geojson, layer)
		}

		return this.addLayer(layer)
	}

	resetStyle(layer) {
		// reset any custom styles
		layer.options = Util.extend({}, layer.defaultOptions)
		this._setLayerStyle(layer, this.options.style)
		return this
	}

	setStyle(style) {
		return this.eachLayer(function (layer) {
			this._setLayerStyle(layer, style)
		}, this)
	}

	_setLayerStyle(layer, style) {
		if (typeof style === 'function') {
			style = style(layer.feature)
		}
		if (layer.setStyle) {
			layer.setStyle(style)
		}
	}

	static geometryToLayer(geojson, options) {

		let geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
		    coords = geometry ? geometry.coordinates : null,
		    layers = [],
		    pointToLayer = options && options.pointToLayer,
		    coordsToLatLng = options && options.coordsToLatLng || GeoJSON.coordsToLatLng,
		    latlng, latlngs, i, len

		if (!coords && !geometry) {
			return null
		}

		switch (geometry.type) {
		case 'Point':
			latlng = coordsToLatLng(coords)
			return pointToLayer ? pointToLayer(geojson, latlng) : new Marker(latlng)

		case 'MultiPoint':
			for (i = 0, len = coords.length; i < len; i++) {
				latlng = coordsToLatLng(coords[i])
				layers.push(pointToLayer ? pointToLayer(geojson, latlng) : new Marker(latlng))
			}
			return new FeatureGroup(layers)

		case 'LineString':
		case 'MultiLineString':
			latlngs = this.coordsToLatLngs(coords, geometry.type === 'LineString' ? 0 : 1, coordsToLatLng)
			return new Polyline(latlngs, options)

		case 'Polygon':
		case 'MultiPolygon':
			latlngs = this.coordsToLatLngs(coords, geometry.type === 'Polygon' ? 1 : 2, coordsToLatLng)
			return new Polygon(latlngs, options)

		case 'GeometryCollection':
			for (i = 0, len = geometry.geometries.length; i < len; i++) {
				let layer = GeoJSON.geometryToLayer({
					geometry: geometry.geometries[i],
					type: 'Feature',
					properties: geojson.properties
				}, options)

				if (layer) {
					layers.push(layer)
				}
			}
			return new FeatureGroupEx(layers)

		default:
			throw new Error('Invalid GeoJSON object.')
		}
	}

	static coordsToLatLng(coords) {
		return new LatLng(coords[1], coords[0], coords[2])
	}

	static coordsToLatLngs(coords, levelsDeep, coordsToLatLng) {
		let latlngs = []

		for (let i = 0, len = coords.length, latlng; i < len; i++) {
			latlng = levelsDeep ?
			        GeoJSON.coordsToLatLngs(coords[i], levelsDeep - 1, coordsToLatLng) :
			        (coordsToLatLng || GeoJSON.coordsToLatLng)(coords[i])

			latlngs.push(latlng)
		}

		return latlngs
	}

	static latLngToCoords(latlng) {
		return latlng.alt !== undefined ?
				[latlng.lng, latlng.lat, latlng.alt] :
				[latlng.lng, latlng.lat]
	}

	static latLngsToCoords(latlngs, levelsDeep, closed) {
		let coords = []

		for (let i = 0, len = latlngs.length; i < len; i++) {
			coords.push(levelsDeep ?
				GeoJSON.latLngsToCoords(latlngs[i], levelsDeep - 1, closed) :
				GeoJSON.latLngToCoords(latlngs[i]))
		}

		if (!levelsDeep && closed) {
			coords.push(coords[0])
		}

		return coords
	}

	static getFeature(layer, newGeometry) {
		return layer.feature ?
				Util.extend({}, layer.feature, {geometry: newGeometry}) :
				GeoJSON.asFeature(newGeometry)
	}

	static asFeature(geojson) {
		if (geojson.type === 'Feature') {
			return geojson
		}

		return {
			type: 'Feature',
			properties: {},
			geometry: geojson
		}
	}
}

// for Marker, Circle, CircleMarker
export const PointToGeoJSON = sup => class extends sup {
	toGeoJSON() {
		return GeoJSON.getFeature(this, {
			type: 'Point',
			coordinates: GeoJSON.latLngToCoords(this._latlng)
		})
	}
}

// for Polyline
export const PolylineToGeoJSON = sup => class extends sup {
	toGeoJSON() {
		let multi = !Polyline._flat(this._latlngs)

		let coords = GeoJSON.latLngsToCoords(this._latlngs, multi ? 1 : 0)

		return GeoJSON.getFeature(this, {
			type: (multi ? 'Multi' : '') + 'LineString',
			coordinates: coords
		})
	}
}

// for Polygon
export const PolygonToGeoJSON = sup => class extends sup {
	toGeoJSON() {
		let holes = !Polyline._flat(this._latlngs),
			  multi = holes && !Polyline._flat(this._latlngs[0])

		let coords = GeoJSON.latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true)

		if (!holes) {
			coords = [coords]
		}

		return GeoJSON.getFeature(this, {
			type: (multi ? 'Multi' : '') + 'Polygon',
			coordinates: coords
		})
	}
}

// for LayerGroup
export const LayerGroupGeoJSONMixin = sup => class extends sup {
	toMultiPoint() {
		let coords = []

		this.eachLayer(function (layer) {
			coords.push(layer.toGeoJSON().geometry.coordinates)
		})

		return GeoJSON.getFeature(this, {
			type: 'MultiPoint',
			coordinates: coords
		})
	}

	toGeoJSON() {

		let type = this.feature && this.feature.geometry && this.feature.geometry.type

		if (type === 'MultiPoint') {
			return this.toMultiPoint()
		}

		let isGeometryCollection = type === 'GeometryCollection',
		    jsons = []

		this.eachLayer(function (layer) {
			if (layer.toGeoJSON) {
				let json = layer.toGeoJSON()
				jsons.push(isGeometryCollection ? json.geometry : GeoJSON.asFeature(json))
			}
		})

		if (isGeometryCollection) {
			return GeoJSON.getFeature(this, {
				geometries: jsons,
				type: 'GeometryCollection'
			})
		}

		return {
			type: 'FeatureCollection',
			features: jsons
		}
	}
}


class FeatureGroupEx extends LayerGroupGeoJSONMixin(FeatureGroup) {}

