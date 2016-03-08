//import {Point} from '/lib/geometry/Point.js'
"use strict";

describe("Point", function ()
  {

		let Point = null;

    before(function(done) {
        System
            .import('src/geometry/Point')
            .then(function(t) {
                Point = t.Point; //when exporting a default class , key is 'default'
                done();
            })
            .catch(function(e) {
                console.log('>>> error loading class', e);
                done();
            });
    });


    after(function() {
        Point = null;
    });

    describe('constructor', function ()
      {

        it("creates a point with the given x and y", function ()
          {
            let p = new Point(1.5, 2.5);
            expect(p.x).to.eql(1.5);
            expect(p.y).to.eql(2.5);
          }
        )

        it("rounds the given x and y if the third argument is true", function ()
          {
            let p = new Point(1.3, 2.56, true);
            expect(p.x).to.eql(1);
            expect(p.y).to.eql(3);
          }
        )

      }

    )

    describe('factory', function ()
      {
        it("leaves Point instances as is", function ()
          {
            let origin = new Point(50, 30);
            let result = Point.point(origin);
            expect(origin).to.eql(result);
          }
        )

        it("creates a point out of three arguments", function ()
          {
            let origin = Point.point(50.1, 29.9, true);
            let result = new Point(50,30);
            expect(origin).to.eql(result);
          }
        )

        it("creates a point from array of coordinates", function ()
          {
            let origin = Point.point([-35.2,557.89]);
            let result = new Point(-35.2,557.89);
            expect(origin).to.eql(result);
          }
        )

        it("does not fail on invalid arguments", function ()
          {
            expect(Point.point(undefined)).to.be(undefined);
            expect(Point.point(null)).to.be(null);
          }
        )
      }

    )

    describe('#add', function ()
      {

        it("adds given point to this one", function ()
          {
            let origin = new Point(50, 30);
            let addend = new Point(20, 10);
            let result = new Point(70, 40);
            expect(origin.add(addend)).to.eql(result);
          }
        )
      }

    )

    describe('#subtract', function ()
      {

        it("subtracts given point to this one", function ()
          {
            let origin = new Point(50, 30);
            let addend = new Point(20, 10);
            let result = new Point(30, 20);
            expect(origin.subtract(addend)).to.eql(result);
          }
        )
      }

    )

    describe('#divideBy', function ()
      {

        it("divides this point by amount", function ()
          {
            let origin = new Point(50, 30);
            let operand = 5;
            let result = new Point(10, 6);
            expect(origin.divideBy(operand)).to.eql(result);
          }
        )
      }

    )

    describe('#multiplyBy', function ()
      {

        it("multiplies this point by amount", function ()
          {
            let origin = new Point(50, 30);
            let operand = 5;
            let result = new Point(250, 150);
            expect(origin.multiplyBy(operand)).to.eql(result);
          }
        )
      }

    )

    describe('#floor', function ()
      {

        it("returns new point with floored coordinates", function ()
          {
            let origin = new Point(50.56, 30.123);
            let result = new Point(50, 30);
            expect(origin.floor()).to.eql(result);
          }
        )
      }

    )

    describe('#ceil', function ()
      {

        it("returns new point with ceilinged coordinates", function ()
          {
            let origin = new Point(50.56, 30.123);
            let result = new Point(51, 31);
            expect(origin.ceil()).to.eql(result);
          }
        )
      }

    )

    describe('#distanceTo', function ()
      {

        it("returns distance between this point and given point", function ()
          {
            let origin = new Point(0,30);
            let result = new Point(40,0);
            expect(origin.distanceTo(result)).to.eql(50.0);
          }
        )
      }

    )

    describe('#equals', function ()
      {

        it("checks equality of values or this point and given point", function ()
          {
            let origin = new Point(123.45,89.0123);
            let result = new Point(123.45,89.0123);
            expect(origin.equals(result)).to.be(true);
            expect(origin.equals([123.45,89.0123])).to.be(true);
          }
        )
      }

    )

    describe('#contains', function ()
      {

        it("checks that given point is closer to origin than this point", function ()
          {
            let pt = new Point(123.45,89.0123);
            let given = new Point(-23.45,59.0123);
            expect(pt.contains(given)).to.be(true);
          }
        )
      }

    )

    describe('#toString', function ()
      {

        it("returns string representaion of this point", function ()
          {
            let pt = new Point(123.45,89.0123);
            let result = "Point(123.45,89.0123)";
            expect(pt.toString()).to.eql(result);
          }
        )
      }

    )

  }
)

