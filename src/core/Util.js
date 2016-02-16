/*
 * L.Util contains various utility functions used throughout Leaflet code.
 */

export class Util {

	// wrap the given number to lie within a certain range (used for wrapping longitude)
  static wrapNum(x, range, includeMax) {
		let max = range[1],
		    min = range[0],
		    d = max - min;
		return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
	}

}

