import { Point } from '../../../src/geometry/Point';
import { LatLng } from '../../../src/geo/LatLng';
import { LatLngBounds } from '../../../src/geo/LatLngBounds';
import { Simple } from '../../../src/geo/crs/CRS.Simple';
import { EPSG3857 } from '../../../src/geo/crs/CRS.EPSG3857';
import { EPSG4326 } from '../../../src/geo/crs/CRS.EPSG4326';
import { EPSG3395 } from '../../../src/geo/crs/CRS.EPSG3395';

describe("CRS.EPSG3857", () => {
	let crs = new EPSG3857;

	describe("#latLngToPoint", () => {
		it("projects a center point", () => {
			expect(crs.latLngToPoint(LatLng.latLng(0, 0), 0)).near(new Point(128, 128), 0.01);
		});

		it("projects the northeast corner of the world", () => {
			expect(crs.latLngToPoint(LatLng.latLng(85.0511287798, 180), 0)).near(new Point(256, 0));
		});
	});

	describe("#pointToLatLng", () => {
		it("reprojects a center point", () => {
			expect(crs.pointToLatLng(new Point(128, 128), 0)).nearLatLng(LatLng.latLng(0, 0), 0.01);
		});

		it("reprojects the northeast corner of the world", () => {
			expect(crs.pointToLatLng(new Point(256, 0), 0)).nearLatLng(LatLng.latLng(85.0511287798, 180));
		});
	});

	describe("project", () => {
		it('projects geo coords into meter coords correctly', () => {
			expect(crs.project(new LatLng(50, 30))).near(new Point(3339584.7238, 6446275.84102));
			expect(crs.project(new LatLng(85.0511287798, 180))).near(new Point(20037508.34279, 20037508.34278));
			expect(crs.project(new LatLng(-85.0511287798, -180))).near(new Point(-20037508.34279, -20037508.34278));
		});
	});

	describe("unproject", () => {
		it('unprojects meter coords into geo coords correctly', () => {
			expect(crs.unproject(new Point(3339584.7238, 6446275.84102))).nearLatLng(new LatLng(50, 30));
			expect(crs.unproject(new Point(20037508.34279, 20037508.34278))).nearLatLng(new LatLng(85.051129, 180));
			expect(crs.unproject(new Point(-20037508.34279, -20037508.34278))).nearLatLng(new LatLng(-85.051129, -180));
		});
	});

	describe("#getProjectedBounds", () => {
		it("gives correct size", () => {
			var i,
			    worldSize = 256,
			    crsSize;
			for (i = 0; i <= 22; i++) {
				crsSize = crs.getProjectedBounds(i).getSize();
				expect(crsSize.x).equal(worldSize);
				expect(crsSize.y).equal(worldSize);
				worldSize *= 2;
			}
		});
	});

	describe('#wrapLatLng', () => {
		it("wraps longitude to lie between -180 and 180 by default", () => {
			expect(crs.wrapLatLng(new LatLng(0, 190)).lng).to.eql(-170);
			expect(crs.wrapLatLng(new LatLng(0, 360)).lng).to.eql(0);
			expect(crs.wrapLatLng(new LatLng(0, 380)).lng).to.eql(20);
			expect(crs.wrapLatLng(new LatLng(0, -190)).lng).to.eql(170);
			expect(crs.wrapLatLng(new LatLng(0, -360)).lng).to.eql(0);
			expect(crs.wrapLatLng(new LatLng(0, -380)).lng).to.eql(-20);
			expect(crs.wrapLatLng(new LatLng(0, 90)).lng).to.eql(90);
			expect(crs.wrapLatLng(new LatLng(0, 180)).lng).to.eql(180);
		});

		it("does not drop altitude", () => {
			expect(crs.wrapLatLng(new LatLng(0, 190, 1234)).lng).to.eql(-170);
			expect(crs.wrapLatLng(new LatLng(0, 190, 1234)).alt).to.eql(1234);

			expect(crs.wrapLatLng(new LatLng(0, 380, 1234)).lng).to.eql(20);
			expect(crs.wrapLatLng(new LatLng(0, 380, 1234)).alt).to.eql(1234);
		});

	});

});

describe("CRS.EPSG4326", () => {
	let crs = EPSG4326;

	describe("#getSize", () => {
		it("gives correct size", () => {
			let i,
			    worldSize = 256,
			    crsSize;
			for (i = 0; i <= 22; i++) {
				crsSize = crs.getProjectedBounds(i).getSize();
				expect(crsSize.x).equal(worldSize * 2);
				// Lat bounds are half as high (-90/+90 compared to -180/+180)
				expect(crsSize.y).equal(worldSize);
				worldSize *= 2;
			}
		});
	});
});

describe("CRS.EPSG3395", () => {
	let crs = EPSG3395;

	describe("#latLngToPoint", () => {
		it("projects a center point", () => {
			expect(crs.latLngToPoint(LatLng.latLng(0, 0), 0)).near(new Point(128, 128), 0.01);
		});

		it("projects the northeast corner of the world", () => {
			expect(crs.latLngToPoint(LatLng.latLng(85.0840591556, 180), 0)).near(new Point(256, 0));
		});
	});

	describe("#pointToLatLng", () => {
		it("reprojects a center point", () => {
			expect(crs.pointToLatLng(new Point(128, 128), 0)).nearLatLng(LatLng.latLng(0, 0), 0.01);
		});

		it("reprojects the northeast corner of the world", () => {
			expect(crs.pointToLatLng(new Point(256, 0), 0)).nearLatLng(LatLng.latLng(85.0840591556, 180));
		});
	});
});

describe("CRS.Simple", () => {
	var crs = Simple;

	describe("#latLngToPoint", () => {
		it("converts LatLng coords to pixels", () => {
			expect(crs.latLngToPoint(LatLng.latLng(0, 0), 0)).near(new Point(0, 0));
			expect(crs.latLngToPoint(LatLng.latLng(700, 300), 0)).near(new Point(300, -700));
			expect(crs.latLngToPoint(LatLng.latLng(-200, 1000), 1)).near(new Point(2000, 400));
		});
	});

	describe("#pointToLatLng", () => {
		it("converts pixels to LatLng coords", () => {
			expect(crs.pointToLatLng(L.point(0, 0), 0)).nearLatLng(new LatLng(0, 0));
			expect(crs.pointToLatLng(L.point(300, -700), 0)).nearLatLng(new LatLng(700, 300));
			expect(crs.pointToLatLng(L.point(2000, 400), 1)).nearLatLng(new LatLng(-200, 1000));
		});
	});

	describe("getProjectedBounds", () => {
		it("returns nothing", () => {
			expect(crs.getProjectedBounds(5)).to.be(null);
		});
	});

	describe("wrapLatLng", () => {
		it("returns coords as is", () => {
			expect(crs.wrapLatLng(new LatLng(270, 400)).equals(new LatLng(270, 400))).to.be(true);
		});
		it("wraps coords if configured", () => {
			let crs = new Simple([-200, 200], [-200, 200]);

			expect(crs.wrapLatLng(new LatLng(300, -250))).nearLatLng(new LatLng(-100, 150));
		});
	});
});

describe("CRS", () => {
	let crs = CRS;

	describe("#zoom && #scale", () => {
		it("convert zoom to scale and viceversa and return the same values", () => {
			let zoom = 2.5;
			let scale = crs.scale(zoom);
			expect(crs.zoom(scale)).toEqual(zoom);
		});
	});
});

