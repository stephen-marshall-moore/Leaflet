//import { Point } from '../../../src/geometry/Point';
//import { Transformation } from '../../../src/geometry/Transformation';
"use strict";

describe('Transformation', function () {

		let Point, Transformation = null;

    before(function(done) {
        System
            .import('src/geometry/Point')
            .then(function(t) {
                Point = t.Point; //when exporting a default class , key is 'default'
                //done();
            })
            .catch(function(e) {
                console.log('>>> error loading class', e);
                done();
            });
        System
            .import('src/geometry/Transformation')
            .then(function(t) {
                Transformation = t.Transformation; //when exporting a default class , key is 'default'
                done();
            })
            .catch(function(e) {
                console.log('>>> error loading class', e);
                done();
            });
    });


    after(function() {
        Point, Transformation = null;
    });

	let t, p;

	beforeEach(() => {
		t = new Transformation(1, 2, 3, 4);
		p = new Point(10, 20);
	})

	describe('#transform', () => {
		it("performs a transformation", () => {
			let p2 = t.transform(p, 2);
			expect(p2).to.eql(new Point(24, 128));
		})
		it('assumes a scale of 1 if not specified', () => {
			let p2 = t.transform(p);
			expect(p2).to.eql(new Point(12, 64));
		})
	})

	describe('#untransform', () => {
		it("performs a reverse transformation", () => {
			let p2 = t.transform(p, 2);
			let p3 = t.untransform(p2, 2);
			expect(p3).to.eql(p);
		})
		it('assumes a scale of 1 if not specified', () => {
			let p2 = t.transform(p);
			expect(t.untransform(new Point(12, 64))).to.eql(new Point(10, 20));
		})
	})
})
