//import { Util } from '../../../src/core/Util';
"use strict";

describe("Projection", function () {

	let Util = null;

  before(function(done) {
    System
      .import('src/core/Util')
      .then(function(t) {
				Util = t.Util;
				done();
      })
      .catch(function(e) {
          console.log('>>> error loading class', e);
          done();
      });
  });

  after(function() {
    Util = null;
  });

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
    let goo, bar = null;

	  let foo = {},
	      a = {},
	      b = {},
	      c = {};

    beforeEach( function () {
      goo = {
        fn: function () {
          bar = 'bogon';
        }
      }

      sinon.spy(goo, 'fn');

		  let fn2 = Util.bind(goo.fn, foo, a, b);
		  fn2(c);
    })

		it('passes additional arguments to the bound function', function () {
			expect(goo.fn.calledWith(a, b, c)).to.be(true);
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
		it('splits words into an array', function () {
			expect(Util.splitWords('foo bar baz')).to.eql(['foo', 'bar', 'baz']);
		})
	})

})
