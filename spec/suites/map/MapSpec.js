"use strict"

import {Browser} from 'src/core/Browser'
import {LatLng} from 'src/geo/LatLng'
import {LatLngBounds} from 'src/geo/LatLngBounds'
import {Map} from 'src/map/Map'
// temporary, should fix distance function
import {EPSG3857} from 'src/geo/crs/CRS.EPSG3857'

describe("Map", function () {
	let crs,
			map,
	    spy,
			container

	beforeEach(function () {
		crs = new EPSG3857()
		container = document.createElement('div')
		map = new Map(container)
	});

	describe("#constructor, checking options setting", function () {
		it("tries new without options", function () {
			let can = document.createElement('div')
			let map2 = new Map(can)
			expect(map2.options.minZoom).to.be(4)
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

	describe("#remove", function () {
		it("fires an unload event if loaded", function () {
			var container = document.createElement('div'),
			    map = new Map(container).setView([0, 0], 0),
			    spy = sinon.spy();
			map.on('unload', spy);
			map.remove();
			expect(spy.called).to.be.ok();
		});

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
			var container = document.createElement('div'),
			    map = new Map(container).setView([0, 0], 1),
			    spy = sinon.spy();

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

	describe('#getCenter', function () {
		it('throws if not set before', function () {
			expect(function () {
				let x = map.center
			}).to.throwError()
		})

		it('returns a precise center when zoomed in after being set (#426)', function () {
			let center = LatLng.latLng(10, 10)
			map.setView(center, 1)
			map.zoom = 19
			expect(map.center).to.eql(center)
		})

		it('returns correct center after invalidateSize (#1919)', function () {
			map.setView(LatLng.latLng(10, 10), 1)
			map.invalidateSize()
			expect(map.center).not.to.eql(LatLng.latLng(10, 10))
		})
	})

	describe("#whenReady", function () {
		describe("when the map has not yet been loaded", function () {
			it("calls the callback when the map is loaded", function () {
				var spy = sinon.spy();
				map.whenReady(spy);
				expect(spy.called).to.not.be.ok();

				map.setView([0, 0], 1);
				expect(spy.called).to.be.ok();
			});
		});

		describe("when the map has already been loaded", function () {
			it("calls the callback immediately", function () {
				var spy = sinon.spy();
				map.setView([0, 0], 1);
				map.whenReady(spy);

				expect(spy.called).to.be.ok();
			});
		});
	});

	describe("#setView", function () {
		it("check default zoom", function () {
			expect(map.zoom).to.be(5)
		})

		it("sets the view of the map", function () {
			expect(map.setView([51.505, -0.09], 13)).to.be(map);
			expect(map.zoom).to.be(13);
			expect(map.center.distanceTo(crs, [51.505, -0.09])).to.be.lessThan(5);
		});

		it("can be passed without a zoom specified", function () {
			expect(map.setView([51.605, -0.11])).to.be(map);
			map.zoom = 13
			expect(map.zoom).to.be(13);
			expect(map.center.distanceTo(crs,[51.605, -0.11])).to.be.lessThan(5);
		});

		it("limits initial zoom when no zoom specified", function () {
			map.options.maxZoom = 20
			map.zoom = 100
			expect(map.setView([51.605, -0.11])).to.be(map);
			expect(map.zoom).to.be(20);
			expect(map.center.distanceTo(crs,[51.605, -0.11])).to.be.lessThan(5);
		});

		it("defaults to zoom passed as map option", function () {
			map = new Map(document.createElement('div'), {zoom: 13});
			expect(map.setView([51.605, -0.11])).to.be(map);
			expect(map.zoom).to.be(13);
		});

		it("passes duration option to panBy", function () {
			map = Map(document.createElement('div'), {zoom: 13, center: [0, 0]});
			map.panBy = sinon.spy();
			map.setView([51.605, -0.11], 13, {animate: true, duration: 13});
			expect(map.panBy.callCount).to.eql(1);
			expect(map.panBy.args[0][1].duration).to.eql(13);
		});
	});

	describe("#getBounds", function () {
		it("is safe to call from within a moveend callback during initial load (#1027)", function () {
			map.on("moveend", function () {
				let x = map.bounds
			})

			map.setView([51.505, -0.09], 13)
		});
	});

	describe('#setMaxBounds', function () {
		it("aligns pixel-wise map view center with maxBounds center if it cannot move view bounds inside maxBounds (#1908)", function () {
			var container = map.getContainer();
			// large view, cannot fit within maxBounds
			container.style.width = container.style.height = "1000px";
			document.body.appendChild(container);
			// maxBounds
			var bounds = LatLngBounds.latLngBounds([51.5, -0.05], [51.55, 0.05]);
			map.setMaxBounds(bounds, {animate: false});
			// set view outside
			map.setView(LatLng.latLng([53.0, 0.15]), 12, {animate: false});
			// get center of bounds in pixels
			var boundsCenter = map.project(bounds.getCenter()).round();
			expect(map.project(map.getCenter()).round()).to.eql(boundsCenter);
			document.body.removeChild(container);
		});
		it("moves map view within maxBounds by changing one coordinate", function () {
			var container = map.getContainer();
			// small view, can fit within maxBounds
			container.style.width = container.style.height = "200px";
			document.body.appendChild(container);
			// maxBounds
			var bounds = LatLngBounds.latLngBounds([51, -0.2], [52, 0.2]);
			map.setMaxBounds(bounds, {animate: false});
			// set view outside maxBounds on one direction only
			// leaves untouched the other coordinate (that is not already centered)
			var initCenter = [53.0, 0.1];
			map.setView(LatLng.latLng(initCenter), 16, {animate: false});
			// one pixel coordinate hasn't changed, the other has
			var pixelCenter = map.project(map.getCenter()).round();
			var pixelInit = map.project(initCenter).round();
			expect(pixelCenter.x).to.eql(pixelInit.x);
			expect(pixelCenter.y).not.to.eql(pixelInit.y);
			// the view is inside the bounds
			expect(bounds.contains(map.getBounds())).to.be(true);
			document.body.removeChild(container);
		});
	});

	/***

	describe("#getMinZoom and #getMaxZoom", function () {
		describe('#getMinZoom', function () {
			it('returns 0 if not set by Map options or TileLayer options', function () {
				var map = Map(document.createElement('div'));
				expect(map.getMinZoom()).to.be(0);
			});
		});

		it("minZoom and maxZoom options overrides any minZoom and maxZoom set on layers", function () {

			var map = Map(document.createElement('div'), {minZoom: 2, maxZoom: 20});

			L.tileLayer("{z}{x}{y}", {minZoom: 4, maxZoom: 10}).addTo(map);
			L.tileLayer("{z}{x}{y}", {minZoom: 6, maxZoom: 17}).addTo(map);
			L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 22}).addTo(map);

			expect(map.getMinZoom()).to.be(2);
			expect(map.getMaxZoom()).to.be(20);
		});
	});

	describe("#getMinZoom and #getMaxZoom", function () {
		describe('#getMinZoom', function () {
			it('returns 0 if not set by Map options or TileLayer options', function () {
				var map = Map(document.createElement('div'));
				expect(map.getMinZoom()).to.be(0);
			});
		});

		it("minZoom and maxZoom options overrides any minZoom and maxZoom set on layers", function () {

			var map = Map(document.createElement('div'), {minZoom: 2, maxZoom: 20});

			L.tileLayer("{z}{x}{y}", {minZoom: 4, maxZoom: 10}).addTo(map);
			L.tileLayer("{z}{x}{y}", {minZoom: 6, maxZoom: 17}).addTo(map);
			L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 22}).addTo(map);

			expect(map.getMinZoom()).to.be(2);
			expect(map.getMaxZoom()).to.be(20);
		});
	});

	describe("#hasLayer", function () {
		it("returns false when passed undefined, null, or false", function () {
			var map = Map(document.createElement('div'));
			expect(map.hasLayer(undefined)).to.equal(false);
			expect(map.hasLayer(null)).to.equal(false);
			expect(map.hasLayer(false)).to.equal(false);
		});
	});

	function layerSpy() {
		var layer = new L.Layer();
		layer.onAdd = sinon.spy();
		layer.onRemove = sinon.spy();
		return layer;
	}

	describe("#addLayer", function () {

		it("calls layer.onAdd immediately if the map is ready", function () {
			var layer = layerSpy();
			map.setView([0, 0], 0);
			map.addLayer(layer);
			expect(layer.onAdd.called).to.be.ok();
		});

		it("calls layer.onAdd when the map becomes ready", function () {
			var layer = layerSpy();
			map.addLayer(layer);
			expect(layer.onAdd.called).not.to.be.ok();
			map.setView([0, 0], 0);
			expect(layer.onAdd.called).to.be.ok();
		});

		it("does not call layer.onAdd if the layer is removed before the map becomes ready", function () {
			var layer = layerSpy();
			map.addLayer(layer);
			map.removeLayer(layer);
			map.setView([0, 0], 0);
			expect(layer.onAdd.called).not.to.be.ok();
		});

		it("fires a layeradd event immediately if the map is ready", function () {
			var layer = layerSpy(),
			    spy = sinon.spy();
			map.on('layeradd', spy);
			map.setView([0, 0], 0);
			map.addLayer(layer);
			expect(spy.called).to.be.ok();
		});

		it("fires a layeradd event when the map becomes ready", function () {
			var layer = layerSpy(),
			    spy = sinon.spy();
			map.on('layeradd', spy);
			map.addLayer(layer);
			expect(spy.called).not.to.be.ok();
			map.setView([0, 0], 0);
			expect(spy.called).to.be.ok();
		});

		it("does not fire a layeradd event if the layer is removed before the map becomes ready", function () {
			var layer = layerSpy(),
			    spy = sinon.spy();
			map.on('layeradd', spy);
			map.addLayer(layer);
			map.removeLayer(layer);
			map.setView([0, 0], 0);
			expect(spy.called).not.to.be.ok();
		});

		it("adds the layer before firing layeradd", function (done) {
			var layer = layerSpy();
			map.on('layeradd', function () {
				expect(map.hasLayer(layer)).to.be.ok();
				done();
			});
			map.setView([0, 0], 0);
			map.addLayer(layer);
		});

		describe("When the first layer is added to a map", function () {
			it("fires a zoomlevelschange event", function () {
				var spy = sinon.spy();
				map.on("zoomlevelschange", spy);
				expect(spy.called).not.to.be.ok();
				L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map);
				expect(spy.called).to.be.ok();
			});
		});

		describe("when a new layer with greater zoomlevel coverage than the current layer is added to a map", function () {
			it("fires a zoomlevelschange event", function () {
				var spy = sinon.spy();
				L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map);
				map.on("zoomlevelschange", spy);
				expect(spy.called).not.to.be.ok();
				L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 15}).addTo(map);
				expect(spy.called).to.be.ok();
			});
		});

		describe("when a new layer with the same or lower zoomlevel coverage as the current layer is added to a map", function () {
			it("fires no zoomlevelschange event", function () {
				var spy = sinon.spy();
				L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map);
				map.on("zoomlevelschange", spy);
				expect(spy.called).not.to.be.ok();
				L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map);
				expect(spy.called).not.to.be.ok();
				L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 5}).addTo(map);
				expect(spy.called).not.to.be.ok();
			});
		});
	});

	describe("#removeLayer", function () {
		it("calls layer.onRemove if the map is ready", function () {
			var layer = layerSpy();
			map.setView([0, 0], 0);
			map.addLayer(layer);
			map.removeLayer(layer);
			expect(layer.onRemove.called).to.be.ok();
		});

		it("does not call layer.onRemove if the layer was not added", function () {
			var layer = layerSpy();
			map.setView([0, 0], 0);
			map.removeLayer(layer);
			expect(layer.onRemove.called).not.to.be.ok();
		});

		it("does not call layer.onRemove if the map is not ready", function () {
			var layer = layerSpy();
			map.addLayer(layer);
			map.removeLayer(layer);
			expect(layer.onRemove.called).not.to.be.ok();
		});

		it("fires a layerremove event if the map is ready", function () {
			var layer = layerSpy(),
			    spy = sinon.spy();
			map.on('layerremove', spy);
			map.setView([0, 0], 0);
			map.addLayer(layer);
			map.removeLayer(layer);
			expect(spy.called).to.be.ok();
		});

		it("does not fire a layerremove if the layer was not added", function () {
			var layer = layerSpy(),
			    spy = sinon.spy();
			map.on('layerremove', spy);
			map.setView([0, 0], 0);
			map.removeLayer(layer);
			expect(spy.called).not.to.be.ok();
		});

		it("does not fire a layerremove if the map is not ready", function () {
			var layer = layerSpy(),
			    spy = sinon.spy();
			map.on('layerremove', spy);
			map.addLayer(layer);
			map.removeLayer(layer);
			expect(spy.called).not.to.be.ok();
		});

		it("removes the layer before firing layerremove", function (done) {
			var layer = layerSpy();
			map.on('layerremove', function () {
				expect(map.hasLayer(layer)).not.to.be.ok();
				done();
			});
			map.setView([0, 0], 0);
			map.addLayer(layer);
			map.removeLayer(layer);
		});

		it("supports adding and removing a tile layer without initializing the map", function () {
			var layer = L.tileLayer("{z}{x}{y}");
			map.addLayer(layer);
			map.removeLayer(layer);
		});

		it("supports adding and removing a tile layer without initializing the map", function () {
			map.setView([0, 0], 18);
			var layer = L.gridLayer();
			map.addLayer(layer);
			map.removeLayer(layer);
		});

		describe("when the last tile layer on a map is removed", function () {
			it("fires a zoomlevelschange event", function () {
				map.whenReady(function () {
					var spy = sinon.spy();
					var tl = L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map);

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
					    tl = L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map),
					    t2 = L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 15}).addTo(map);

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
					var tl = L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map),
					    t2 = L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 10}).addTo(map),
					    t3 = L.tileLayer("{z}{x}{y}", {minZoom: 0, maxZoom: 5}).addTo(map);

					map.on("zoomlevelschange", spy);
					expect(spy).not.toHaveBeenCalled();
					map.removeLayer(t2);
					expect(spy).not.toHaveBeenCalled();
					map.removeLayer(t3);
					expect(spy).not.toHaveBeenCalled();
				});
			});
		});
	});

	describe("#eachLayer", function () {
		it("returns self", function () {
			expect(map.eachLayer(function () {})).to.be(map);
		});

		it("calls the provided function for each layer", function () {
			var t1 = L.tileLayer("{z}{x}{y}").addTo(map),
			    t2 = L.tileLayer("{z}{x}{y}").addTo(map),
			    spy = sinon.spy();

			map.eachLayer(spy);

			expect(spy.callCount).to.eql(2);
			expect(spy.firstCall.args).to.eql([t1]);
			expect(spy.secondCall.args).to.eql([t2]);
		});

		it("calls the provided function with the provided context", function () {
			var t1 = L.tileLayer("{z}{x}{y}").addTo(map),
			    spy = sinon.spy();

			map.eachLayer(spy, map);

			expect(spy.thisValues[0]).to.eql(map);
		});
	});

	describe("#invalidateSize", function () {
		var container,
		    origWidth = 100,
		    clock;

		beforeEach(function () {
			container = map.getContainer();
			container.style.width = origWidth + "px";
			document.body.appendChild(container);
			map.setView([0, 0], 0);
			map.invalidateSize({pan: false});
			clock = sinon.useFakeTimers();
		});

		afterEach(function () {
			document.body.removeChild(container);
			clock.restore();
		});

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

	describe('#flyTo', function () {

		it('move to requested center and zoom, and call zoomend once', function (done) {
			var spy = sinon.spy(),
			    newCenter = new LatLng(10, 11),
			    newZoom = 12;
			var callback = function () {
				expect(map.getCenter()).to.eql(newCenter);
				expect(map.getZoom()).to.eql(newZoom);
				spy();
				expect(spy.calledOnce).to.be.ok();
				done();
			};
			map.setView([0, 0], 0);
			map.once('zoomend', callback).flyTo(newCenter, newZoom);
		});
	});

	describe('#zoomIn and #zoomOut', function () {
		var center = LatLng.latLng(22, 33);
		beforeEach(function () {
			map.setView(center, 10);
		});

		it('zoomIn zooms by 1 zoom level by default', function (done) {
			map.once('zoomend', function () {
				expect(map.getZoom()).to.eql(11);
				expect(map.getCenter()).to.eql(center);
				done();
			});
			map.zoomIn(null, {animate: false});
		});

		it('zoomOut zooms by 1 zoom level by default', function (done) {
			map.once('zoomend', function () {
				expect(map.getZoom()).to.eql(9);
				expect(map.getCenter()).to.eql(center);
				done();
			});
			map.zoomOut(null, {animate: false});
		});

		it('zoomIn ignores the zoomDelta option on non-any3d browsers', function (done) {
			Browser.any3d = false;
			map.options.zoomSnap = 0.25;
			map.options.zoomDelta = 0.25;
			map.once('zoomend', function () {
				expect(map.getZoom()).to.eql(11);
				expect(map.getCenter()).to.eql(center);
				done();
			});
			map.zoomIn(null, {animate: false});
		});

		it('zoomIn respects the zoomDelta option on any3d browsers', function (done) {
			Browser.any3d = true;
			map.options.zoomSnap = 0.25;
			map.options.zoomDelta = 0.25;
			map.setView(center, 10);
			map.once('zoomend', function () {
				expect(map.getZoom()).to.eql(10.25);
				expect(map.getCenter()).to.eql(center);
				done();
			});
			map.zoomIn(null, {animate: false});
		});

		it('zoomOut respects the zoomDelta option on any3d browsers', function (done) {
			Browser.any3d = true;
			map.options.zoomSnap = 0.25;
			map.options.zoomDelta = 0.25;
			map.setView(center, 10);
			map.once('zoomend', function () {
				expect(map.getZoom()).to.eql(9.75);
				expect(map.getCenter()).to.eql(center);
				done();
			});
			map.zoomOut(null, {animate: false});
		});

		it('zoomIn snaps to zoomSnap on any3d browsers', function (done) {
			map.options.zoomSnap = 0.25;
			map.setView(center, 10);
			map.once('zoomend', function () {
				expect(map.getZoom()).to.eql(10.25);
				expect(map.getCenter()).to.eql(center);
				done();
			});
			Browser.any3d = true;
			map.zoomIn(0.22, {animate: false});
		});

		it('zoomOut snaps to zoomSnap on any3d browsers', function (done) {
			map.options.zoomSnap = 0.25;
			map.setView(center, 10);
			map.once('zoomend', function () {
				expect(map.getZoom()).to.eql(9.75);
				expect(map.getCenter()).to.eql(center);
				done();
			});
			Browser.any3d = true;
			map.zoomOut(0.22, {animate: false});
		});
	});

	describe('#fitBounds', function () {
		var center = LatLng.latLng(22, 33),
		    bounds = LatLngBounds.latLngBounds(LatLng.latLng(1, 102), LatLng.latLng(11, 122)),
		    boundsCenter = bounds.getCenter();

		beforeEach(function () {
			// fitBounds needs a map container with non-null area
			var container = map.getContainer();
			container.style.width = container.style.height = "100px";
			document.body.appendChild(container);
			map.setView(center, 10);
		});

		afterEach(function () {
			document.body.removeChild(map.getContainer());
		});

		it('Snaps zoom level to integer by default', function (done) {
			map.once('zoomend', function () {
				expect(map.getZoom()).to.eql(2);
				expect(map.getCenter().equals(boundsCenter, 0.05)).to.eql(true);
				done();
			});
			map.fitBounds(bounds, {animate: false});
		});

		it('Snaps zoom to zoomSnap on any3d browsers', function (done) {
			map.options.zoomSnap = 0.25;
			Browser.any3d = true;
			map.once('zoomend', function () {
				expect(map.getZoom()).to.eql(2.75);
				expect(map.getCenter().equals(boundsCenter, 0.05)).to.eql(true);
				done();
			});
			map.fitBounds(bounds, {animate: false});
		});

		it('Ignores zoomSnap on non-any3d browsers', function (done) {
			map.options.zoomSnap = 0.25;
			Browser.any3d = false;
			map.once('zoomend', function () {
				expect(map.getZoom()).to.eql(2);
				expect(map.getCenter().equals(boundsCenter, 0.05)).to.eql(true);
				done();
			});
			map.fitBounds(bounds, {animate: false});
		});

	});


	describe('#fitBounds after layers set', function () {
		var center = LatLng.latLng(22, 33),
		    bounds = LatLngBounds.latLngBounds(LatLng.latLng(1, 102), LatLng.latLng(11, 122)),
		    boundsCenter = bounds.getCenter();

		beforeEach(function () {
			// fitBounds needs a map container with non-null area
			var container = map.getContainer();
			container.style.width = container.style.height = "100px";
			document.body.appendChild(container);
		});

		afterEach(function () {
			document.body.removeChild(map.getContainer());
		});

		it('Snaps to a number after adding tile layer', function (done) {
			Browser.any3d = true;
			map.addLayer(L.tileLayer('file:///dev/null'));
			expect(map.getZoom()).to.be(undefined);
			map.fitBounds(bounds);
			expect(map.getZoom()).to.be(2);
			done();
		});

		it('Snaps to a number after adding marker', function (done) {
			Browser.any3d = true;
			map.addLayer(L.marker(center));
			expect(map.getZoom()).to.be(undefined);
			map.fitBounds(bounds);
			expect(map.getZoom()).to.be(2);
			done();
		});

	});

	***/

	describe('#DOM events', function () {

		var c, map;

		beforeEach(function () {
			c = document.createElement('div');
			c.style.width = '400px';
			c.style.height = '400px';
			map = new Map(c);
			map.setView(new LatLng(0, 0), 0);
			document.body.appendChild(c);
		});

		afterEach(function () {
			document.body.removeChild(c);
		});

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
			var layer = new L.Marker([1, 2]).addTo(map);
			happen.mousemove(layer._icon);
			expect(spy.calledOnce).to.be.ok();
		});

		it("DOM events fired on marker can be cancelled before being caught by the map", function () {
			var mapSpy = sinon.spy();
			var layerSpy = sinon.spy();
			map.on("mousemove", mapSpy);
			var layer = new L.Marker([1, 2]).addTo(map);
			layer.on("mousemove", L.DomEvent.stopPropagation).on("mousemove", layerSpy);
			happen.mousemove(layer._icon);
			expect(layerSpy.calledOnce).to.be.ok();
			expect(mapSpy.called).not.to.be.ok();
		});

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

		it("mouseout is forwarded when using a DivIcon", function () {
			var icon = L.divIcon({
				html: "<p>this is text in a child element</p>",
				iconSize: [100, 100]
			});
			var mapSpy = sinon.spy(),
			    layerSpy = sinon.spy(),
			    layer = L.marker([1, 2], {icon: icon}).addTo(map);
			map.on("mouseout", mapSpy);
			layer.on("mouseout", layerSpy);
			happen.mouseout(layer._icon, {relatedTarget: map._container});
			expect(mapSpy.called).not.to.be.ok();
			expect(layerSpy.calledOnce).to.be.ok();
		});

		it("mouseout is not forwarded if relatedTarget is a target's child", function () {
			var icon = L.divIcon({
				html: "<p>this is text in a child element</p>",
				iconSize: [100, 100]
			});
			var mapSpy = sinon.spy(),
			    layerSpy = sinon.spy(),
			    layer = L.marker([1, 2], {icon: icon}).addTo(map),
			    child = layer._icon.querySelector('p');
			map.on("mouseout", mapSpy);
			layer.on("mouseout", layerSpy);
			happen.mouseout(layer._icon, {relatedTarget: child});
			expect(mapSpy.called).not.to.be.ok();
			expect(layerSpy.calledOnce).not.to.be.ok();
		});

		it("mouseout is not forwarded if fired on target's child", function () {
			var icon = L.divIcon({
				html: "<p>this is text in a child element</p>",
				iconSize: [100, 100]
			});
			var mapSpy = sinon.spy(),
			    layerSpy = sinon.spy(),
			    layer = L.marker([1, 2], {icon: icon}).addTo(map),
			    child = layer._icon.querySelector('p');
			map.on("mouseout", mapSpy);
			layer.on("mouseout", layerSpy);
			happen.mouseout(child, {relatedTarget: layer._icon});
			expect(mapSpy.called).not.to.be.ok();
			expect(layerSpy.calledOnce).not.to.be.ok();
		});

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

		it("preclick is fired before click on marker and map", function () {
			var called = 0;
			var layer = new L.Marker([1, 2]).addTo(map);
			layer.on("preclick", function (e) {
				expect(called++).to.eql(0);
				expect(e.latlng).to.ok();
			});
			layer.on("click", function (e) {
				expect(called++).to.eql(2);
				expect(e.latlng).to.ok();
			});
			map.on("preclick", function (e) {
				expect(called++).to.eql(1);
				expect(e.latlng).to.ok();
			});
			map.on("click", function (e) {
				expect(called++).to.eql(3);
				expect(e.latlng).to.ok();
			});
			happen.click(layer._icon);
		});

	});

	describe('#getScaleZoom && #getZoomScale', function () {
		it("convert zoom to scale and viceversa and return the same values", function () {
			var toZoom = 6.25;
			var fromZoom = 8.5;
			var scale = map.getScaleZoom(toZoom, fromZoom);
			expect(Math.round(map.getZoomScale(scale, fromZoom) * 100) / 100).to.eql(toZoom);
		});
	});

	describe('#getZoom', function () {
		it("returns undefined if map not initialized", function () {
			expect(map.getZoom()).to.be(undefined);
		});

		it("returns undefined if map not initialized but layers added", function () {
			map.addLayer(L.tileLayer('file:///dev/null'));
			expect(map.getZoom()).to.be(undefined);
		});
	});
});
