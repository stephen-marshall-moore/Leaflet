import { Point } from '../../../src/geometry/Point';
import { LatLng } from '../../../src/geo/LatLng';
import { LatLngBounds } from '../../../src/geo/LatLngBounds';
import { CRS } from '../../../src/geo/crs/CRS';
import { Simple } from '../../../src/geo/crs/CRS.Simple';
import { EPSG3857 } from '../../../src/geo/crs/CRS.EPSG3857';
import { EPSG4326 } from '../../../src/geo/crs/CRS.EPSG4326';
import { EPSG3395 } from '../../../src/geo/crs/CRS.EPSG3395';

describe("CRS.EPSG3857", () => {
	let crs = new EPSG3857();

	describe("#latLngToPoint", () => {
		it("projects a center point", () => {
			expect(crs.latLngToPoint(LatLng.latLng(0, 0), 0).distanceTo(new Point(128,128))).toBeLessThan(0.01);
		});

		it("projects the northeast corner of the world", () => {
			expect(crs.latLngToPoint(LatLng.latLng(85.0511287798, 180), 0).distanceTo(new Point(256, 0))).toBeLessThan(0.01);
		});
	});

	describe("#pointToLatLng", () => {
		it("reprojects a center point", () => {
			expect(crs.pointToLatLng(new Point(128, 128), 0).distanceTo(crs,new LatLng(0, 0))).toBeLessThan(0.01);
    });

		it("reprojects the northeast corner of the world", () => {
			expect(crs.pointToLatLng(new Point(256, 0), 0).distanceTo(crs,new LatLng(85.0511287798, 180))).toBeLessThan(0.01);
		});
	});

	describe("project", () => {
		it('projects geo coords into meter coords correctly', () => {
			expect(crs.project(new LatLng(50, 30)).distanceTo(new Point(3339584.7238, 6446275.84102))).toBeLessThan(0.01);
			expect(crs.project(new LatLng(85.0511287798, 180)).distanceTo(new Point(20037508.34279, 20037508.34278))).toBeLessThan(0.01);
			expect(crs.project(new LatLng(-85.0511287798, -180)).distanceTo(new Point(-20037508.34279, -20037508.34278))).toBeLessThan(0.01);
		});
	});

	describe("unproject", () => {
		it('unprojects meter coords into geo coords correctly', () => {
			expect(crs.unproject(new Point(3339584.7238, 6446275.84102)).distanceTo(crs,new LatLng(50, 30))).toBeLessThan(0.01);
			expect(crs.unproject(new Point(20037508.34279, 20037508.34278)).distanceTo(crs,new LatLng(85.051129, 180))).toBeLessThan(0.01);
			expect(crs.unproject(new Point(-20037508.34279, -20037508.34278)).distanceTo(crs,new LatLng(-85.051129, -180))).toBeLessThan(0.01);
		});
	});

	describe("#getProjectedBounds", () => {
		it("gives correct size", () => {
			let i,
			    worldSize = 256,
			    crsSize;
			for (i = 0; i <= 22; i++) {
				crsSize = crs.getProjectedBounds(i).getSize();
				expect(crsSize.x).toEqual(worldSize);
				expect(crsSize.y).toEqual(worldSize);
				worldSize *= 2;
			}
		});
	});

	describe('#wrapLatLng', () => {
		it("wraps longitude to lie between -180 and 180 by default", () => {
			expect(crs.wrapLatLng(new LatLng(0, 190)).lng).toEqual(-170);
			expect(crs.wrapLatLng(new LatLng(0, 360)).lng).toEqual(0);
			expect(crs.wrapLatLng(new LatLng(0, 380)).lng).toEqual(20);
			expect(crs.wrapLatLng(new LatLng(0, -190)).lng).toEqual(170);
			expect(crs.wrapLatLng(new LatLng(0, -360)).lng).toEqual(0);
			expect(crs.wrapLatLng(new LatLng(0, -380)).lng).toEqual(-20);
			expect(crs.wrapLatLng(new LatLng(0, 90)).lng).toEqual(90);
			expect(crs.wrapLatLng(new LatLng(0, 180)).lng).toEqual(180);
		});

		it("does not drop altitude", () => {
			expect(crs.wrapLatLng(new LatLng(0, 190, 1234)).lng).toEqual(-170);
			expect(crs.wrapLatLng(new LatLng(0, 190, 1234)).alt).toEqual(1234);

			expect(crs.wrapLatLng(new LatLng(0, 380, 1234)).lng).toEqual(20);
			expect(crs.wrapLatLng(new LatLng(0, 380, 1234)).alt).toEqual(1234);
		});

	});

});

