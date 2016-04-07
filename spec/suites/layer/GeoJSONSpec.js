import {Util} from 'src/core/Util'
import {Marker as MarkerBase} from 'src/layer/marker/Marker'
import {Circle as CircleBase} from 'src/layer/vector/Circle'
import {CircleMarker as CircleMarkerBase} from 'src/layer/vector/CircleMarker'
import {Polyline as PolylineBase} from 'src/layer/vector/Polyline'
import {Polygon as PolygonBase} from 'src/layer/vector/Polygon'
import {TileLayer} from 'src/layer/tile/TileLayer'
import {LayerGroup as LayerGroupBase} from 'src/layer/LayerGroup'
import {GeoJSON, PointToGeoJSON, PolylineToGeoJSON, PolygonToGeoJSON, LayerGroupGeoJSONMixin} from 'src/layer/GeoJSON'
import {RendererMixin} from 'src/layer/vector/RendererMixin'
import {Map as MapBase} from 'src/map/Map'

describe("GeoJSON", function () {

	describe("addData", function () {
		let geojson = {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'Point',
				coordinates: [20, 10, 5]
			}
		}, geojsonEmpty = {
			type: 'Feature',
			properties: {},
			geometry: null
		}

		it("sets feature property on member layers", function () {
			let layer = new GeoJSON()
			layer.addData(geojson)
			expect(layer.getLayers()[0].feature).to.eql(geojson)
		})

		it("normalizes a geometry to a Feature", function () {
			let layer = new GeoJSON()
			layer.addData(geojson.geometry)
			expect(layer.getLayers()[0].feature).to.eql(geojson)
		})

		it("accepts geojson with null geometry", function () {
			let layer = new GeoJSON()
			layer.addData(geojsonEmpty)
			expect(layer.getLayers().length).to.eql(0)
		})
	})

	describe('resetStyle', function () {

		it('should reset init options', function () {
			let feature = {
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates:[[-2.35, 51.38], [-2.38, 51.38]]
				}
			}
			let geojson = new GeoJSON(feature, {weight: 7, color: 'chocolate'})
			let layer = geojson.getLayers()[0]
			geojson.setStyle({weight: 22, color: 'coral'})
			expect(layer.options.weight).to.be(22)
			expect(layer.options.color).to.be('coral')
			geojson.resetStyle(layer)
			expect(layer.options.weight).to.be(7)
			expect(layer.options.color).to.be('chocolate')
		})

	})

})

describe("Marker#toGeoJSON", function () {
	class Marker extends PointToGeoJSON(MarkerBase) {}

	it("returns a 2D Point object", function () {
		let marker = new Marker([10, 20])
		expect(marker.toGeoJSON().geometry).to.eql({
			type: 'Point',
			coordinates: [20, 10]
		})
	})

	it("returns a 3D Point object", function () {
		let marker = new Marker([10, 20, 30])
		expect(marker.toGeoJSON().geometry).to.eql({
			type: 'Point',
			coordinates: [20, 10, 30]
		})
	})
})

describe("Circle#toGeoJSON", function () {
	class Circle extends PointToGeoJSON(CircleBase) {}

	it("returns a 2D Point object", function () {
		let circle = new Circle([10, 20], 100)
		expect(circle.toGeoJSON().geometry).to.eql({
			type: 'Point',
			coordinates: [20, 10]
		})
	})

	it("returns a 3D Point object", function () {
		let circle = new Circle([10, 20, 30], 100)
		expect(circle.toGeoJSON().geometry).to.eql({
			type: 'Point',
			coordinates: [20, 10, 30]
		})
	})
})

describe("CircleMarker#toGeoJSON", function () {
	class CircleMarker extends PointToGeoJSON(CircleMarkerBase) {}

	it("returns a 2D Point object", function () {
		let marker = new CircleMarker([10, 20])
		expect(marker.toGeoJSON().geometry).to.eql({
			type: 'Point',
			coordinates: [20, 10]
		})
	})

	it("returns a 3D Point object", function () {
		let marker = new CircleMarker([10, 20, 30])
		expect(marker.toGeoJSON().geometry).to.eql({
			type: 'Point',
			coordinates: [20, 10, 30]
		})
	})
})

describe("Polyline#toGeoJSON", function () {
	class Polyline extends PolylineToGeoJSON(PolylineBase) {}

	it("returns a 2D LineString object", function () {
		let polyline = new Polyline([[10, 20], [2, 5]])
		expect(polyline.toGeoJSON().geometry).to.eql({
			type: 'LineString',
			coordinates: [[20, 10], [5, 2]]
		})
	})

	it("returns a 3D LineString object", function () {
		let polyline = new Polyline([[10, 20, 30], [2, 5, 10]])
		expect(polyline.toGeoJSON().geometry).to.eql({
			type: 'LineString',
			coordinates: [[20, 10, 30], [5, 2, 10]]
		})
	})
})

