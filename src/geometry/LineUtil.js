/*
 * L.LineUtil contains different utility functions for line segments
 * and polylines (clipping, simplification, distances, etc.)
 */
import {Point} from './Point'

export class LineUtil {

	// Simplify polyline with vertex reduction and Douglas-Peucker simplification.
	// Improves rendering performance dramatically by lessening the number of points to draw.

	static simplify(points, tolerance) {
		if (!tolerance || !points.length) {
			return points.slice()
		}

		const sqTolerance = tolerance * tolerance

		// stage 1: vertex reduction
		points = LineUtil._reducePoints(points, sqTolerance)

		// stage 2: Douglas-Peucker simplification
		points = LineUtil._simplifyDP(points, sqTolerance)

		return points
	}

	// distance from a point to a segment between two points
	static pointToSegmentDistance(p, p1, p2) {
		return Math.sqrt(LineUtil._sqClosestPointOnSegment(p, p1, p2, true))
	}

	static closestPointOnSegment(p, p1, p2) {
		return LineUtil._sqClosestPointOnSegment(p, p1, p2)
	}

	// Douglas-Peucker simplification, see http://en.wikipedia.org/wiki/Douglas-Peucker_algorithm
	static _simplifyDP(points, sqTolerance) {

		let len = points.length,
		    ArrayConstructor = typeof Uint8Array !== undefined + '' ? Uint8Array : Array,
		    markers = new ArrayConstructor(len)

		markers[0] = markers[len - 1] = 1

		LineUtil._simplifyDPStep(points, markers, sqTolerance, 0, len - 1)

		let i,
		    newPoints = []

		for (i = 0; i < len; i++) {
			if (markers[i]) {
				newPoints.push(points[i])
			}
		}

		return newPoints
	}

	static _simplifyDPStep(points, markers, sqTolerance, first, last) {

		let maxSqDist = 0,
		    index, i, sqDist

		for (i = first + 1; i < last; i++) {
			sqDist = LineUtil._sqClosestPointOnSegment(points[i], points[first], points[last], true)

			if (sqDist > maxSqDist) {
				index = i
				maxSqDist = sqDist
			}
		}

		if (maxSqDist > sqTolerance) {
			markers[index] = 1

			LineUtil._simplifyDPStep(points, markers, sqTolerance, first, index)
			LineUtil._simplifyDPStep(points, markers, sqTolerance, index, last)
		}
	}

	// reduce points that are too close to each other to a single point
	static _reducePoints(points, sqTolerance) {
		let reducedPoints = [points[0]]

		let i, prev, len

		for (i = 1, prev = 0, len = points.length; i < len; i++) {
			if (this._sqDist(points[i], points[prev]) > sqTolerance) {
				reducedPoints.push(points[i])
				prev = i
			}
		}
		if (prev < len - 1) {
			reducedPoints.push(points[len - 1])
		}
		return reducedPoints
	}

	// Cohen-Sutherland line clipping algorithm.
	// Used to avoid rendering parts of a polyline that are not currently visible.

	static clipSegment(a, b, bounds, useLastCode, lastCode, round) {
		let _lastCode = 0
		let codeA = useLastCode ? lastCode : LineUtil._getBitCode(a, bounds),
		    codeB = LineUtil._getBitCode(b, bounds),

		    codeOut, p, newCode

		// save 2nd code to avoid calculating it on the next segment
		_lastCode = codeB

		while (true) {
			// if a,b is inside the clip window (trivial accept)
			if (!(codeA | codeB)) { return {segment: [a, b], lastCode: _lastCode} }

			// if a,b is outside the clip window (trivial reject)
			if (codeA & codeB) { return {segment: false, lastCode: _lastCode} }

			// other cases
			codeOut = codeA || codeB
			p = LineUtil._getEdgeIntersection(a, b, codeOut, bounds, round)
			newCode = LineUtil._getBitCode(p, bounds)

			if (codeOut === codeA) {
				a = p
				codeA = newCode
			} else {
				b = p
				codeB = newCode
			}
		}
	}

	static _getEdgeIntersection(a, b, code, bounds, round) {
		let dx = b.x - a.x,
		    dy = b.y - a.y,
		    min = bounds.min,
		    max = bounds.max,
		    x, y

		if (code & 8) { // top
			x = a.x + dx * (max.y - a.y) / dy
			y = max.y

		} else if (code & 4) { // bottom
			x = a.x + dx * (min.y - a.y) / dy
			y = min.y

		} else if (code & 2) { // right
			x = max.x
			y = a.y + dy * (max.x - a.x) / dx

		} else if (code & 1) { // left
			x = min.x
			y = a.y + dy * (min.x - a.x) / dx
		}

		return new Point(x, y, round)
	}

	static _getBitCode(p, bounds) {
		let code = 0

		if (p.x < bounds.min.x) { // left
			code |= 1
		} else if (p.x > bounds.max.x) { // right
			code |= 2
		}

		if (p.y < bounds.min.y) { // bottom
			code |= 4
		} else if (p.y > bounds.max.y) { // top
			code |= 8
		}

		return code
	}

	// square distance (to avoid unnecessary Math.sqrt calls)
	static _sqDist(p1, p2) {
		let dx = p2.x - p1.x,
		    dy = p2.y - p1.y
		return dx * dx + dy * dy
	}

	// return closest point on segment or distance to that point
	static _sqClosestPointOnSegment(p, p1, p2, sqDist) {
		let x = p1.x,
		    y = p1.y,
		    dx = p2.x - x,
		    dy = p2.y - y,
		    dot = dx * dx + dy * dy,
		    t

		if (dot > 0) {
			t = ((p.x - x) * dx + (p.y - y) * dy) / dot

			if (t > 1) {
				x = p2.x
				y = p2.y
			} else if (t > 0) {
				x += dx * t
				y += dy * t
			}
		}

		dx = p.x - x
		dy = p.y - y

		return sqDist ? dx * dx + dy * dy : new Point(x, y)
	}
}
