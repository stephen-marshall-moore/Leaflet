import { Point } from '../../../src/geometry/Point';

describe("Point", () =>
  {

    describe('constructor', () =>
      {

        it("creates a point with the given x and y", () =>
          {
            let p = new Point(1.5, 2.5);
            expect(p.x).toEqual(1.5);
            expect(p.y).toEqual(2.5);
          }
        )

        it("rounds the given x and y if the third argument is true", () =>
          {
            let p = new Point(1.3, 2.56, true);
            expect(p.x).toEqual(1);
            expect(p.y).toEqual(3);
          }
        )

      }

    )

    describe('factory', () =>
      {
        it("leaves Point instances as is", () =>
          {
            let origin = new Point(50, 30);
            let result = Point.point(origin);
            expect(origin).toEqual(result);
          }
        )

        it("creates a point out of three arguments", () =>
          {
            let origin = Point.point(50.1, 29.9, true);
            let result = new Point(50,30);
            expect(origin).toEqual(result);
          }
        )

        it("creates a point from array of coordinates", () =>
          {
            let origin = Point.point([-35.2,557.89]);
            let result = new Point(-35.2,557.89);
            expect(origin).toEqual(result);
          }
        )

        it("does not fail on invalid arguments", () =>
          {
            expect(Point.point(undefined)).toBe(undefined);
            expect(Point.point(null)).toBe(null);
          }
        )
      }

    )

    describe('#add', () =>
      {

        it("adds given point to this one", () =>
          {
            let origin = new Point(50, 30);
            let addend = new Point(20, 10);
            let result = new Point(70, 40);
            expect(origin.add(addend)).toEqual(result);
          }
        )
      }

    )

    describe('#subtract', () =>
      {

        it("subtracts given point to this one", () =>
          {
            let origin = new Point(50, 30);
            let addend = new Point(20, 10);
            let result = new Point(30, 20);
            expect(origin.subtract(addend)).toEqual(result);
          }
        )
      }

    )

    describe('#divideBy', () =>
      {

        it("divides this point by amount", () =>
          {
            let origin = new Point(50, 30);
            let operand = 5;
            let result = new Point(10, 6);
            expect(origin.divideBy(operand)).toEqual(result);
          }
        )
      }

    )

    describe('#multiplyBy', () =>
      {

        it("multiplies this point by amount", () =>
          {
            let origin = new Point(50, 30);
            let operand = 5;
            let result = new Point(250, 150);
            expect(origin.multiplyBy(operand)).toEqual(result);
          }
        )
      }

    )

    describe('#floor', () =>
      {

        it("returns new point with floored coordinates", () =>
          {
            let origin = new Point(50.56, 30.123);
            let result = new Point(50, 30);
            expect(origin.floor()).toEqual(result);
          }
        )
      }

    )

    describe('#ceil', () =>
      {

        it("returns new point with ceilinged coordinates", () =>
          {
            let origin = new Point(50.56, 30.123);
            let result = new Point(51, 31);
            expect(origin.ceil()).toEqual(result);
          }
        )
      }

    )

    describe('#distanceTo', () =>
      {

        it("returns distance between this point and given point", () =>
          {
            let origin = new Point(0,30);
            let result = new Point(40,0);
            expect(origin.distanceTo(result)).toEqual(50.0);
          }
        )
      }

    )

    describe('#equals', () =>
      {

        it("checks equality of values or this point and given point", () =>
          {
            let origin = new Point(123.45,89.0123);
            let result = new Point(123.45,89.0123);
            expect(origin.equals(result)).toBe(true);
            expect(origin.equals([123.45,89.0123])).toBe(true);
          }
        )
      }

    )

    describe('#contains', () =>
      {

        it("checks that given point is closer to origin than this point", () =>
          {
            let pt = new Point(123.45,89.0123);
            let given = new Point(-23.45,59.0123);
            expect(pt.contains(given)).toBe(true);
          }
        )
      }

    )

    describe('#toString', () =>
      {

        it("returns string representaion of this point", () =>
          {
            let pt = new Point(123.45,89.0123);
            let result = "Point(123.45,89.0123)";
            expect(pt.toString()).toEqual(result);
          }
        )
      }

    )

  }
)

