/*
 * Point class
 */

export class Point {

  constructor(x,y,round) {
    this.x = (round ? Math.round(x) : x);
    this.y = (round ? Math.round(y) : y);
  }

  clone() {
    return new Point(this.x, this.y);
  }

  static point(x,y,round) {
    if (x instanceof Point) {
      return x;
    }
    if (x instanceof Array) {
      return new Point(x[0], x[1]);
    }
    if (x === undefined || x === null) {
      return x;
    }

    return new Point(x,y,round);
  }

  _add(p) {
    this.x += p.x;
    this.y += p.y;
    return this;
  }

  add(p) {
    return this.clone()._add(Point.point(p));
  }

  _subtract(p) {
    this.x -= p.x;
    this.y -= p.y;
    return this;
  }

  subtract(p) {
    return this.clone()._subtract(Point.point(p));
  }

  _divideBy(s) {
    this.x /= s;
    this.y /= s;
    return this;
  }

  divideBy(s) {
    return this.clone()._divideBy(s);
  }

  _multiplyBy(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  multiplyBy(s) {
    return this.clone()._multiplyBy(s);
  }

  _floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  floor() {
    return this.clone()._floor();
  }

  _ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  ceil() {
    return this.clone()._ceil();
  }

  distanceTo(p) {
    let dx = p.x - this.x;
    let dy = p.y = this.y;
    return Math.sqrt( dx * dx + dy * dy );
  }

  equals(p) {
    let pt = Point.point(p);
    return pt.x === this.x &&
            pt.y === this.y;
  }

  contains(p) {
    let pt = Point.point(p);
    return Math.abs(pt.x) <= Math.abs(this.x) &&
            Math.abs(pt.y) <= Math.abs(this.y);
  }

  toString() {
    return `Point(${this.x},${this.y})`;
  }

}
