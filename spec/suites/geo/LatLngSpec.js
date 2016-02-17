import { LatLng } from '../../../src/geo/LatLng';
import { Earth } from '../../../src/geo/crs/CRS.Earth';

describe('LatLng', () => {
	describe('constructor', () => {
		it("sets lat and lng", () => {
			let a = new LatLng(25, 74);
			expect(a.lat).toEqual(25);
			expect(a.lng).toEqual(74);

			let b = new LatLng(-25, -74);
			expect(b.lat).toEqual(-25);
			expect(b.lng).toEqual(-74);
		});

		it('throws an error if invalid lat or lng', () => {
			expect(() => {
				let a = new LatLng(NaN, NaN);
			}).toThrow();
		});

		it('does not set altitude if undefined', () => {
			let a = new LatLng(25, 74);
			expect(typeof a.alt).toEqual('undefined');
		});

		it('sets altitude', () => {
			let a = new LatLng(25, 74, 50);
			expect(a.alt).toEqual(50);

			let b = new LatLng(-25, -74, -50);
			expect(b.alt).toEqual(-50);
		});

	});

	describe('#equals', () => {
		it("returns true if compared objects are equal within a certain margin", () => {
			let a = new LatLng(10, 20);
			let b = new LatLng(10 + 1.0E-10, 20 - 1.0E-10);
			expect(a.equals(b)).toBe(true);
		});

		it("returns false if compared objects are not equal within a certain margin", () => {
			let a = new LatLng(10, 20);
			let b = new LatLng(10, 23.3);
			expect(a.equals(b)).toBe(false);
		});

		it('returns false if passed non-valid object', () => {
			let a = new LatLng(10, 20);
			expect(a.equals(null)).toEqual(false);
		});
	});

	describe('#toString', () => {
		it('formats a string', () => {
			let a = new LatLng(10.333333333, 20.2222222);
			expect(a.toString(5)).toEqual('LatLng(10.333, 20.222)');
		});
	});

	describe('#distanceTo', () => {
    let crs = new Earth();

		it('calculates distance in meters', () => {
			let a = new LatLng(50.5, 30.5);
			let b = new LatLng(50, 1);

			expect(Math.abs(Math.round(a.distanceTo(crs, b) / 1000) - 2084) < 5).toEqual(true);
		});
		it('does not return NaN if input points are equal', () => {
			let a = new LatLng(50.5, 30.5);
			let b = new LatLng(50.5, 30.5);

			expect(a.distanceTo(crs, b)).toEqual(0);
		});
	});

	describe('LatLng factory', () => {
		it('returns LatLng instance as is', () => {
			let a = new LatLng(50, 30);

			expect(LatLng.latLng(a)).toEqual(a);
		});

		it('accepts an array of coordinates', () => {
			expect(LatLng.latLng([])).toEqual(null);
			expect(LatLng.latLng([50])).toEqual(null);
			expect(LatLng.latLng([50, 30])).toEqual(new LatLng(50, 30));
			expect(LatLng.latLng([50, 30, 100])).toEqual(new LatLng(50, 30, 100));
		});

		it('passes null or undefined as is', () => {
			expect(LatLng.latLng(undefined)).toEqual(undefined);
			expect(LatLng.latLng(null)).toEqual(null);
		});

		it('creates a LatLng object from two coordinates', () => {
			expect(LatLng.latLng(50, 30)).toEqual(new LatLng(50, 30));
		});

		it('accepts an object with lat/lng', () => {
			expect(LatLng.latLng({lat: 50, lng: 30})).toEqual(new LatLng(50, 30));
		});

		it('accepts an object with lat/lon', () => {
			expect(LatLng.latLng({lat: 50, lon: 30})).toEqual(new LatLng(50, 30));
		});

		it('returns null if lng not specified', () => {
			expect(LatLng.latLng(50)).toBe(null);
		});

		it('accepts altitude as third parameter', () => {
			expect(LatLng.latLng(50, 30, 100)).toEqual(new LatLng(50, 30, 100));
		});

		it('accepts an object with alt', () => {
			expect(LatLng.latLng({lat: 50, lng: 30, alt: 100})).toEqual(new LatLng(50, 30, 100));
			expect(LatLng.latLng({lat: 50, lon: 30, alt: 100})).toEqual(new LatLng(50, 30, 100));
		});
	});

	describe('#clone', () => {

		it('should clone attributes', () => {
			let a = new LatLng(50.5, 30.5, 100);
			let b = a.clone();

			expect(b.lat).toEqual(50.5);
			expect(b.lng).toEqual(30.5);
			expect(b.alt).toEqual(100);
		});

		it('should create another reference', () => {
			let a = new LatLng(50.5, 30.5, 100);
			let b = a.clone();

			expect(a === b).toBe(false);
		});

	});

});
