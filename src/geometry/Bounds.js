/*
 * Bounds class represents a rectangular are on the screen in pixel coordinates.
 */
import {Point} from './Point';

export class Bounds {

	constructor(a, b) { // (Point, Point) or (Point[])
		if (!a) { return }

		let points = b ? [a, b] : a

		for (let p of points) {
			this.extend(p)
		}
	}

	static bounds(a, b) { // (Bounds) or (Point, Point) or (Point[])
		if (!a || a instanceof Bounds) {
			return a
		}

		return new Bounds(a, b)
	}

	extend(p) { // (Point) or ([x,y])
		let pt = Point.point(p)

		if (!this.min && !this.max) {
			this.min = pt.clone()
			this.max = pt.clone()
		} else {
			this.min.x = Math.min(pt.x, this.min.x)
			this.max.x = Math.max(pt.x, this.max.x)
			this.min.y = Math.min(pt.y, this.min.y)
			this.max.y = Math.max(pt.y, this.max.y)
		}

		return this
	}

	get center() { // (Boolean) -> Point // rounding must happen separately
		return new Point((this.min.x + this.max.x) / 2, (this.min.y + this.max.y) / 2)
	}

	get bottomLeft() { // () -> Point
		return new Point(this.min.x, this.max.y)
	}

	get topRight() { // () -> Point
		return new Point(this.max.x, this.min.y)
	}

	get size() { // () -> Point
		return this.max.subtract(this.min)
	}

	contains(obj) { // (Bounds) or (Point) -> Boolean
		let min, max

		if (typeof obj[0] === 'number' || obj instanceof Point) {
			obj = Point.point(obj)
		} else {
			obj = Bounds.bounds(obj)
		}

		if (obj instanceof Bounds) {
			min = obj.min
			max = obj.max
		} else {
			min = max = obj
		}

		return (min.x >= this.min.x) &&
						(max.x <= this.max.x) &&
						(min.y >= this.min.y) &&
						(max.y <= this.max.y)
	}

	intersects(b) { // (Bounds) -> Boolean
		b = Bounds.bounds(b)

		let min = this.min,
		max = this.max,
		min2 = b.min,
		max2 = b.max,
		xIntersects = (max2.x >= min.x) && (min2.x <= max.x),
		yIntersects = (max2.y >= min.y) && (min2.y <= max.y)

		return xIntersects && yIntersects
	}

	overlaps(b) { // (Bounds) -> Boolean
		b = Bounds.bounds(b)

		let min = this.min,
		max = this.max,
		min2 = b.min,
		max2 = b.max,
		xOverlaps = (max2.x > min.x) && (min2.x < max.x),
		yOverlaps = (max2.y > min.y) && (min2.y < max.y)

		return xOverlaps && yOverlaps
	}

	isValid() { // -> Boolean
		return !!(this.min && this.max)
	}

	toString() {
		return `Bounds[${this.getTopLeft()},${this.getBottomRight()}]`
	}

}
