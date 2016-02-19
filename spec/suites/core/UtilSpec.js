import { Util } from '../../../src/core/Util';

describe('Util', () => {

	describe('#bind', () => {
		it('returns the given function with the given context', () => {
			let fn = function () {
				return this;
			};

			let fn2 = Util.bind(fn, {foo: 'bar'});

			expect(fn2()).toEqual({foo: 'bar'});
		})
  })

	describe('#bind2', () => {
    let goo, bar = null;

	  let foo = {},
	      a = {},
	      b = {},
	      c = {};

    beforeEach( () => {
      goo = {
        fn: function () {
          bar = 'bogon';
        }
      }

      spyOn(goo, 'fn');

		  let fn2 = Util.bind(goo.fn, foo, a, b);
		  fn2(c);
    })

		it('passes additional arguments to the bound function', () => {

			expect(goo.fn).toHaveBeenCalledWith(a, b, c);
		})
	})

	describe('#stamp', () => {
		it('sets a unique id on the given object and returns it', () => {
			let a = {},
			    id = Util.stamp(a);

			expect(typeof id).toEqual('number');
			expect(Util.stamp(a)).toEqual(id);

			let b = {},
			    id2 = Util.stamp(b);

			expect(id2).not.toEqual(id);
		})
	})

	describe('#falseFn', () => {
		it('returns false', () => {
			expect(Util.falseFn()).toBe(false);
		})
	})

	describe('#splitWords', () => {
		it('splits words into an array', () => {
			expect(Util.splitWords('foo bar baz')).toEqual(['foo', 'bar', 'baz']);
		})
	})

})