describe("CRS.EPSG4326", () => {
	let crs = new EPSG4326();

	describe("#getSize", () => {
		it("gives correct size", () => {
			let i,
			    worldSize = 256,
			    crsSize;
			for (i = 0; i <= 22; i++) {
				crsSize = crs.getProjectedBounds(i).getSize();
				expect(crsSize.x).toEqual(worldSize * 2);
				// Lat bounds are half as high (-90/+90 compared to -180/+180)
				expect(crsSize.y).toEqual(worldSize);
				worldSize *= 2;
			}
		});
	});
});

describe("CRS.EPSG3395", () => {
	let crs = new EPSG3395();

	describe("#latLngToPoint", () => {
		it("projects a center point", () => {
			expect(crs.latLngToPoint(LatLng.latLng(0, 0), 0).distanceTo(new Point(128, 128))).toBeLessThan(0.01);
		});

		it("projects the northeast corner of the world", () => {
			expect(crs.latLngToPoint(LatLng.latLng(85.0840591556, 180), 0).distanceTo(new Point(256, 0))).toBeLessThan(0.01);
		});
	});

	describe("#pointToLatLng", () => {
		it("reprojects a center point", () => {
			expect(crs.pointToLatLng(new Point(128, 128), 0).distanceTo(crs,new LatLng(0, 0))).toBeLessThan(0.01);
		});

		it("reprojects the northeast corner of the world", () => { // how close should be expected??
			expect(crs.pointToLatLng(new Point(256, 0), 0).distanceTo(crs,new LatLng(85.0840591556, 180))).toBeLessThan(0.1);
		});
	});
});

describe("CRS.Simple", () => {
	var crs = new Simple();

	describe("#latLngToPoint", () => {
		it("converts LatLng coords to pixels", () => {
			expect(crs.latLngToPoint(LatLng.latLng(0, 0), 0).distanceTo(new Point(0, 0))).toBeLessThan(0.01);
			expect(crs.latLngToPoint(LatLng.latLng(700, 300), 0).distanceTo(new Point(300, -700))).toBeLessThan(0.01);
			expect(crs.latLngToPoint(LatLng.latLng(-200, 1000), 1).distanceTo(new Point(2000, 400))).toBeLessThan(0.01);
		});
	});

	describe("#pointToLatLng", () => {
		it("converts pixels to LatLng coords", () => {
			expect(crs.pointToLatLng(new Point(0, 0), 0).distanceTo(crs,new LatLng(0, 0))).toBeLessThan(0.01);
			expect(crs.pointToLatLng(new Point(300, -700), 0).distanceTo(crs,new LatLng(700, 300))).toBeLessThan(0.01);
			expect(crs.pointToLatLng(new Point(2000, 400), 1).distanceTo(crs,new LatLng(-200, 1000))).toBeLessThan(0.01);
		});
	});

	describe("getProjectedBounds", () => {
		it("returns nothing", () => {
			expect(crs.getProjectedBounds(5)).toBe(null);
		});
	});

	describe("wrapLatLng", () => {
		it("returns coords as is", () => {
			expect(crs.wrapLatLng(new LatLng(270, 400)).equals(new LatLng(270, 400))).toBe(true);
		});
		it("wraps coords if configured", () => {
			let crs = new Simple([-200, 200], [-200, 200]);

			expect(crs.wrapLatLng(new LatLng(300, -250)).distanceTo(crs,new LatLng(-100, 150))).toBeLessThan(0.01);
		});
	});
});

describe("CRS", () => {
	let crs = new CRS();

	describe("#zoom && #scale", () => {
		it("convert zoom to scale and viceversa and return the same values", () => {
			let zoom = 2.5;
			let scale = crs.scale(zoom);
			expect(crs.zoom(scale)).toEqual(zoom);
		});
	});
});

