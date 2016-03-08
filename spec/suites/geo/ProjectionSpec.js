//import { Point } from '../../../src/geometry/Point';
//import { LatLng } from '../../../src/geo/LatLng';
//import { Mercator } from '../../../src/geo/projection/Projection.Mercator';
//import { SphericalMercator } from '../../../src/geo/projection/Projection.SphericalMercator';
"use strict";

describe("Projection", function () {

	let Point, LatLng, Mercator, SphericalMercator = null;

  before(function(done) {
    System
      .import('src/geometry/Point')
      .then(function(t) {
				Point = t.Point;
      })
      .catch(function(e) {
          console.log('>>> error loading class', e);
          done();
      });
    System
      .import('src/geo/LatLng')
      .then(function(t) {
				LatLng = t.LatLng;
      })
      .catch(function(e) {
          console.log('>>> error loading class', e);
          done();
      });
    System
      .import('src/geo/projection/Projection.Mercator')
      .then(function(t) {
				Mercator = t.Mercator;
      })
      .catch(function(e) {
          console.log('>>> error loading class', e);
          done();
      });
    System
      .import('src/geo/projection/Projection.SphericalMercator')
      .then(function(t) {
          SphericalMercator = t.SphericalMercator;
          done();
      })
      .catch(function(e) {
          console.log('>>> error loading class', e);
          done();
      });
  });

  after(function() {
    Point, LatLng, Mercator, SphericalMercator = null;
  });

describe("Projection.Mercator", function () {

	describe("#project", function () {
		it("projects a center point", function () {
			let p = new Mercator();
			// edge cases
			expect(p.project(new LatLng(0, 0))).near(new Point(0, 0), 0.01);
		});

		it("projects the northeast corner of the world", function () {
			let p = new Mercator();
			expect(p.project(new LatLng(85.0840591556, 180))).near(new Point(20037508, 20037508));
		});

		it("projects the southwest corner of the world", function () {
			let p = new Mercator();
			expect(p.project(new LatLng(-85.0840591556, -180))).near(new Point(-20037508, -20037508));
		});

		it("projects other points", function () {
			let p = new Mercator();
			expect(p.project(new LatLng(50, 30))).near(new Point(3339584, 6413524));

			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(p.project(new LatLng(51.9371170300465, 80.11230468750001))).near(new Point(8918060.964088084, 6755099.410887127));
		});
	});

	describe("#unproject", function () {
		function pr(point) {
			let p = new Mercator();
			return p.project(p.unproject(point));
		}

		it("unprojects a center point", function () {
			expect(pr(new Point(0, 0))).near(new Point(0, 0));
		});

		it("unprojects pi points", function () {
			expect(pr(new Point(-Math.PI, Math.PI))).near(new Point(-Math.PI, Math.PI));
			expect(pr(new Point(-Math.PI, -Math.PI))).near(new Point(-Math.PI, -Math.PI));

			expect(pr(new Point(0.523598775598, 1.010683188683))).near(new Point(0.523598775598, 1.010683188683));
		});

		it('unprojects other points', function () {
			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(pr(new Point(8918060.964088084, 6755099.410887127)));
		});
	});
});

describe("Projection.SphericalMercator", function () {

	describe("#project", function () {
		it("projects a center point", function () {
			let p = new SphericalMercator();
			// edge cases
			expect(p.project(new LatLng(0, 0))).near(new Point(0, 0));
		});

		it("projects the northeast corner of the world", function () {
			let p = new SphericalMercator();
			expect(p.project(new LatLng(85.0511287798, 180))).near(new Point(20037508, 20037508));
		});

		it("projects the southwest corner of the world", function () {
			let p = new SphericalMercator();
			expect(p.project(new LatLng(-85.0511287798, -180))).near(new Point(-20037508, -20037508));
		});

		it("projects other points", function () {
			let p = new SphericalMercator();
			expect(p.project(new LatLng(50, 30))).near(new Point(3339584, 6446275));

			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(p.project(new LatLng(51.9371170300465, 80.11230468750001))).near(new Point(8918060.96409, 6788763.38325));
		});
	});

	describe("#unproject", function () {
		function pr(point) {
			let p = new SphericalMercator();
			return p.project(p.unproject(point));
		}

		it("unprojects a center point", function () {
			expect(pr(new Point(0, 0))).near(new Point(0, 0));
		});

		it("unprojects pi points", function () {
			expect(pr(new Point(-Math.PI, Math.PI))).near(new Point(-Math.PI, Math.PI));
			expect(pr(new Point(-Math.PI, -Math.PI))).near(new Point(-Math.PI, -Math.PI));

			expect(pr(new Point(0.523598775598, 1.010683188683))).near(new Point(0.523598775598, 1.010683188683));
		});

		it('unprojects other points', function () {
			// from https://github.com/Leaflet/Leaflet/issues/1578
			expect(pr(new Point(8918060.964088084, 6755099.410887127)));
		});
	});
});
});
