"use strict"

import{ Point } from 'src/geometry/Point'
import{ LatLng } from 'src/geo/LatLng'
import{ LatLngBounds } from 'src/geo/LatLngBounds'
import{ CRS } from 'src/geo/crs/CRS'
import{ Simple } from 'src/geo/crs/CRS.Simple'
import{ EPSG3857 } from 'src/geo/crs/CRS.EPSG3857'
import{ EPSG4326 } from 'src/geo/crs/CRS.EPSG4326'
import{ EPSG3395 } from 'src/geo/crs/CRS.EPSG3395'

describe("CRS.EPSG3857", function () {

	describe("#latLngToPoint", function () {
		it("projects a center point", function () {
			let crs = new EPSG3857()
			expect(crs.latLngToPoint(LatLng.latLng(0, 0), 0)).near(new Point(128,128), 0.01)
		})

		it("projects the northeast corner of the world", function () {
			let crs = new EPSG3857()
			expect(crs.latLngToPoint(LatLng.latLng(85.0511287798, 180), 0).distanceTo(new Point(256, 0))).below(0.01)
		})
	})

	describe("#pointToLatLng", function () {
		it("reprojects a center point", function () {
			let crs = new EPSG3857()
			expect(crs.pointToLatLng(new Point(128, 128), 0).distanceTo(new LatLng(0, 0))).below(0.01)
    })

		it("reprojects the northeast corner of the world", function () {
			let crs = new EPSG3857()
			expect(crs.pointToLatLng(new Point(256, 0), 0).distanceTo(new LatLng(85.0511287798, 180))).below(0.01)
		})
	})

	describe("project", function () {
		it('projects geo coords into meter coords correctly', function () {
			let crs = new EPSG3857()
			expect(crs.project(new LatLng(50, 30)).distanceTo(new Point(3339584.7238, 6446275.84102))).below(0.01)
			expect(crs.project(new LatLng(85.0511287798, 180)).distanceTo(new Point(20037508.34279, 20037508.34278))).below(0.01)
			expect(crs.project(new LatLng(-85.0511287798, -180)).distanceTo(new Point(-20037508.34279, -20037508.34278))).below(0.01)
		})
	})

	describe("unproject", function () {
		it('unprojects meter coords into geo coords correctly', function () {
			let crs = new EPSG3857()
			expect(crs.unproject(new Point(3339584.7238, 6446275.84102)).distanceTo(new LatLng(50, 30))).below(0.01)
			expect(crs.unproject(new Point(20037508.34279, 20037508.34278)).distanceTo(new LatLng(85.051129, 180))).below(0.01)
			expect(crs.unproject(new Point(-20037508.34279, -20037508.34278)).distanceTo(new LatLng(-85.051129, -180))).below(0.01)
		})
	})

	describe("#getProjectedBounds", function () {
		it("gives correct size", function () {
			let crs = new EPSG3857()
			let worldSize = 256, crsSize = 0
			for (let i = 0; i <= 22; i++) {
				crsSize = crs.getProjectedBounds(i).getSize()
				expect(crsSize.x).to.eql(worldSize)
				expect(crsSize.y).to.eql(worldSize)
				worldSize *= 2
			}
		})
	})

	describe('#wrapLatLng', function () {
		it("wraps longitude to lie between -180 and 180 by default", function () {
			let crs = new EPSG3857()
			expect(crs.wrapLatLng(new LatLng(0, 190)).lng).to.eql(-170)
			expect(crs.wrapLatLng(new LatLng(0, 360)).lng).to.eql(0)
			expect(crs.wrapLatLng(new LatLng(0, 380)).lng).to.eql(20)
			expect(crs.wrapLatLng(new LatLng(0, -190)).lng).to.eql(170)
			expect(crs.wrapLatLng(new LatLng(0, -360)).lng).to.eql(0)
			expect(crs.wrapLatLng(new LatLng(0, -380)).lng).to.eql(-20)
			expect(crs.wrapLatLng(new LatLng(0, 90)).lng).to.eql(90)
			expect(crs.wrapLatLng(new LatLng(0, 180)).lng).to.eql(180)
		})

		it("does not drop altitude", function () {
			let crs = new EPSG3857()
			expect(crs.wrapLatLng(new LatLng(0, 190, 1234)).lng).to.eql(-170)
			expect(crs.wrapLatLng(new LatLng(0, 190, 1234)).alt).to.eql(1234)

			expect(crs.wrapLatLng(new LatLng(0, 380, 1234)).lng).to.eql(20)
			expect(crs.wrapLatLng(new LatLng(0, 380, 1234)).alt).to.eql(1234)
		})

	})

})

