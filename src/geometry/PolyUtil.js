/*
 * L.PolyUtil contains utility functions for polygons (clipping, etc.).
 */
import {LineUtil} from './LineUtil'

export class PolyUtil {

/*
 * Sutherland-Hodgeman polygon clipping algorithm.
 * Used to avoid rendering parts of a polygon that are not currently visible.
 */
	static clipPolygon(points, bounds, round) {
		let clippedPoints,
		edges = [1, 4, 2, 8],
		i, j, k,
		a, b,
		len, edge, p

		for (i = 0, len = points.length; i < len; i++) {
			points[i]._code = LineUtil._getBitCode(points[i], bounds)
		}

	  // for each edge (left, bottom, right, top)
		for (k = 0; k < 4; k++) {
			edge = edges[k]
			clippedPoints = []

			for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
				a = points[i]
				b = points[j]

				// if a is inside the clip window
				if (!(a._code & edge)) {
				// if b is outside the clip window (a->b goes out of screen)
					if (b._code & edge) {
						p = LineUtil._getEdgeIntersection(b, a, edge, bounds, round)
						p._code = LineUtil._getBitCode(p, bounds)
						clippedPoints.push(p)
					}
					clippedPoints.push(a)

					// else if b is inside the clip window (a->b enters the screen)
				} else if (!(b._code & edge)) {
					p = LineUtil._getEdgeIntersection(b, a, edge, bounds, round)
					p._code = LineUtil._getBitCode(p, bounds)
					clippedPoints.push(p)
				}
			}
			points = clippedPoints
		}
		return points
	}
}
