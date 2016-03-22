"use strict"

import {Browser} from 'src/core/Browser'
import {DomEvent} from 'src/dom/DomEvent'
import {LatLng} from 'src/geo/LatLng'
import {LatLngBounds} from 'src/geo/LatLngBounds'
import {Map} from 'src/map/Map'
import {Layer} from 'src/layer/Layer'
import {GridLayer} from 'src/layer/tile/GridLayer'
import {TileLayer} from 'src/layer/tile/TileLayer'
import {Marker} from 'src/layer/marker/Marker'
import {DivIcon} from 'src/layer/marker/DivIcon'
// temporary, should fix distance function
import {EPSG3857} from 'src/geo/crs/CRS.EPSG3857'

describe("Map", function () {
	let crs,
			map,
			map_notready,
	    spy,
			container

	beforeEach(function () {
		crs = new EPSG3857()
		container = document.createElement('div')
		map = new Map(container, {center: new LatLng(30,50), zoom: 5})
		map_notready = new Map(document.createElement('div'))
	})

	/*** no change with this
	afterEach(function () {
		crs = undefined
		container = undefined
		map = undefined
		map_notready = undefined
	})
	***/

	describe("#constructor, checking options setting", function () {
		it("tries new without options", function () {
			let can = document.createElement('div')
			let map2 = new Map(can)
			expect(map2.options.minZoom).to.be(0)
			expect(map2.options.fadeAnimation).to.be(true)
			expect(map2.options.center).to.be.undefined
		})

		it("tries new with options", function () {
			let can = document.createElement('div')
			let map2 = new Map(can, {minZoom: 7, fadeAnimation: false, center: new LatLng(30,50)})
			expect(map2.options.minZoom).to.be(7)
			expect(map2.options.fadeAnimation).to.be(false)
			expect(map2.options.center).to.eql(new LatLng(30,50))
		})
	})

	describe("#setter investigation", function () {
		it("assigns return from setter", function () {
			let can = document.createElement('div')
			let map = new Map(can, {zoom: 7, center: new LatLng(30, 50)})			
			let x, z
			z = (x = (map.zoom = 8)) 
			expect(x).to.eql(8)
			expect(z).to.eql(8)
			//conclusion, return values in setters are useless
		})
	})

	describe("#remove", function () {
		it("fires an unload event if loaded", function () {
			let container = document.createElement('div')
			let map = new Map(container, {zoom: 0, center: new LatLng(0, 0)})
			let spy = sinon.spy()

			map.on('unload', spy)
			map.remove()
			expect(spy.called).to.be.ok()
		})

		it("fires no unload event if not loaded", function () {
			var container = document.createElement('div'),
			    map = new Map(container),
			    spy = sinon.spy();
			map.on('unload', spy);
			map.remove();
			expect(spy.called).not.to.be.ok();
		});

		describe("corner case checking", function () {
			/*** TODO: what should this test?
			it("throws an exception upon reinitialization", function () {
				var container = document.createElement('div'),
				    map = new Map(container);
				expect(function () {
					Map(container);
				}).to.throwException(function (e) {
					expect(e.message).to.eql("Map container is already initialized.");
				});
				map.remove();
			});
			***/

			it("throws an exception if a container is not found", function () {
				expect(function () {
					let map = new Map('nonexistentdivelement')
				}).to.throwException(function (e) {
					expect(e.message).to.eql("Map container not found.")
				})
				map.remove()
			})
		})

		it("undefines container._leaflet", function () {
			map.remove()
			expect(container._leaflet).to.be(undefined)
		})

		it("unbinds events", function () {
			let container = document.createElement('div'),
			    map = new Map(container),
			    spy = sinon.spy()

			map.view = {center: new LatLng(0, 0), zoom: 1}

			map.on('click dblclick mousedown mouseup mousemove', spy);
			map.remove();

			happen.click(container);
			happen.dblclick(container);
			happen.mousedown(container);
			happen.mouseup(container);
			happen.mousemove(container);

			expect(spy.called).to.not.be.ok();
		});
	});

	describe('#get center', function () {
			let container = document.createElement('div'),
			    map = new Map(container)
		it('throws if not set before', function () {
			expect(function () {
				let x = map.center
			}).to.throwError()
		})

		it('returns a precise center when zoomed in after being set (#426)', function () {
			let center = LatLng.latLng(10, 10)
			map.view = {center: center, zoom: 1}
			map.zoom = 19
			expect(map.center).to.eql(center)
		})

		it('returns correct center after invalidateSize (#1919)', function () {
			map.view = {center: new LatLng(10, 10), zoom: 1}
			map.invalidateSize()
			expect(map.center).not.to.eql(LatLng.latLng(10, 10))
		})
	})

	describe("#whenReady", function () {
		let container = document.createElement('div'),
				map = new Map(container)
		describe("when the map has not yet been loaded", function () {
			it("calls the callback when the map is loaded", function () {
				let spy = sinon.spy()
				map.whenReady(spy)
				expect(spy.called).to.not.be.ok()

				map.view = {center: LatLng.latLng([0,0]), zoom: 1}
				expect(spy.called).to.be.ok()
			})
		})

		describe("when the map has already been loaded", function () {
			it("calls the callback immediately", function () {
				let spy = sinon.spy()
				map.view = {center: LatLng.latLng([0,0]), zoom: 1}
				map.whenReady(spy)

				expect(spy.called).to.be.ok()
			})
		})
	})

	describe("#set view", function () {
		it("check default zoom", function () {
			expect(map.zoom).to.be(5)
		})

		it("sets the view of the map", function () {
			let c = LatLng.latLng([51.505, -0.09])
			let v = {center:c, zoom: 13}
			map.view = v
			expect(map.view).to.be.eql(v)
			expect(map.center).to.be.eql(c)
			expect(map.zoom).to.be(13)
			expect(map.center.distanceTo([51.505, -0.09])).to.be.lessThan(5)
		});

		it("can be passed without a zoom specified", function () {
			map.view = {center:[51.605, -0.11]}
			map.zoom = 13
			expect(map.zoom).to.be(13)
			expect(map.center.distanceTo([51.605, -0.11])).to.be.lessThan(5)
		})

		it("limits initial zoom when no zoom specified", function () {
			map.options.maxZoom = 20
			map.zoom = 100
			map.view = {center:[51.605, -0.11]}
			expect(map.zoom).to.be(20)
			expect(map.center.distanceTo([51.605, -0.11])).to.be.lessThan(5)
		})

		it("defaults to zoom passed as map option", function () {
			map = new Map(document.createElement('div'), {zoom: 13})
			map.view = {center:[51.605, -0.11]}
			expect(map.zoom).to.be(13)
		})

		/*** not up to animate yet
		it("passes duration option to panBy", function () {
			map = Map(document.createElement('div'), {zoom: 13, center: [0, 0]});
			map.panBy = sinon.spy();
			map.setView([51.605, -0.11], 13, {animate: true, duration: 13});
			expect(map.panBy.callCount).to.eql(1);
			expect(map.panBy.args[0][1].duration).to.eql(13);
		});
		***/
	})

	describe("#get bounds", function () {
		it("is safe to call from within a moveend callback during initial load (#1027)", function () {
			map.on("moveend", function () {let x = map.bounds})
			map.view = {center:LatLng.latLng([51.505, -0.09]), zoom: 13}
		})
	})

	describe('#set maxBounds', function () {
		it("aligns pixel-wise map view center with maxBounds center if it cannot move view bounds inside maxBounds (#1908)", function () {
			let container = map.container
			// large view, cannot fit within maxBounds
			container.style.width = container.style.height = "1000px"
			document.body.appendChild(container)
			// maxBounds
			let bounds = LatLngBounds.latLngBounds(LatLng.latLng([51.5, -0.05]), LatLng.latLng([51.55, 0.05]))
			map.maxBounds = bounds // options???, {animate: false});
			// set view outside
			map.view = {center: LatLng.latLng([53.0, 0.15]), zoom: 12, options: {animate: false}} 
			// get center of bounds in pixels
			let boundsCenter = map.project(bounds.center).round()
			expect(map.project(map.center).round()).to.eql(boundsCenter)
			document.body.removeChild(container)
		})

		it("moves map view within maxBounds by changing one coordinate", function () {
			let container = map.container
			// small view, can fit within maxBounds
			container.style.width = container.style.height = "200px"
			document.body.appendChild(container)
			// maxBounds
			let bounds = new LatLngBounds(LatLng.latLng([51, -0.2]), LatLng.latLng([52, 0.2]))
			map.maxBounds = bounds // options????, {animate: false});
			// set view outside maxBounds on one direction only
			// leaves untouched the other coordinate (that is not already centered)
			let initCenter = [53.0, 0.1]
			map.view = {center: LatLng.latLng(initCenter), zoom: 16, options: {animate: false}}
			// one pixel coordinate hasn't changed, the other has
			var pixelCenter = map.project(map.center).round()
			var pixelInit = map.project(initCenter).round()
			expect(pixelCenter.x).to.eql(pixelInit.x)
			expect(pixelCenter.y).not.to.eql(pixelInit.y)
			// the view is inside the bounds
			expect(bounds.contains(map.bounds)).to.be(true)
			document.body.removeChild(container)
		})
	})

	//***

	describe("#get MinZoom and #get MaxZoom", function () {
		describe('#get MinZoom', function () {
			it('returns 0 if not set by Map options or TileLayer options', function () {
				let map2 = new Map(document.createElement('div'))
				expect(map2.minZoom).to.be(0)
			});
		});

		it("minZoom and maxZoom options overrides any minZoom and maxZoom set on layers", function () {

			let map = new Map(document.createElement('div'), {minZoom: 2, maxZoom: 20})

			new TileLayer("{z}{x}{y}", {minZoom: 4, maxZoom: 10}).addTo(map)
			new TileLayer("{z}{x}{y}", {minZoom: 6, maxZoom: 17}).addTo(map)
			new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 22}).addTo(map)

			expect(map.minZoom).to.be(2);
			expect(map.maxZoom).to.be(20);
		});
	});

	describe("#getMinZoom and #getMaxZoom", function () {
		describe('#getMinZoom', function () {
			it('returns 0 if not set by Map options or TileLayer options', function () {
				let map2 = new Map(document.createElement('div'))
				expect(map2.minZoom).to.be(0)
			})
		})

		it("minZoom and maxZoom options overrides any minZoom and maxZoom set on layers", function () {

			let map = new Map(document.createElement('div'), {minZoom: 2, maxZoom: 20})

			new TileLayer("{z}{x}{y}", {minZoom: 4, maxZoom: 10}).addTo(map)
			new TileLayer("{z}{x}{y}", {minZoom: 6, maxZoom: 17}).addTo(map)
			new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 22}).addTo(map)

			expect(map.minZoom).to.be(2)
			expect(map.maxZoom).to.be(20)
		})
	});

	describe("#hasLayer", function () {
		it("returns false when passed undefined, null, or false", function () {
			let map = new Map(document.createElement('div'));
			expect(map.hasLayer(undefined)).to.equal(false);
			expect(map.hasLayer(null)).to.equal(false);
			expect(map.hasLayer(false)).to.equal(false);
		});
	});

	function layerSpy() {
		var layer = new Layer();
		layer.onAdd = sinon.spy();
		layer.onRemove = sinon.spy();
		return layer;
	}

	describe("#addLayer", function () {

		it("calls layer.onAdd immediately if the map is ready", function () {
			let layer = layerSpy()
			map.view = {center: [0, 0], zoom: 0}
			map.addLayer(layer)
			expect(layer.onAdd.called).to.be.ok()
		})

		it("calls layer.onAdd when the map becomes ready", function () {
			let map2 = new Map(document.createElement('div'))
			let layer = layerSpy()
			map2.addLayer(layer)
			expect(layer.onAdd.called).not.to.be.ok()
			map2.view = {center: [0, 0], zoom: 0}
			expect(layer.onAdd.called).to.be.ok()
		})

		it("does not call layer.onAdd if the layer is removed before the map becomes ready", function () {
			let map2 = new Map(document.createElement('div'))
			let layer = layerSpy()
			map2.addLayer(layer)
			map2.removeLayer(layer)
			map2.view = {center: [0, 0], zoom: 0}
			expect(layer.onAdd.called).not.to.be.ok()
		})

		it("fires a layeradd event immediately if the map is ready", function () {
			let layer = layerSpy(),
			    spy = sinon.spy()
			map.on('layeradd', spy)
			map.view = {center: [0, 0], zoom: 0}
			map.addLayer(layer)
			expect(spy.called).to.be.ok()
		})

		it("fires a layeradd event when the map becomes ready", function () {
			let layer = layerSpy(),
			    spy = sinon.spy()
			map_notready.on('layeradd', spy)
			map_notready.addLayer(layer)
			expect(spy.called).not.to.be.ok()
			map_notready.view = {center: [0, 0], zoom: 0}
			expect(spy.called).to.be.ok()
		})

		it("does not fire a layeradd event if the layer is removed before the map becomes ready", function () {
			let layer = layerSpy(),
			    spy = sinon.spy()
			map_notready.on('layeradd', spy)
			map_notready.addLayer(layer)
			map_notready.removeLayer(layer)
			map_notready.view = {center: [0, 0], zoom: 0}
			expect(spy.called).not.to.be.ok()
		})

		it("adds the layer before firing layeradd", function (done) {
			let layer = layerSpy()
			map.on('layeradd', function () {
				expect(map.hasLayer(layer)).to.be.ok()
				done()
			})
			map.view = {center: [0, 0], zoom: 0}
			map.addLayer(layer)
		})

		describe("When the first layer is added to a map", function () {
			it("fires a zoomlevelschange event", function () {
				let spy = sinon.spy()
				map_notready.on("zoomlevelschange", spy)
				//map_notready.view = {center: [0, 0], minZoom: undefined, maxZoom: undefined}
				expect(spy.called).not.to.be.ok()
				expect(map_notready._getZoomSpan()).to.be(25)
				expect(map_notready._layersMaxZoom).to.be(undefined)
				let tiles = new TileLayer("{z}{x}{y}", {minZoom: 5, maxZoom: 12})
				tiles.addTo(map_notready)
				expect(this._zoomBoundLayers).to.be(undefined)
				expect(map_notready._layersMaxZoom).to.be(12)
				expect(map_notready._getZoomSpan()).to.be(25)
				expect(spy.called).to.be.ok()
			})
		})

		describe("when a new layer with greater zoomlevel coverage than the current layer is added to a map", function () {
			it("fires a zoomlevelschange event", function () {
				let spy = sinon.spy()
				new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 5}).addTo(map)
				map.on("zoomlevelschange", spy)
				expect(spy.called).not.to.be.ok()
				new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 15}).addTo(map)
				expect(spy.called).to.be.ok()
			})
		})

		describe("when a new layer with the same or lower zoomlevel coverage as the current layer is added to a map", function () {
			it("fires no zoomlevelschange event", function () {
				let spy = sinon.spy()
				new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 5}).addTo(map)
				map.on("zoomlevelschange", spy)
				expect(spy.called).not.to.be.ok()
				new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map)
				expect(spy.called).not.to.be.ok()
				new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 5}).addTo(map)
				expect(spy.called).not.to.be.ok()
			})
		})
	})

	describe("#removeLayer", function () {
		it("calls layer.onRemove if the map is ready", function () {
			var layer = layerSpy();
			map.view = {center: [0, 0], zoom: 0}
			map.addLayer(layer);
			map.removeLayer(layer);
			expect(layer.onRemove.called).to.be.ok();
		});

		it("does not call layer.onRemove if the layer was not added", function () {
			var layer = layerSpy();
			map.view = {center: [0, 0], zoom: 0}
			map.removeLayer(layer);
			expect(layer.onRemove.called).not.to.be.ok();
		});

		it("does not call layer.onRemove if the map is not ready", function () {
			var layer = layerSpy();
			map_notready.addLayer(layer);
			map_notready.removeLayer(layer);
			expect(layer.onRemove.called).not.to.be.ok();
		});

		it("fires a layerremove event if the map is ready", function () {
			var layer = layerSpy(),
			    spy = sinon.spy();
			map.on('layerremove', spy);
			map.view = {center: [0, 0], zoom: 0}
			map.addLayer(layer);
			map.removeLayer(layer);
			expect(spy.called).to.be.ok();
		});

		it("does not fire a layerremove if the layer was not added", function () {
			var layer = layerSpy(),
			    spy = sinon.spy();
			map.on('layerremove', spy);
			map.view = {center: [0, 0], zoom: 0}
			map.removeLayer(layer);
			expect(spy.called).not.to.be.ok();
		});

		it("does not fire a layerremove if the map is not ready", function () {
			var layer = layerSpy(),
			    spy = sinon.spy();
			map_notready.on('layerremove', spy);
			map_notready.addLayer(layer);
			map_notready.removeLayer(layer);
			expect(spy.called).not.to.be.ok();
		});

		it("removes the layer before firing layerremove", function (done) {
			var layer = layerSpy();
			map.on('layerremove', function () {
				expect(map.hasLayer(layer)).not.to.be.ok();
				done();
			});
			map.view = {center: [0, 0], zoom: 0}
			map.addLayer(layer);
			map.removeLayer(layer);
		});

		it("supports adding and removing a tile layer without initializing the map", function () {
			var layer = new TileLayer("{z}{x}{y}");
			map.addLayer(layer);
			map.removeLayer(layer);
		});

		it("supports adding and removing a tile layer without initializing the map", function () {
			map.view = {center: [0, 0], zoom: 18}
			var layer = new GridLayer()
			map.addLayer(layer);
			map.removeLayer(layer);
		});

		describe("when the last tile layer on a map is removed", function () {
			it("fires a zoomlevelschange event", function () {
				map.whenReady(function () {
					var spy = sinon.spy();
					var tl = new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map);

					map.on("zoomlevelschange", spy);
					expect(spy.called).not.to.be.ok();
					map.removeLayer(tl);
					expect(spy.called).to.be.ok();
				});
			});
		});

		describe("when a tile layer is removed from a map and it had greater zoom level coverage than the remainding layer", function () {
			it("fires a zoomlevelschange event", function () {
				map.whenReady(function () {
					var spy = sinon.spy(),
					    tl = new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map),
					    t2 = new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 15}).addTo(map);

					map.on("zoomlevelschange", spy);
					expect(spy.called).to.not.be.ok();
					map.removeLayer(t2);
					expect(spy.called).to.be.ok();
				});
			});
		});

		describe("when a tile layer is removed from a map it and it had lesser or the sa,e zoom level coverage as the remainding layer(s)", function () {
			it("fires no zoomlevelschange event", function () {
				map.whenReady(function () {
					let spy = new sinon.spy()
					let tl = new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map),
					    t2 = new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map),
					    t3 = new TileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 5}).addTo(map);

					map.on("zoomlevelschange", spy)
					expect(spy.called).to.not.be.ok()
					map.removeLayer(t2)
					expect(spy.called).to.not.be.ok()
					map.removeLayer(t3)
					expect(spy.called).to.not.be.ok()
				})
			})
		})
	})

	describe("#eachLayer", function () {
		it("returns self", function () {
			expect(map.eachLayer(function () {})).to.be(map);
		});

		it("calls the provided function for each layer", function () {
			var t1 = new TileLayer("{z}{x}{y}").addTo(map),
			    t2 = new TileLayer("{z}{x}{y}").addTo(map),
			    spy = sinon.spy();

			map.eachLayer(spy);

			expect(spy.callCount).to.eql(2);
			expect(spy.firstCall.args).to.eql([t1]);
			expect(spy.secondCall.args).to.eql([t2]);
		});

		it("calls the provided function with the provided context", function () {
			var t1 = new TileLayer("{z}{x}{y}").addTo(map),
			    spy = sinon.spy();

			map.eachLayer(spy, map);

			expect(spy.thisValues[0]).to.eql(map);
		});
	});

	describe("#invalidateSize", function () {
		let map,
				container,
		    origWidth = 100,
		    clock;

		beforeEach(function () {
			container = document.createElement('div')
			map = new Map(container, {center: new LatLng(30,50), zoom: 5})
			container.style.width = origWidth + "px"
			document.body.appendChild(container)
			map.view = {center: [0, 0], zoom: 0}
			map.invalidateSize({pan: false})
			clock = sinon.useFakeTimers()
		});

		afterEach(function () {
			document.body.removeChild(container)
			clock.restore()
		})

		it("pans by the right amount when growing in 1px increments", function () {
			container.style.width = (origWidth + 1) + "px";
			map.invalidateSize();
			expect(map._getMapPanePos().x).to.be(1);

			container.style.width = (origWidth + 2) + "px";
			map.invalidateSize();
			expect(map._getMapPanePos().x).to.be(1);

			container.style.width = (origWidth + 3) + "px";
			map.invalidateSize();
			expect(map._getMapPanePos().x).to.be(2);
		});

		it("pans by the right amount when shrinking in 1px increments", function () {
			container.style.width = (origWidth - 1) + "px";
			map.invalidateSize();
			expect(map._getMapPanePos().x).to.be(0);

			container.style.width = (origWidth - 2) + "px";
			map.invalidateSize();
			expect(map._getMapPanePos().x).to.be(-1);

			container.style.width = (origWidth - 3) + "px";
			map.invalidateSize();
			expect(map._getMapPanePos().x).to.be(-1);
		});

		it("pans back to the original position after growing by an odd size and back", function () {
			container.style.width = (origWidth + 5) + "px";
			map.invalidateSize();

			container.style.width = origWidth + "px";
			map.invalidateSize();

			expect(map._getMapPanePos().x).to.be(0);
		});

		it("emits no move event if the size has not changed", function () {
			var spy = sinon.spy();
			map.on("move", spy);

			map.invalidateSize();

			expect(spy.called).not.to.be.ok();
		});

		it("emits a move event if the size has changed", function () {
			var spy = sinon.spy();
			map.on("move", spy);

			container.style.width = (origWidth + 5) + "px";
			map.invalidateSize();

			expect(spy.called).to.be.ok();
		});

		it("emits a moveend event if the size has changed", function () {
			var spy = sinon.spy();
			map.on("moveend", spy);

			container.style.width = (origWidth + 5) + "px";
			map.invalidateSize();

			expect(spy.called).to.be.ok();
		});

		it("debounces the moveend event if the debounceMoveend option is given", function () {
			var spy = sinon.spy();
			map.on("moveend", spy);

			container.style.width = (origWidth + 5) + "px";
			map.invalidateSize({debounceMoveend: true});

			expect(spy.called).not.to.be.ok();

			clock.tick(200);

			expect(spy.called).to.be.ok();
		});
	});

	/***
		don't have fly to included yet
	describe('#flyTo', function () {

		it('move to requested center and zoom, and call zoomend once', function (done) {
			var spy = sinon.spy(),
			    newCenter = new LatLng(10, 11),
			    newZoom = 12;
			var callback = function () {
				expect(map.center).to.eql(newCenter)
				expect(map.zoom()).to.eql(newZoom)
				spy()
				expect(spy.calledOnce).to.be.ok()
				done()
			}
			map.view = {center: [0, 0], zoom: 0}
			map.once('zoomend', callback).flyTo(newCenter, newZoom)
		})
	})
	***/

	describe('#zoomIn and #zoomOut', function () {
		let map2,
				container2,
				center

		beforeEach(function () {
			container2 = document.createElement('div')
			map2 = new Map(container2)
			center = LatLng.latLng(22, 33)
			map2.view = {center: center, zoom: 10}
		})

		it('manual zoomIn zooms by 1 zoom level by default', function () {
			map2.zoomIn(null, {animate: false})
			expect(map2.zoom).to.eql(11);
			expect(map2.center).to.eql(center)
		})

		it('zoomIn zooms by 1 zoom level by default', function (done) {
			map2.once('zoomend', function () {
				expect(map2.zoom).to.eql(11);
				expect(map2.center).to.eql(center)
				done()
			})
			map2.zoomIn(null, {animate: false})
		})

		it('zoomOut zooms by 1 zoom level by default', function (done) {
			map2.once('zoomend', function () {
				expect(map2.zoom).to.eql(9)
				expect(map2.center).to.eql(center)
				done()
			})
			map2.zoomOut(null, {animate: false})
		})

		it('zoomIn ignores the zoomDelta option on non-any3d browsers', function (done) {
			Browser.any3d = false;
			map.options.zoomSnap = 0.25;
			map.options.zoomDelta = 0.25;
			map.once('zoomend', function () {
				expect(map.zoom).to.eql(11);
				expect(map.center).to.eql(center);
				done();
			});
			map.zoomIn(null, {animate: false});
		});

		it('zoomIn respects the zoomDelta option on any3d browsers', function (done) {
			Browser.any3d = true;
			map.options.zoomSnap = 0.25;
			map.options.zoomDelta = 0.25;
			map.view = {center: [0, 0], zoom: 10}
			map.once('zoomend', function () {
				expect(map.zoom).to.eql(10.25);
				expect(map.center).to.eql(center);
				done();
			});
			map.zoomIn(null, {animate: false});
		});

		it('zoomOut respects the zoomDelta option on any3d browsers', function (done) {
			Browser.any3d = true;
			map.options.zoomSnap = 0.25;
			map.options.zoomDelta = 0.25;
			map.view = {center: [0, 0], zoom: 10}
			map.once('zoomend', function () {
				expect(map.zoom).to.eql(9.75);
				expect(map.center).to.eql(center);
				done();
			});
			map.zoomOut(null, {animate: false});
		});

		it('zoomIn snaps to zoomSnap on any3d browsers', function (done) {
			map.options.zoomSnap = 0.25;
			map.view = {center: [22, 33], zoom: 10}
			map.once('zoomend', function () {
				expect(map.zoom).to.eql(10.25);
				expect(map.center).to.eql(center);
				done();
			});
			Browser.any3d = true;
			map.zoomIn(0.22, {animate: false});
		});

		it('zoomOut snaps to zoomSnap on any3d browsers', function (done) {
			map.options.zoomSnap = 0.25;
			map.view = {center: [22, 33], zoom: 10}
			map.once('zoomend', function () {
				expect(map.zoom).to.eql(9.75);
				expect(map.center).to.eql(center);
				done();
			});
			Browser.any3d = true;
			map.zoomOut(0.22, {animate: false});
		});
	});

	describe('#fitBounds', function () {
		let center = LatLng.latLng(22, 33),
		    bounds = LatLngBounds.latLngBounds(LatLng.latLng(1, 102), LatLng.latLng(11, 122)),
		    boundsCenter = bounds.center

		beforeEach(function () {
			// fitBounds needs a map container with non-null area
			let container = map.container;
			container.style.width = container.style.height = "100px"
			document.body.appendChild(container)
			map.view = {center: [0, 0], zoom: 10}
		})

		afterEach(function () {
			document.body.removeChild(map.container)
		})

		it('Snaps zoom level to integer by default', function (done) {
			map.once('zoomend', function () {
				expect(map.zoom).to.eql(2);
				expect(map.center.equals(boundsCenter, 0.05)).to.eql(true);
				done();
			});
			map.fitBounds(bounds, {animate: false});
		});

		it('Snaps zoom to zoomSnap on any3d browsers', function (done) {
			map.options.zoomSnap = 0.25;
			Browser.any3d = true;
			map.once('zoomend', function () {
				expect(map.zoom).to.eql(2.75);
				expect(map.center.equals(boundsCenter, 0.05)).to.eql(true);
				done();
			});
			map.fitBounds(bounds, {animate: false});
		});

		it('Ignores zoomSnap on non-any3d browsers', function (done) {
			map.options.zoomSnap = 0.25;
			Browser.any3d = false;
			map.once('zoomend', function () {
				expect(map.zoom).to.eql(2);
				expect(map.center.equals(boundsCenter, 0.05)).to.eql(true);
				done();
			});
			map.fitBounds(bounds, {animate: false});
		});

	});


	describe('#fitBounds after layers set', function () {
		var center = LatLng.latLng(22, 33),
		    bounds = LatLngBounds.latLngBounds(LatLng.latLng(1, 102), LatLng.latLng(11, 122)),
		    boundsCenter = bounds.center

		beforeEach(function () {
			// fitBounds needs a map container with non-null area
			var container = map.container;
			container.style.width = container.style.height = "100px";
			document.body.appendChild(container);
		});

		afterEach(function () {
			document.body.removeChild(map.container);
		});

		it('Snaps to a number after adding tile layer', function (done) {
			Browser.any3d = true;
			map_notready.addLayer(new TileLayer('file:///dev/null'));
			expect(map_notready.zoom).to.be(undefined);
			map.fitBounds(bounds);
			expect(map_notready.zoom).to.be(2);
			done();
		});

		it('Snaps to a number after adding marker', function (done) {
			Browser.any3d = true;
			map_notready.addLayer(new Marker(center));
			expect(map_notready.zoom).to.be(undefined);
			map_notready.fitBounds(bounds);
			expect(map_notready.zoom).to.be(2);
			done();
		});

	});

	describe('#DOM events', function () {

		let c, map

		beforeEach(function () {
			c = document.createElement('div')
			c.style.width = '400px'
			c.style.height = '400px'
			map = new Map(c)
			map.view = {center:[0, 0], zoom: 0}
			document.body.appendChild(c)
		})

		afterEach(function () {
			document.body.removeChild(c)
		})

    /***
		it("DOM events propagate from polygon to map", function () {
			var spy = sinon.spy();
			map.on("mousemove", spy);
			var layer = new L.Polygon([[1, 2], [3, 4], [5, 6]]).addTo(map);
			happen.mousemove(layer._path);
			expect(spy.calledOnce).to.be.ok();
		});
		***/

		it("DOM events propagate from marker to map", function () {
			var spy = sinon.spy();
			map.on("mousemove", spy);
			var layer = new Marker([1, 2]).addTo(map);
			happen.mousemove(layer._icon);
			expect(spy.calledOnce).to.be.ok();
		});

		it("DOM events fired on marker can be cancelled before being caught by the map", function () {
			var mapSpy = sinon.spy();
			var layerSpy = sinon.spy();
			map.on("mousemove", mapSpy);
			var layer = new Marker([1, 2]).addTo(map);
			layer.on("mousemove", DomEvent.stopPropagation).on("mousemove", layerSpy);
			happen.mousemove(layer._icon);
			expect(layerSpy.calledOnce).to.be.ok();
			expect(mapSpy.called).not.to.be.ok();
		});

		/***
		it("DOM events fired on polygon can be cancelled before being caught by the map", function () {
			var mapSpy = sinon.spy();
			var layerSpy = sinon.spy();
			map.on("mousemove", mapSpy);
			var layer = new L.Polygon([[1, 2], [3, 4], [5, 6]]).addTo(map);
			layer.on("mousemove", L.DomEvent.stopPropagation).on("mousemove", layerSpy);
			happen.mousemove(layer._path);
			expect(layerSpy.calledOnce).to.be.ok();
			expect(mapSpy.called).not.to.be.ok();
		});

		it("mouseout is forwarded if fired on the original target", function () {
			var mapSpy = sinon.spy(),
			    layerSpy = sinon.spy(),
			    otherSpy = sinon.spy();
			var layer = new L.Polygon([[1, 2], [3, 4], [5, 6]]).addTo(map);
			var other = new L.Polygon([[10, 20], [30, 40], [50, 60]]).addTo(map);
			map.on("mouseout", mapSpy);
			layer.on("mouseout", layerSpy);
			other.on("mouseout", otherSpy);
			happen.mouseout(layer._path, {relatedTarget: map._container});
			expect(mapSpy.called).not.to.be.ok();
			expect(otherSpy.called).not.to.be.ok();
			expect(layerSpy.calledOnce).to.be.ok();
		});
		***/

		it("mouseout is forwarded when using a DivIcon", function () {
			let icon = new DivIcon({
				html: "<p>this is text in a child element</p>",
				iconSize: [100, 100]
			})
			let mapSpy = sinon.spy(),
			    layerSpy = sinon.spy(),
			    layer = new Marker([1, 2], {icon: icon}).addTo(map)
			map.on("mouseout", mapSpy)
			layer.on("mouseout", layerSpy)
			happen.mouseout(layer._icon, {relatedTarget: map._container})
			expect(mapSpy.called).not.to.be.ok()
			expect(layerSpy.calledOnce).to.be.ok()
		})

		it("mouseout is not forwarded if relatedTarget is a target's child", function () {
			let icon = new DivIcon({
				html: "<p>this is text in a child element</p>",
				iconSize: [100, 100]
			})
			let mapSpy = sinon.spy(),
			    layerSpy = sinon.spy(),
			    layer = new Marker([1, 2], {icon: icon}).addTo(map),
			    child = layer._icon.querySelector('p')
			map.on("mouseout", mapSpy)
			layer.on("mouseout", layerSpy)
			happen.mouseout(layer._icon, {relatedTarget: child})
			expect(mapSpy.called).not.to.be.ok()
			expect(layerSpy.calledOnce).not.to.be.ok()
		})

		it("mouseout is not forwarded if fired on target's child", function () {
			let icon = new DivIcon({
				html: "<p>this is text in a child element</p>",
				iconSize: [100, 100]
			})
			var mapSpy = sinon.spy(),
			    layerSpy = sinon.spy(),
			    layer = new Marker([1, 2], {icon: icon}).addTo(map),
			    child = layer._icon.querySelector('p')
			map.on("mouseout", mapSpy)
			layer.on("mouseout", layerSpy)
			happen.mouseout(child, {relatedTarget: layer._icon})
			expect(mapSpy.called).not.to.be.ok()
			expect(layerSpy.calledOnce).not.to.be.ok()
		})

		/***
		it("mouseout is not forwarded to layers if fired on the map", function () {
			var mapSpy = sinon.spy(),
			    layerSpy = sinon.spy(),
			    otherSpy = sinon.spy();
			var layer = new L.Polygon([[1, 2], [3, 4], [5, 6]]).addTo(map);
			var other = new L.Polygon([[10, 20], [30, 40], [50, 60]]).addTo(map);
			map.on("mouseout", mapSpy);
			layer.on("mouseout", layerSpy);
			other.on("mouseout", otherSpy);
			happen.mouseout(map._container);
			expect(otherSpy.called).not.to.be.ok();
			expect(layerSpy.called).not.to.be.ok();
			expect(mapSpy.calledOnce).to.be.ok();
		});
		***/

		it("preclick is fired before click on marker and map", function () {
			let called = 0
			let layer = new Marker([1, 2]).addTo(map)
			layer.on("preclick", function (e) {
				expect(called++).to.eql(0)
				expect(e.latlng).to.ok()
			})
			layer.on("click", function (e) {
				expect(called++).to.eql(2)
				expect(e.latlng).to.ok()
			})
			map.on("preclick", function (e) {
				expect(called++).to.eql(1)
				expect(e.latlng).to.ok()
			})
			map.on("click", function (e) {
				expect(called++).to.eql(3)
				expect(e.latlng).to.ok()
			})
			happen.click(layer._icon)
		})

	})

	describe('#getScaleZoom && #getZoomScale', function () {
		it("convert zoom to scale and viceversa and return the same values", function () {
			var toZoom = 6.25;
			var fromZoom = 8.5;
			var scale = map.getScaleZoom(toZoom, fromZoom);
			expect(Math.round(map.getZoomScale(scale, fromZoom) * 100) / 100).to.eql(toZoom);
		});
	});

	describe('#get zoom', function () {
		let can = document.createElement('div')
		let map = new Map(can)

		it("returns undefined if map not initialized", function () {
			expect(map.zoom).to.be(undefined);
		});

		/** tilelayer not included yet
		it("returns undefined if map not initialized but layers added", function () {
			map.addLayer(TileLayer('file:///dev/null'));
			expect(map.zoom()).to.be(undefined);
		});
		**/
	})
})
