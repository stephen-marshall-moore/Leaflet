"use strict"

import {Browser} from 'src/core/Browser'
import {Util} from 'src/core/Util'
import {DomUtil} from 'src/dom/DomUtil'
import {Point} from 'src/geometry/Point'
//import {LatLng} from 'src/geo/LatLng'
//import {LatLngBounds} from 'src/geo/LatLngBounds'
import {Map} from 'src/map/Map'
//import {Layer} from 'src/layer/Layer'
import {GridLayer} from 'src/layer/tile/GridLayer'

describe('GridLayer', function () {

	let div, map

	beforeEach(function () {
		div = document.createElement('div')
		div.style.width = '800px'
		div.style.height = '600px'
		//div.style.visibility = 'hidden'

		document.body.appendChild(div)

		map = new Map(div, {minZoom: undefined, maxZoom: undefined})
	})

	afterEach(function () {
		document.body.removeChild(div)
	})

	describe('#redraw', function () {
		it('can be called before map set view', function () {
			let grid = new GridLayer().addTo(map)
			expect(grid.redraw()).to.equal(grid)
		})
	})

	describe('#setOpacity', function () {
		it('can be called before map set view', function () {
			let grid = new GridLayer().addTo(map)
			expect(grid.setOpacity(0.5)).to.equal(grid)
		})
	})

	it('positions tiles correctly with wrapping and bounding', function () {

		map.view = {center:[0, 0], zoom: 1}

		let tiles = []

		let grid = new GridLayer()
		grid.createTile = function (coords) {
			//console.log('grid(53).createTile')
			let tile = document.createElement('div')
			tiles.push({coords: coords, tile: tile})
			return tile
		}

		map.addLayer(grid)

		let loaded = {}

		for (let i = 0; i < tiles.length; i++) {
			let coords = tiles[i].coords,
			    pos = DomUtil.getPosition(tiles[i].tile)

			loaded[pos.x + ':' + pos.y] = [coords.x, coords.y]
		}

		expect(loaded).to.eql({
			'144:0': [0, 0],
			'400:0': [1, 0],
			'144:256': [0, 1],
			'400:256': [1, 1],
			'-112:0': [1, 0],
			'656:0': [0, 0],
			'-112:256': [1, 1],
			'656:256': [0, 1]
		})
	})

	describe('tile pyramid', function () {
		let clock

		beforeEach(function () {
			clock = sinon.useFakeTimers()
		})

		afterEach(function () {
			clock.restore()
		})

		it('removes tiles for unused zoom levels', function (done) {
			map.remove()
			map = new Map(div, {fadeAnimation: false})
			map.view = {center:[0, 0], zoom: 1}

			let grid = new GridLayer()
			let tiles = {}

			grid.createTile = function (coords) {
				tiles[grid._tileCoordsToKey(coords)] = true
				return document.createElement('div')
			}

			grid.on('tileunload', function (e) {
				delete tiles[grid._tileCoordsToKey(e.coords)]
			})

			grid.on('load', function (e) {
				if (Object.keys(tiles).length === 1) {
					expect(Object.keys(tiles)).to.eql(['0:0:0'])
					grid.off()
					done()
				}
			})

			map.addLayer(grid)
			map.zoom = { zoom: 0, options: {animate: false}}
			//grid.fire('load')
			clock.tick(250)
		})
	})

	describe('#createTile', function () {

		beforeEach(function () {
			// Simpler sizes to test.
			div.style.width = '512px'
			div.style.height = '512px'
		})

		afterEach(function () {
			div.style.width = '800px'
			div.style.height = '600px'
		})

		// Passes on Firefox, but fails on phantomJS: done is never called.
		xit('only creates tiles for visible area on zoom in', function (done) {
			map.remove()
			map = new Map(div)
			map.view = {center:[0, 0], zoom: 10}

			let grid = new GridLayer(),
			    count = 0,
			    loadCount = 0
			grid.createTile = function (coords) {
				count++
				return document.createElement('div')
			}
			let onLoad = function (e) {
				expect(count).to.eql(4)
				count = 0
				loadCount++
				if (loadCount === 1) {  // On layer add.
					map.zoomIn()
				} else {  // On zoom in.
					done()
				}
			}
			grid.on('load', onLoad)
			map.addLayer(grid)
		})

	})

	describe("#onAdd", function () {
		it('is called after zoomend on first map load', function () {
			let layer = new GridLayer().addTo(map)

			let onAdd = layer.onAdd,
			    onAddSpy = sinon.spy()
			layer.onAdd = function () {
				onAdd.apply(this, arguments)
				onAddSpy()
			}

			let onReset = sinon.spy()
			map.on('zoomend', onReset)
			map.view = {center:[0, 0], zoom: 0}

			expect(onReset.calledBefore(onAddSpy)).to.be.ok()
		})
	})

	describe("#getMaxZoom, #getMinZoom", function () {
		describe("when a tilelayer is added to a map with no other layers", function () {
			it("has the same zoomlevels as the tilelayer", function () {
				let maxZoom = 10,
				    minZoom = 5

				map.view = {center: [0, 0], zoom: 1}

				//map.options.maxZoom = undefined
				//map.options.minZoom = undefined

				new GridLayer({
					maxZoom: maxZoom,
					minZoom: minZoom
				}).addTo(map)

				expect(map.maxZoom).to.be(maxZoom)
				expect(map.minZoom).to.be(minZoom)
			})
		})

		describe("accessing a tilelayer's properties", function () {
			it('provides a container', function () {
				map.view = {center: [0, 0], zoom: 1}

				let layer = new GridLayer().addTo(map)
				expect(layer.getContainer()).to.be.ok()
			})
		})

		describe("when a tilelayer is added to a map that already has a tilelayer", function () {
			it("has its zoomlevels updated to fit the new layer", function () {
				map.view = {center: [0, 0], zoom: 1}

				new GridLayer({minZoom: 10, maxZoom: 15}).addTo(map)
				expect(map.minZoom).to.be(10)
				expect(map.maxZoom).to.be(15)

				new GridLayer({minZoom: 5, maxZoom: 10}).addTo(map)
				expect(map.minZoom).to.be(5)  // changed
				expect(map.maxZoom).to.be(15) // unchanged

				new GridLayer({minZoom: 10, maxZoom: 20}).addTo(map)
				expect(map.minZoom).to.be(5)  // unchanged
				expect(map.maxZoom).to.be(20) // changed


				new GridLayer({minZoom: 0, maxZoom: 25}).addTo(map)
				expect(map.minZoom).to.be(0) // changed
				expect(map.maxZoom).to.be(25) // changed
			})
		})

		describe("when a tilelayer is removed from a map", function () {
			it("has its zoomlevels updated to only fit the layers it currently has", function () {
				let tiles = [
					new GridLayer({minZoom: 10, maxZoom: 15}).addTo(map),
					new GridLayer({minZoom: 5, maxZoom: 10}).addTo(map),
					new GridLayer({minZoom: 10, maxZoom: 20}).addTo(map),
					new GridLayer({minZoom: 0, maxZoom: 25}).addTo(map)
				]
				map.whenReady(function () {
					expect(map.minZoom).to.be(0)
					expect(map.maxZoom).to.be(25)

					map.removeLayer(tiles[0])
					expect(map.minZoom).to.be(0)
					expect(map.maxZoom).to.be(25)

					map.removeLayer(tiles[3])
					expect(map.minZoom).to.be(5)
					expect(map.maxZoom).to.be(20)

					map.removeLayer(tiles[2])
					expect(map.minZoom).to.be(5)
					expect(map.maxZoom).to.be(10)

					map.removeLayer(tiles[1])
					expect(map.minZoom).to.be(0)
					expect(map.maxZoom).to.be(Infinity)
				})
			})
		})
	})

	describe("number of 256px tiles loaded in synchronous non-animated grid @800x600px", function () {
		let clock, grid, counts

		beforeEach(function () {
			clock = sinon.useFakeTimers()

			grid = new GridLayer({
				attribution: 'Grid Layer',
				tileSize: Point.point(256, 256)
			})

			GridLayer.prototype.createTile = function (coords) {
				let tile = document.createElement('div')
				tile.innerHTML = [coords.x, coords.y, coords.z].join(', ')
				tile.style.border = '2px solid red'
				return tile
			}

			counts = {
				tileload: 0,
				tileerror: 0,
				tileloadstart: 0,
				tileunload: 0
			}

			grid.on('tileload tileunload tileerror tileloadstart', function (ev) {
// 				console.log(ev.type)
				counts[ev.type]++
			})
// 			grid.on('tileunload', function (ev) {
// 				console.log(ev.type, ev.coords, counts)
// 			})

			map.options.fadeAnimation = false
			map.options.zoomAnimation = false
		})

		afterEach(function () {
			clock.restore()
			grid.off()
			grid = undefined
			counts = undefined
		})

		it("Loads 8 tiles zoom 1", function (done) {

			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(8)
				expect(counts.tileload).to.be(8)
				expect(counts.tileunload).to.be(0)
				done()
			})

			map.addLayer(grid)
			map.view = {center: [0, 0], zoom: 1}
			clock.tick(250)
		})

		it("Loads 5 tiles zoom 0", function (done) {

			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(5)
				expect(counts.tileload).to.be(5)
				expect(counts.tileunload).to.be(0)
				done()
			})

			map.addLayer(grid)
			map.view = {center: [0, 0], zoom: 0}
			clock.tick(250)
		})

		it("Loads 16 tiles zoom 10", function (done) {

			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(16)
				expect(counts.tileload).to.be(16)
				expect(counts.tileunload).to.be(0)
				grid.off()

				done()
			})

			map.addLayer(grid)
			map.view = {center: [0, 0], zoom: 10}
			clock.tick(250)
		})

		it("Loads 32, unloads 16 tiles zooming in 10-11", function (done) {

			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(16)
				expect(counts.tileload).to.be(16)
				expect(counts.tileunload).to.be(0)
				grid.off('load')

				grid.on('load', function () {
					expect(counts.tileloadstart).to.be(32)
					expect(counts.tileload).to.be(32)
					expect(counts.tileunload).to.be(16)
					done()
				})

				map.zoom = { zoom: 11, options: {animate: false}}
				clock.tick(250)
			})


			map.addLayer(grid)
			map.view = {center: [0, 0], zoom: 10}
			clock.tick(250)
		})

		it("Loads 32, unloads 16 tiles zooming out 11-10", function (done) {

			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(16)
				expect(counts.tileload).to.be(16)
				expect(counts.tileunload).to.be(0)
				grid.off('load')

				grid.on('load', function () {
					expect(counts.tileloadstart).to.be(32)
					expect(counts.tileload).to.be(32)
					expect(counts.tileunload).to.be(16)
					done()
				})

				map.zoom = { zoom: 10, options: {animate: false}}
				clock.tick(250)
			})


			map.addLayer(grid)
			map.view = {center: [0, 0], zoom: 11}
			clock.tick(250)
		})


		it("Loads 32, unloads 16 tiles zooming out 18-10", function (done) {

			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(16)
				expect(counts.tileload).to.be(16)
				expect(counts.tileunload).to.be(0)
				grid.off('load')

				grid.on('load', function () {
					expect(counts.tileloadstart).to.be(32)
					expect(counts.tileload).to.be(32)
					expect(counts.tileunload).to.be(16)
					done()
				})

				map.zoom = { zoom: 10, options: {animate: false}}
				clock.tick(250)
			})


			map.addLayer(grid)
			map.view = {center: [0, 0], zoom: 18}
			clock.tick(250)
		})

	})


	describe("number of 256px tiles loaded in synchronous animated grid @800x600px", function () {

		let clock, grid, counts

		beforeEach(function () {
			clock = sinon.useFakeTimers()

			grid = new GridLayer({
				attribution: 'Grid Layer',
				tileSize: Point.point(256, 256)
			})

			grid.createTile = function (coords) {
				let tile = document.createElement('div')
				tile.innerHTML = [coords.x, coords.y, coords.z].join(', ')
				tile.style.border = '2px solid red'
				return tile
			}

			counts = {
				tileload: 0,
				tileerror: 0,
				tileloadstart: 0,
				tileunload: 0
			}

			grid.on('tileload tileunload tileerror tileloadstart', function (ev) {
				counts[ev.type]++
			})
		})

		afterEach(function () {
			clock.restore()
			grid.off()
			grid = undefined
			counts = undefined
		})

		// Debug helper
		function logTiles(ev) {
			let pending = 0
			for (let key in grid._tiles) {
				if (!grid._tiles[key].loaded) { pending++ }
			}
			console.log(ev.type + ': ', ev.coords, grid._loading, counts, ' pending: ', pending)
		}


		// animationFrame helper, just runs requestAnimFrame() a given number of times
		function runFrames(n) {
			return _runFrames(n)()
		}

		function _runFrames(n) {
			if (n) {
				return function () {
					clock.tick(40) // 40msec/frame ~= 25fps
					map.fire('_frame')
					Util.requestAnimFrame(_runFrames(n - 1))
				}
			} else {
				return (() => false)
				//return Util.falseFn
			}
		}


		/***
		// NOTE: This test has different behaviour in PhantomJS and graphical
		// browsers due to CSS animations!
		it.skipInPhantom("Loads 32, unloads 16 tiles zooming in 10-11", function (done) {

// 			grid.on('tileload tileunload tileloadstart load', logTiles)

			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(16)
				expect(counts.tileload).to.be(16)
				expect(counts.tileunload).to.be(0)
				grid.off('load')

// 				grid.on('load', logTiles)
				grid.on('load', function () {

					// We're one frame into the zoom animation, there are
					// 16 tiles for z10 plus 16 tiles for z11 covering the
					// bounds at the *end* of the zoom-*in* anim
					expect(counts.tileloadstart).to.be(32)
					expect(counts.tileload).to.be(32)
					expect(counts.tileunload).to.be(0)

					// Wait > 250msec for the tile fade-in animation to complete,
					// which triggers the tile pruning
					clock.tick(300)

					// After the zoom-in, the 'outside' 12 tiles (not the 4
					// at the center, still in bounds) have been unloaded.
					expect(counts.tileunload).to.be(12)

					Util.requestAnimFrame(function () {
						expect(counts.tileloadstart).to.be(32)
						expect(counts.tileload).to.be(32)
						expect(counts.tileunload).to.be(16)
						done()
					})
				})

				map.zoom = { zoom: 11, options: {animate: true}}
				clock.tick(250)
			})

			map.addLayer(grid)
			map.view = {center: [0, 0], zoom: 10}
			clock.tick(250)
		})
		***/

		it("Loads 32, unloads 16 tiles zooming in 10-18", function (done) {
			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(16)
				expect(counts.tileload).to.be(16)
				expect(counts.tileunload).to.be(0)
				grid.off('load')

				grid.on('load', function () {

					// In this particular scenario, the tile unloads happen in the
					// next render frame after the grid's 'load' event.
					Util.requestAnimFrame(function () {
						expect(counts.tileloadstart).to.be(32)
						expect(counts.tileload).to.be(32)
						expect(counts.tileunload).to.be(16)
						done()
					})
				})

				map.zoom = { zoom: 18, options: {animate: true}}
				clock.tick(250)
			})

			map.addLayer(grid)
			map.view = {center: [0, 0], zoom: 10}
			clock.tick(250)
		})

		/*** 
		// NOTE: This test has different behaviour in PhantomJS and graphical
		// browsers due to CSS animations!
		it.skipInPhantom("Loads 32, unloads 16 tiles zooming out 11-10", function (done) {

// 			grid.on('tileload tileunload load', logTiles)

			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(16)
				expect(counts.tileload).to.be(16)
				expect(counts.tileunload).to.be(0)
				grid.off('load')

// 				grid.on('load', logTiles)
				grid.on('load', function () {

					grid.off('load')
// 					grid.on('load', logTiles)

					// We're one frame into the zoom animation, there are
					// 16 tiles for z11 plus 4 tiles for z10 covering the
					// bounds at the *beginning* of the zoom-*out* anim
					expect(counts.tileloadstart).to.be(20)
					expect(counts.tileload).to.be(20)
					expect(counts.tileunload).to.be(0)


					// Wait > 250msec for the tile fade-in animation to complete,
					// which triggers the tile pruning
					clock.tick(300)
					Util.requestAnimFrame(function () {
						expect(counts.tileunload).to.be(16)

						// The next 'load' event happens when the zoom anim is
						// complete, and triggers loading of all the z10 tiles.
						grid.on('load', function () {
							expect(counts.tileloadstart).to.be(32)
							expect(counts.tileload).to.be(32)
							done()
						})

					})
				})

				map.zoom = { zoom: 10, options: {animate: true}}
				clock.tick(250)
			})

			map.addLayer(grid)
			map.view = {center: [0, 0], zoom: 11}
			clock.tick(250)
		})
		***/

		it("Loads 32, unloads 16 tiles zooming out 18-10", function (done) {

			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(16)
				expect(counts.tileload).to.be(16)
				expect(counts.tileunload).to.be(0)
				grid.off('load')

				grid.on('load', function () {

					// In this particular scenario, the tile unloads happen in the
					// next render frame after the grid's 'load' event.
					Util.requestAnimFrame(function () {
						expect(counts.tileloadstart).to.be(32)
						expect(counts.tileload).to.be(32)
						expect(counts.tileunload).to.be(16)
						done()
					})
				})

				map.zoom = { zoom: 10, options: {animate: true}}
				clock.tick(250)
			})

			map.addLayer(grid)
			map.view = {center: [0, 0], zoom: 18}
			clock.tick(250)
		})

		/***
		// NOTE: This test has different behaviour in PhantomJS and graphical
		// browsers due to CSS animations!
		it.skipInPhantom("Loads 290, unloads 275 tiles on MAD-TRD flyTo()", function (done) {

			this.timeout(10000) // This test takes longer than usual due to frames

			let mad = [40.40, -3.7], trd = [63.41, 10.41]

			grid.on('load', function () {
				expect(counts.tileloadstart).to.be(12)
				expect(counts.tileload).to.be(12)
				expect(counts.tileunload).to.be(0)
				grid.off('load')

				map.on('zoomend', function () {
					expect(counts.tileloadstart).to.be(290)
					expect(counts.tileunload).to.be(275)
					expect(counts.tileload).to.be(290)
					expect(grid._container.querySelectorAll('div').length).to.be(16)	// 15 + container
					done()
				})

				map.flyTo(trd, 12, {animate: true})

// 				map.on('_frame', function () {
// 					console.log('frame', counts)
// 				})

				runFrames(500)
			})

			map.addLayer(grid)
			map.view = {center: mad, zoom: 11}
			clock.tick(250)
		})
		***/

	})

})
