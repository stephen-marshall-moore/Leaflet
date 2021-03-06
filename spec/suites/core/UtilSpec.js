"use strict"
import { Util } from 'src/core/Util'

describe("Projection", function () {

	describe('#bind', function () {
		it('returns the given function with the given context', function () {
			let fn = function () {
				return this;
			};

			let fn2 = Util.bind(fn, {foo: 'bar'});

			expect(fn2()).to.eql({foo: 'bar'});
		})
  })

	describe('#bind2', function () {
    let goo, bar = null

	  let foo = {},
	      a = {},
	      b = {},
	      c = {};

    beforeEach( function () {
      goo = {
        fn: function () {
          bar = 'bogon'
        }
      }

      sinon.spy(goo, 'fn')

		  let fn2 = Util.bind(goo.fn, foo, a, b)
		  fn2(c);
    })

		it('passes additional arguments to the bound function', function () {
			expect(goo.fn.calledWith(a, b, c)).to.be(true)
		})
	})

	describe('#stamp', function () {
		it('sets a unique id on the given object and returns it', function () {
			let a = {},
			    id = Util.stamp(a);

			expect(typeof id).to.eql('number');
			expect(Util.stamp(a)).to.eql(id);

			let b = {},
			    id2 = Util.stamp(b);

			expect(id2).not.to.eql(id);
		})
	})

	describe('#falseFn', function () {
		it('returns false', function () {
			expect(Util.falseFn()).to.be(false);
		})
	})

	describe('#splitWords', function () {
		let str = '  foo bar baz  '
		it('splits words into an array', function () {
			expect(Util.splitWords(str)).to.eql(['foo', 'bar', 'baz'])
		})
		it('using builtin splits words into an array', function () {
			expect(str.trim().split(' ')).to.eql(['foo', 'bar', 'baz']);
		})
	})

})
