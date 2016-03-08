//import { LatLng } from '../../../src/geo/LatLng';
//import { LatLngBounds } from '../../../src/geo/LatLngBounds';
//import { Earth } from '../../../src/geo/crs/CRS.Earth';
"use strict";

describe('LatLngBounds', function () {

	let LatLng, LatLngBounds = null;

  before(function(done) {
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
      .import('src/geo/LatLngBounds')
      .then(function(t) {
          LatLngBounds = t.LatLngBounds;
          console.log('>>> LatLngBounds loaded');
          done();
      })
      .catch(function(e) {
          console.log('>>> error loading class', e);
          done();
      });

		console.log('>>> before ...');
  });

  after(function() {
    LatLng, LatLngBounds = null;
  });

	var a, c;

	beforeEach(function () {
		a = new LatLngBounds(
			new LatLng(14, 12),
			new LatLng(30, 40));
		c = new LatLngBounds();
	});

	describe('constructor', function () {
		it('instantiates either passing two latlngs or an array of latlngs', function () {
			var b = new LatLngBounds([
				new LatLng(14, 12),
				new LatLng(30, 40)
			]);
			expect(b).to.eql(a);
			expect(b.northWest).to.eql(new LatLng(30, 12));
		});
	});

	describe('#extend', function () {
		it('extends the bounds by a given point', function () {
			a.extend(new LatLng(20, 50));
			expect(a.northEast).to.eql(new LatLng(30, 50));
		});

		it('extends the bounds by given bounds', function () {
			a.extend([[20, 50], [8, 40]]);
			expect(a.southEast).to.eql(new LatLng(8, 50));
		});

		it('extends the bounds by undefined', function () {
			expect(a.extend()).to.eql(a);
		});

		it('extends the bounds by raw object', function () {
			a.extend({lat: 20, lng: 50});
			expect(a.northEast).to.eql(new LatLng(30, 50));
		});

		it('extend the bounds by an empty bounds object', function () {
			expect(a.extend(new LatLngBounds())).to.eql(a);
		});
	});

	describe('#get center', function () {
		it('returns the bounds center', function () {
			expect(a.center).to.eql(new LatLng(22, 26));
		});
	});

	describe('#pad', function () {
		it('pads the bounds by a given ratio', function () {
			var b = a.pad(0.5);

			expect(b).to.eql(LatLngBounds.latLngBounds([[6, -2], [38, 54]]));
		});
	});

	describe('#equals', function () {
		it('returns true if bounds equal', function () {
			expect(a.equals([[14, 12], [30, 40]])).to.eql(true);
			expect(a.equals([[14, 13], [30, 40]])).to.eql(false);
			expect(a.equals(null)).to.eql(false);
		});
	});

	describe('#isValid', function () {
		it('returns true if properly set up', function () {
			expect(a.isValid()).to.be(true);
		});
		it('returns false if is invalid', function () {
			expect(c.isValid()).to.be(false);
		});
		it('returns true if extended', function () {
			c.extend([0, 0]);
			expect(c.isValid()).to.be(true);
		});
	});

	describe('#get west', function () {
		it('returns a proper bbox west value', function () {
			expect(a.west).to.eql(12);
		});
	});

	describe('#get south', function () {
		it('returns a proper bbox south value', function () {
			expect(a.south).to.eql(14);
		});

	});

	describe('#get east', function () {
		it('returns a proper bbox east value', function () {
			expect(a.east).to.eql(40);
		});

	});

	describe('#get north', function () {
		it('returns a proper bbox north value', function () {
			expect(a.north).to.eql(30);
		});

	});

	describe('#toBBoxString', function () {
		it('returns a proper left,bottom,right,top bbox', function () {
			expect(a.toBBoxString()).to.eql("12,14,40,30");
		});

	});

	describe('#get northWest', function () {
		it('returns a proper north-west LatLng', function () {
			expect(a.northWest).to.eql(new LatLng(a.north, a.west));
		});

	});

	describe('#get southEast', function () {
		it('returns a proper south-east LatLng', function () {
			expect(a.southEast).to.eql(new LatLng(a.south, a.east));
		});
	});

	describe('#contains', function () {
		it('returns true if contains latlng point', function () {
			expect(a.contains([16, 20])).to.eql(true);
			expect(LatLngBounds.latLngBounds(a).contains([5, 20])).to.eql(false);
		});

		it('returns true if contains bounds', function () {
			expect(a.contains([[16, 20], [20, 40]])).to.eql(true);
			expect(a.contains([[16, 50], [8, 40]])).to.eql(false);
		});
	});

	describe('#intersects', function () {
		it('returns true if intersects the given bounds', function () {
			expect(a.intersects([[16, 20], [50, 60]])).to.eql(true);
			expect(a.contains([[40, 50], [50, 60]])).to.eql(false);
		});

		it('returns true if just touches the boundary of the given bounds', function () {
			expect(a.intersects([[25, 40], [55, 50]])).to.eql(true);
		});
	});

	describe('#overlaps', function () {
		it('returns true if overlaps the given bounds', function () {
			expect(a.overlaps([[16, 20], [50, 60]])).to.eql(true);
		});
		it('returns false if just touches the boundary of the given bounds', function () {
			expect(a.overlaps([[25, 40], [55, 50]])).to.eql(false);
		});
	});

});