describe("CRS.EPSG4326", function () {

	describe("#getSize", function () {
		it("gives correct size", function () {
			let crs = new EPSG4326()
			let worldSize = 256, crsSize = 0
			for (let i = 0; i <= 22; i++) {
				crsSize = crs.getProjectedBounds(i).getSize()
				expect(crsSize.x).to.eql(worldSize * 2)
				// Lat bounds are half as high (-90/+90 compared to -180/+180)
				expect(crsSize.y).to.eql(worldSize)
				worldSize *= 2
			}
		})
	})
})

describe("CRS.EPSG3395", function () {

	describe("#latLngToPoint", function () {
		it("projects a center point", function () {
			let crs = new EPSG3395()
			expect(crs.latLngToPoint(LatLng.latLng(0, 0), 0).distanceTo(new Point(128, 128))).below(0.01)
		})

		it("projects the northeast corner of the world", function () {
			let crs = new EPSG3395()
			expect(crs.latLngToPoint(LatLng.latLng(85.0840591556, 180), 0).distanceTo(new Point(256, 0))).below(0.01)
		})
	})

	describe("#pointToLatLng", function () {
		it("reprojects a center point", function () {
			let crs = new EPSG3395()
			expect(crs.pointToLatLng(new Point(128, 128), 0).distanceTo(new LatLng(0, 0))).below(0.01)
		})

		it("reprojects the northeast corner of the world", function () { // how close should be expected??
			let crs = new EPSG3395()
			expect(crs.pointToLatLng(new Point(256, 0), 0).distanceTo(new LatLng(85.0840591556, 180))).below(0.1)
		})
	})
})

describe("CRS.Simple", function () {

	describe("#latLngToPoint", function () {
		it("converts LatLng coords to pixels", function () {
			let crs = new Simple()
			expect(crs.latLngToPoint(LatLng.latLng(0, 0), 0).distanceTo(new Point(0, 0))).below(0.01)
			expect(crs.latLngToPoint(LatLng.latLng(700, 300), 0).distanceTo(new Point(300, -700))).below(0.01)
			expect(crs.latLngToPoint(LatLng.latLng(-200, 1000), 1).distanceTo(new Point(2000, 400))).below(0.01)
		})
	})

	describe("#pointToLatLng", function () {
		it("converts pixels to LatLng coords", function () {
			let crs = new Simple()
			expect(crs.pointToLatLng(new Point(0, 0), 0).distanceTo(new LatLng(0, 0))).below(0.01)
			expect(crs.pointToLatLng(new Point(300, -700), 0).distanceTo(new LatLng(700, 300))).below(0.1)
			expect(crs.pointToLatLng(new Point(2000, 400), 1).distanceTo(new LatLng(-200, 1000))).below(0.01)
		})
	})

	describe("getProjectedBounds", function () {
		it("returns nothing", function () {
			let crs = new Simple()
			expect(crs.getProjectedBounds(5)).to.be(null)
		})
	})

	describe("wrapLatLng", function () {
		it("returns coords as is", function () {
			let crs = new Simple()
			expect(crs.wrapLatLng(new LatLng(270, 400)).equals(new LatLng(270, 400))).to.be(true)
		})
		it("wraps coords if configured", function () {
			let crs = new Simple([-200, 200], [-200, 200])

			expect(crs.wrapLatLng(new LatLng(300, -250)).distanceTo(new LatLng(-100, 150))).below(0.1)
		})
	})
})

describe("CRS", function () {

	describe("#zoom && #scale", function () {
		it("convert zoom to scale and viceversa and return the same values", function () {
			let crs = new CRS()
			let zoom = 2.5
			let scale = crs.scale(zoom)
			expect(crs.zoom(scale)).to.eql(zoom)
		})
	})
})

