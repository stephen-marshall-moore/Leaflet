import { LatLng } from '../../../src/geo/LatLng';
import { LatLngBounds } from '../../../src/geo/LatLngBounds';
//import { Earth } from '../../../src/geo/crs/CRS.Earth';

describe('LatLngBounds', () => {
	var a, c;

	beforeEach(() => {
		a = new LatLngBounds(
			new LatLng(14, 12),
			new LatLng(30, 40));
		c = new LatLngBounds();
	});

	describe('constructor', () => {
		it('instantiates either passing two latlngs or an array of latlngs', () => {
			var b = new LatLngBounds([
				new LatLng(14, 12),
				new LatLng(30, 40)
			]);
			expect(b).toEqual(a);
			expect(b.northWest).toEqual(new LatLng(30, 12));
		});
	});

	describe('#extend', () => {
		it('extends the bounds by a given point', () => {
			a.extend(new LatLng(20, 50));
			expect(a.northEast).toEqual(new LatLng(30, 50));
		});

		it('extends the bounds by given bounds', () => {
			a.extend([[20, 50], [8, 40]]);
			expect(a.southEast).toEqual(new LatLng(8, 50));
		});

		it('extends the bounds by undefined', () => {
			expect(a.extend()).toEqual(a);
		});

		it('extends the bounds by raw object', () => {
			a.extend({lat: 20, lng: 50});
			expect(a.northEast).toEqual(new LatLng(30, 50));
		});

		it('extend the bounds by an empty bounds object', () => {
			expect(a.extend(new LatLngBounds())).toEqual(a);
		});
	});

	describe('#get center', () => {
		it('returns the bounds center', () => {
			expect(a.center).toEqual(new LatLng(22, 26));
		});
	});

	describe('#pad', () => {
		it('pads the bounds by a given ratio', () => {
			var b = a.pad(0.5);

			expect(b).toEqual(LatLngBounds.latLngBounds([[6, -2], [38, 54]]));
		});
	});

	describe('#equals', () => {
		it('returns true if bounds equal', () => {
			expect(a.equals([[14, 12], [30, 40]])).toEqual(true);
			expect(a.equals([[14, 13], [30, 40]])).toEqual(false);
			expect(a.equals(null)).toEqual(false);
		});
	});

	describe('#isValid', () => {
		it('returns true if properly set up', () => {
			expect(a.isValid()).toBe(true);
		});
		it('returns false if is invalid', () => {
			expect(c.isValid()).toBe(false);
		});
		it('returns true if extended', () => {
			c.extend([0, 0]);
			expect(c.isValid()).toBe(true);
		});
	});

	describe('#get west', () => {
		it('returns a proper bbox west value', () => {
			expect(a.west).toEqual(12);
		});
	});

	describe('#get south', () => {
		it('returns a proper bbox south value', () => {
			expect(a.south).toEqual(14);
		});

	});

	describe('#get east', () => {
		it('returns a proper bbox east value', () => {
			expect(a.east).toEqual(40);
		});

	});

	describe('#get north', () => {
		it('returns a proper bbox north value', () => {
			expect(a.north).toEqual(30);
		});

	});

	describe('#toBBoxString', () => {
		it('returns a proper left,bottom,right,top bbox', () => {
			expect(a.toBBoxString()).toEqual("12,14,40,30");
		});

	});

	describe('#get northWest', () => {
		it('returns a proper north-west LatLng', () => {
			expect(a.northWest).toEqual(new LatLng(a.north, a.west));
		});

	});

	describe('#get southEast', () => {
		it('returns a proper south-east LatLng', () => {
			expect(a.southEast).toEqual(new LatLng(a.south, a.east));
		});
	});

	describe('#contains', () => {
		it('returns true if contains latlng point', () => {
			expect(a.contains([16, 20])).toEqual(true);
			expect(LatLngBounds.latLngBounds(a).contains([5, 20])).toEqual(false);
		});

		it('returns true if contains bounds', () => {
			expect(a.contains([[16, 20], [20, 40]])).toEqual(true);
			expect(a.contains([[16, 50], [8, 40]])).toEqual(false);
		});
	});

	describe('#intersects', () => {
		it('returns true if intersects the given bounds', () => {
			expect(a.intersects([[16, 20], [50, 60]])).toEqual(true);
			expect(a.contains([[40, 50], [50, 60]])).toEqual(false);
		});

		it('returns true if just touches the boundary of the given bounds', () => {
			expect(a.intersects([[25, 40], [55, 50]])).toEqual(true);
		});
	});

	describe('#overlaps', () => {
		it('returns true if overlaps the given bounds', () => {
			expect(a.overlaps([[16, 20], [50, 60]])).toEqual(true);
		});
		it('returns false if just touches the boundary of the given bounds', () => {
			expect(a.overlaps([[25, 40], [55, 50]])).toEqual(false);
		});
	});

});
