import { Point } from '../../../src/geometry/Point';
import { LatLng } from '../../../src/geo/LatLng';
import { Mercator } from '../../../src/geo/projection/Projection.Mercator';
import { SphericalMercator } from '../../../src/geo/projection/Projection.SphericalMercator';

describe("Projection.Mercator", () => {
	var p = new Mercator();

	describe("#project", () => {
		it("projects a center point", () => {
			// edge cases
			expect(p.project(new LatLng(0, 0)).distanceTo(new Point(0, 0))).toBeLessThan(0.01);
		});

		it("projects the northeast corner of the world", () => {
			expect(p.project(new LatLng(85.0840591556, 180)).distanceTo(new Point(20037508, 20037508))).toBeLessThan(1);
		});

		it("projects the southwest corner of the world", () => {
			expect(p.project(new LatLng(-85.0840591556, -180)).distanceTo(new Point(-20037508, -20037508))).toBeLessThan(1);
		});

		it("projects other points", () => {
			expect(p.project(new LatLng(50, 30)).distanceTo(new Point(3339584, 6413524))).toBeLessThan(1);

			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(p.project(new LatLng(51.9371170300465, 80.11230468750001)).distanceTo(new Point(8918060.964088084, 6755099.410887127))).toBeLessThan(0.01);
		});
	});

	describe("#unproject", () => {
		function pr(point) {
			return p.project(p.unproject(point));
		}

		it("unprojects a center point", () => {
			expect(pr(new Point(0, 0)).distanceTo(new Point(0, 0))).toBeLessThan(0.01);
		});

		it("unprojects pi points", () => {
			expect(pr(new Point(-Math.PI, Math.PI)).distanceTo(new Point(-Math.PI, Math.PI))).toBeLessThan(0.01);
			expect(pr(new Point(-Math.PI, -Math.PI)).distanceTo(new Point(-Math.PI, -Math.PI))).toBeLessThan(0.01);

			expect(pr(new Point(0.523598775598, 1.010683188683)).distanceTo(new Point(0.523598775598, 1.010683188683))).toBeLessThan(0.01);
		});

		it('unprojects other points', () => {
			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(pr(new Point(8918060.964088084, 6755099.410887127)));
		});
	});
});
describe("Projection.SphericalMercator", () => {
	var p = new SphericalMercator();

	describe("#project", () => {
		it("projects a center point", () => {
			// edge cases
			expect(p.project(new LatLng(0, 0)).distanceTo(new Point(0, 0))).toBeLessThan(0.01);
		});

		it("projects the northeast corner of the world", () => {
			expect(p.project(new LatLng(85.0511287798, 180)).distanceTo(new Point(20037508, 20037508))).toBeLessThan(0.5);
		});

		it("projects the southwest corner of the world", () => {
			expect(p.project(new LatLng(-85.0511287798, -180)).distanceTo(new Point(-20037508, -20037508))).toBeLessThan(0.5);
		});

		it("projects other points", () => {
			expect(p.project(new LatLng(50, 30)).distanceTo(new Point(3339584, 6446275))).toBeLessThan(1.2);

			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(p.project(new LatLng(51.9371170300465, 80.11230468750001)).distanceTo(new Point(8918060.96409, 6788763.38325))).toBeLessThan(0.01);
		});
	});

	describe("#unproject", () => {
		function pr(point) {
			return p.project(p.unproject(point));
		}

		it("unprojects a center point", () => {
			expect(pr(new Point(0, 0)).distanceTo(new Point(0, 0))).toBeLessThan(0.01);
		});

		it("unprojects pi points", () => {
			expect(pr(new Point(-Math.PI, Math.PI)).distanceTo(new Point(-Math.PI, Math.PI))).toBeLessThan(0.01);
			expect(pr(new Point(-Math.PI, -Math.PI)).distanceTo(new Point(-Math.PI, -Math.PI))).toBeLessThan(0.01);

			expect(pr(new Point(0.523598775598, 1.010683188683)).distanceTo(new Point(0.523598775598, 1.010683188683))).toBeLessThan(0.01);
		});

		it('unprojects other points', () => {
			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(pr(new Point(8918060.964088084, 6755099.410887127)));
		});
	});
});
