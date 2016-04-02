/*
 * L.Util contains various utility functions used throughout Leaflet code.
 */

export class Util {

	constructor() {
	}

	// extend an object with properties of one or more other objects
	static extend(dest) {
		let i, j, len, src;

		for (j = 1, len = arguments.length; j < len; j++) {
			src = arguments[j];
			for (i in src) {
				dest[i] = src[i];
			}
		}
		return dest;
	}

	// return unique ID of an object
	static stamp(obj) {
		/*eslint-disable */
		obj._leaflet_id = obj._leaflet_id || ++Util._lastId;
		return obj._leaflet_id;
		/*eslint-enable */
	}

	// wrap the given number to lie within a certain range (used for wrapping longitude)
	static wrapNum(x, range, includeMax) {
		let max = range[1],
		    min = range[0],
		    d = max - min;
		return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
	}

	// do nothing (used as a noop throughout the code)
	static falseFn() { return false; }

	// trim whitespace from both sides of a string
	static trim(str) {
		return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
	}

	// split a string into words
	static splitWords(str) {
		return Util.trim(str).split(/\s+/);
	}

	// bind a function to be called with a given context
	static bind(fn, obj) {
		let slice = Array.prototype.slice;

		if (fn.bind) {
			return fn.bind.apply(fn, slice.call(arguments, 1));
		}

		let args = slice.call(arguments, 2);

		return function () {
			return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
		};
	}

	// return a function that won't be called more often than the given interval
	static throttle(fn, time, context) {
		var lock, args, wrapperFn, later

		later = function () {
			// reset lock and call if queued
			lock = false
			if (args) {
				wrapperFn.apply(context, args)
				args = false
			}
		}

		wrapperFn = function () {
			if (lock) {
				// called too soon, queue to call later
				args = arguments
			} else {
				// call and lock until later
				fn.apply(context, arguments)
				setTimeout(later, time)
				lock = true
			}
		}

		return wrapperFn
	}

	// counting on polyfill??

	static requestAnimFrame(callback) {
		//console.log(callback.toString())
		return window.requestAnimationFrame(callback)
	}

	static cancelAnimFrame(id) {
		window.cancelAnimationFrame(id)
	}

}


Util._lastId = 0;