describe("Polyline (multi) #toGeoJSON", function () {
	class Polyline extends PolylineToGeoJSON(PolylineBase) {}

	it("returns a 2D MultiLineString object", function () {
		let multiPolyline = new Polyline([[[10, 20], [2, 5]], [[1, 2], [3, 4]]])
		expect(multiPolyline.toGeoJSON().geometry).to.eql({
			type: 'MultiLineString',
			coordinates: [
				[[20, 10], [5, 2]],
				[[2, 1], [4, 3]]
			]
		})
	})

	it("returns a 3D MultiLineString object", function () {
		let multiPolyline = new Polyline([[[10, 20, 30], [2, 5, 10]], [[1, 2, 3], [4, 5, 6]]])
		expect(multiPolyline.toGeoJSON().geometry).to.eql({
			type: 'MultiLineString',
			coordinates: [
				[[20, 10, 30], [5, 2, 10]],
				[[2, 1, 3], [5, 4, 6]]
			]
		})
	})
})

describe("Polygon#toGeoJSON", function () {
	class Polygon extends PolygonToGeoJSON(PolygonBase) {}

	it("returns a 2D Polygon object (no holes) from a flat LatLngs array", function () {
		let polygon = new Polygon([[1, 2], [3, 4], [5, 6]])
		expect(polygon.toGeoJSON().geometry).to.eql({
			type: 'Polygon',
			coordinates: [[[2, 1], [4, 3], [6, 5], [2, 1]]]
		})
	})

	it("returns a 3D Polygon object (no holes) from a flat LatLngs array", function () {
		let polygon = new Polygon([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
		expect(polygon.toGeoJSON().geometry).to.eql({
			type: 'Polygon',
			coordinates: [[[2, 1, 3], [5, 4, 6], [8, 7, 9], [2, 1, 3]]]
		})
	})

	it("returns a 2D Polygon object from a simple GeoJSON like input", function () {
		let multiPolygon = new Polygon([[[1, 2], [3, 4], [5, 6]]])
		expect(multiPolygon.toGeoJSON().geometry).to.eql({
			type: 'Polygon',
			coordinates: [
				[[2, 1], [4, 3], [6, 5], [2, 1]]
			]
		})
	})

	it("returns a 3D MultiPolygon object from a simple GeoJSON like input", function () {
		let multiPolygon = new Polygon([[[1, 2, 3], [4, 5, 6], [7, 8, 9]]])
		expect(multiPolygon.toGeoJSON().geometry).to.eql({
			type: 'Polygon',
			coordinates: [
				[[2, 1, 3], [5, 4, 6], [8, 7, 9], [2, 1, 3]]
			]
		})
	})

	it("returns a 2D Polygon object (with holes)", function () {
		let polygon = new Polygon([[[1, 2], [3, 4], [5, 6]], [[7, 8], [9, 10], [11, 12]]])
		expect(polygon.toGeoJSON().geometry).to.eql({
			type: 'Polygon',
			coordinates: [
				[[2, 1], [4, 3], [6, 5], [2, 1]],
				[[8, 7], [10, 9], [12, 11], [8, 7]]
			]
		})
	})

	it("returns a 3D Polygon object (with holes)", function () {
		let polygon = new Polygon([[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[10, 11, 12], [13, 14, 15], [16, 17, 18]]])
		expect(polygon.toGeoJSON().geometry).to.eql({
			type: 'Polygon',
			coordinates: [
				[[2, 1, 3], [5, 4, 6], [8, 7, 9], [2, 1, 3]],
				[[11, 10, 12], [14, 13, 15], [17, 16, 18], [11, 10, 12]]
			]
		})
	})

})

describe("Polygon (multi) #toGeoJSON", function () {
	class Polygon extends PolygonToGeoJSON(PolygonBase) {}

	it("returns a 2D MultiPolygon object", function () {
		let multiPolygon = new Polygon([[[[1, 2], [3, 4], [5, 6]]]])
		expect(multiPolygon.toGeoJSON().geometry).to.eql({
			type: 'MultiPolygon',
			coordinates: [
				[[[2, 1], [4, 3], [6, 5], [2, 1]]]
			]
		})
	})

	it("returns a 3D MultiPolygon object", function () {
		let multiPolygon = new Polygon([[[[1, 2, 3], [4, 5, 6], [7, 8, 9]]]])
		expect(multiPolygon.toGeoJSON().geometry).to.eql({
			type: 'MultiPolygon',
			coordinates: [
				[[[2, 1, 3], [5, 4, 6], [8, 7, 9], [2, 1, 3]]]
			]
		})
	})

	it("returns a 2D MultiPolygon object with two polygons", function () {
		let multiPolygon = new Polygon([[[[1, 2], [3, 4], [5, 6]]], [[[7, 8], [9, 10], [11, 12]]]])
		expect(multiPolygon.toGeoJSON().geometry).to.eql({
			type: 'MultiPolygon',
			coordinates: [
				[[[2, 1], [4, 3], [6, 5], [2, 1]]],
				[[[8, 7], [10, 9], [12, 11], [8, 7]]]
			]
		})
	})

	it("returns a 2D MultiPolygon object with polygon having a hole", function () {
		let multiPolygon = new Polygon([[[[1, 2], [3, 4], [5, 6]], [[7, 8], [9, 10], [11, 12]]]])
		expect(multiPolygon.toGeoJSON().geometry).to.eql({
			type: 'MultiPolygon',
			coordinates: [
				[[[2, 1], [4, 3], [6, 5], [2, 1]], [[8, 7], [10, 9], [12, 11], [8, 7]]]
			]
		})
	})

})

describe("LayerGroup#toGeoJSON", function () {
	class Marker extends PointToGeoJSON(MarkerBase) {}
	class Circle extends PointToGeoJSON(CircleBase) {}
	class CircleMarker extends PointToGeoJSON(CircleMarkerBase) {}
	class Polyline extends PolylineToGeoJSON(PolylineBase) {}
	class Polygon extends PolygonToGeoJSON(PolygonBase) {}
	class LayerGroup extends LayerGroupGeoJSONMixin(LayerGroupBase) {}
	class GeoJSONExtended extends LayerGroupGeoJSONMixin(GeoJSON) {}

	it("returns a 2D FeatureCollection object", function () {
		let marker = new Marker([10, 20]),
		    polyline = new Polyline([[10, 20], [2, 5]]),
		    layerGroup = new LayerGroup([marker, polyline])
		expect(layerGroup.toGeoJSON()).to.eql({
			type: 'FeatureCollection',
			features: [marker.toGeoJSON(), polyline.toGeoJSON()]
		})
	})

	it("returns a 3D FeatureCollection object", function () {
		let marker = new Marker([10, 20, 30]),
		    polyline = new Polyline([[10, 20, 30], [2, 5, 10]]),
		    layerGroup = new LayerGroup([marker, polyline])
		expect(layerGroup.toGeoJSON()).to.eql({
			type: 'FeatureCollection',
			features: [marker.toGeoJSON(), polyline.toGeoJSON()]
		})
	})

	it("ensures that every member is a Feature", function () {
		let tileLayer = new TileLayer(),
		    layerGroup = new LayerGroup([tileLayer])

		tileLayer.toGeoJSON = function () {
			return {
				type: 'Point',
				coordinates: [20, 10]
			}
		}

		expect(layerGroup.toGeoJSON()).to.eql({
			type: 'FeatureCollection',
			features: [{
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'Point',
					coordinates: [20, 10]
				}
			}]
		})
	})

	it('roundtrips GeometryCollection features', function () {
		let json = {
			"type": "FeatureCollection",
			"features": [{
				"type": "Feature",
				"geometry": {
					"type": "GeometryCollection",
					"geometries": [{
						"type": "LineString",
						"coordinates": [[-122.4425587930444, 37.80666418607323], [-122.4428379594768, 37.80663578323093]]
					}, {
						"type": "LineString",
						"coordinates": [
							[-122.4425509770566, 37.80662588061205],
							[-122.4428340530617, 37.8065999493009]
						]
					}]
				},
				"properties": {
					"name": "SF Marina Harbor Master"
				}
			}]
		}

		expect(new GeoJSONExtended(json).toGeoJSON()).to.eql(json)
	})

	it('roundtrips MiltiPoint features', function () {
		let json = {
			"type": "FeatureCollection",
			"features": [{
				"type": "Feature",
				"geometry": {
					"type": "MultiPoint",
					"coordinates": [[-122.4425587930444, 37.80666418607323], [-122.4428379594768, 37.80663578323093]]
				},
				"properties": {
					"name": "Test MultiPoints"
				}
			}]
		}

		expect(new GeoJSONExtended(json).toGeoJSON()).to.eql(json)
	})

	it("omits layers which do not implement toGeoJSON", function () {
		let tileLayer = new TileLayer(),
		    layerGroup = new LayerGroup([tileLayer])
		expect(layerGroup.toGeoJSON()).to.eql({
			type: 'FeatureCollection',
			features: []
		})
	})
})
