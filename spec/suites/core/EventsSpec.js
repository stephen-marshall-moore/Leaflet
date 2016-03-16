"use strict"

import {Util} from 'src/core/Util'
import {Evented} from 'src/core/Events'

describe("Evented", function () {

	describe('#fire', function () {

		it('fires all listeners added through #addEventListener replaced by #on', function () {
			var obj = new Evented(),
			    spy1 = sinon.spy(),
			    spy2 = sinon.spy(),
			    spy3 = sinon.spy(),
			    spy4 = sinon.spy(),
			    spy5 = sinon.spy(),
			    spy6 = sinon.spy()

			obj.on('test', spy1)
			obj.on('test', spy2)
			obj.on('other', spy3)
			obj.on({test: spy4, other: spy5})
			// obj.on({'test other': spy6 })

			expect(spy1.called).to.be(false)
			expect(spy2.called).to.be(false)
			expect(spy3.called).to.be(false)
			expect(spy4.called).to.be(false)
			expect(spy5.called).to.be(false)
			// expect(spy6.called).to.be(false)

			obj.fire('test')

			expect(spy1.called).to.be(true)
			expect(spy2.called).to.be(true)
			expect(spy3.called).to.be(false)
			expect(spy4.called).to.be(true)
			expect(spy5.called).to.be(false)
			// expect(spy6.called).to.be(true)
			// expect(spy6.callCount).to.be(1)
		})

		it('provides event object to listeners and executes them in the right context', function () {
			var obj = new Evented(),
			    obj2 = new Evented(),
			    obj3 = new Evented(),
			    obj4 = new Evented(),
			    foo = {}

			function listener1(e) {
				expect(e.type).to.eql('test')
				expect(e.target).to.eql(obj)
				expect(this).to.eql(obj)
				expect(e.baz).to.eql(1)
			}

			function listener2(e) {
				expect(e.type).to.eql('test')
				expect(e.target).to.eql(obj2)
				expect(this).to.eql(foo)
				expect(e.baz).to.eql(2)
			}

			function listener3(e) {
				expect(e.type).to.eql('test')
				expect(e.target).to.eql(obj3)
				expect(this).to.eql(obj3)
				expect(e.baz).to.eql(3)
			}

			function listener4(e) {
				expect(e.type).to.eql('test')
				expect(e.target).to.eql(obj4)
				expect(this).to.eql(foo)
				expect(e.baz).to.eql(4)
			}

			obj.on('test', listener1)
			obj2.on('test', listener2, foo)
			obj3.on({test: listener3})
			obj4.on({test: listener4}, foo)

			obj.fire('test', {baz: 1})
			obj2.fire('test', {baz: 2})
			obj3.fire('test', {baz: 3})
			obj4.fire('test', {baz: 4})
		})

		it('calls no listeners removed through #off', function () {
			var obj = new Evented(),
			    spy = sinon.spy(),
			    spy2 = sinon.spy(),
			    spy3 = sinon.spy(),
			    spy4 = sinon.spy(),
			    spy5 = sinon.spy()

			obj.on('test', spy)
			obj.off('test', spy)

			obj.fire('test')

			expect(spy.called).to.be(false)

			obj.on('test2', spy2)
			obj.on('test2', spy3)
			obj.off('test2')

			obj.fire('test2')

			expect(spy2.called).to.be(false)
			expect(spy3.called).to.be(false)

			obj.on('test3', spy4)
			obj.on('test4', spy5)
			obj.off({
				test3: spy4,
				test4: spy5
			})

			obj.fire('test3')
			obj.fire('test4')

			expect(spy4.called).to.be(false)
			expect(spy5.called).to.be(false)
		})

		it('can handle calls to #off on objects with no registered event listeners', function () {
			var obj = new Evented()
			var removeNonExistentListener = function () {
				obj.off('test')
			}
			expect(removeNonExistentListener).to.not.throwException()
		})

		// added due to context-sensitive removeListener optimization
		it('fires multiple listeners with the same context with id', function () {
			var obj = new Evented(),
			    spy1 = sinon.spy(),
			    spy2 = sinon.spy(),
			    foo = {}

			Util.stamp(foo)

			obj.on('test', spy1, foo)
			obj.on('test', spy2, foo)

			obj.fire('test')

			expect(spy1.called).to.be(true)
			expect(spy2.called).to.be(true)
		})

		it('removes listeners with stamped contexts', function () {
			var obj = new Evented(),
			    spy1 = sinon.spy(),
			    spy2 = sinon.spy(),
			    foo = {}

			Util.stamp(foo)

			obj.on('test', spy1, foo)
			obj.on('test', spy2, foo)

			obj.off('test', spy1, foo)

			obj.fire('test')

			expect(spy1.called).to.be(false)
			expect(spy2.called).to.be(true)
		})

		it('removes listeners with a stamp originally added without one', function () {
			var obj = new Evented(),
			    spy1 = sinon.spy(),
			    spy2 = sinon.spy(),
			    foo = {}

			obj.on('test', spy1, foo)
			Util.stamp(foo)
			obj.on('test', spy2, foo)

			obj.off('test', spy1, foo)
			obj.off('test', spy2, foo)

			obj.fire('test')

			expect(spy1.called).to.be(false)
			expect(spy2.called).to.be(false)
		})

		it('removes listeners with context == this and a stamp originally added without one', function () {
			var obj = new Evented(),
			    obj2 = new Evented(),
			    spy1 = sinon.spy(),
			    spy2 = sinon.spy(),
			    spy3 = sinon.spy()

			obj.on('test', spy1, obj)
			Util.stamp(obj)
			obj.on('test', spy2, obj)
			obj.on('test', spy3, obj2) // So that there is a contextId based listener, otherwise off will do correct behaviour anyway

			obj.off('test', spy1, obj)
			obj.off('test', spy2, obj)
			obj.off('test', spy3, obj2)

			obj.fire('test')

			expect(spy1.called).to.be(false)
			expect(spy2.called).to.be(false)
			expect(spy3.called).to.be(false)
		})

		it('doesnt lose track of listeners when removing non existent ones', function () {
			var obj = new Evented(),
			    spy = sinon.spy(),
			    spy2 = sinon.spy(),
			    foo = {},
			    foo2 = {}

			Util.stamp(foo)
			Util.stamp(foo2)

			obj.on('test', spy, foo2)

			obj.off('test', spy, foo) // Decrements test_idx to 0, even though event listener isn't registered with foo's _leaflet_id
			obj.off('test', spy, foo2)  // Doesn't get removed

			obj.on('test', spy2, foo)

			obj.fire('test')

			expect(spy.called).to.be(false)
		})

		it('correctly removes all listeners if given no fn', function () {
			var obj = new Evented(),
			    spy = sinon.spy(),
			    foo = {},
			    foo2 = {},
			    foo3 = {}

			obj.on('test', spy, foo2)
			obj.on('test', spy, foo3)

			obj.off('test') // Removes both of the above listeners

			expect(obj.listens('test')).to.be(false)

			// Add and remove a listener
			obj.on('test', spy, foo2)
			obj.off('test', spy, foo2)

			expect(obj.listens('test')).to.be(false)
		})

		it('makes sure an event is not triggered if a listener is removed during dispatch', function () {
			var obj = new Evented(),
			    spy = sinon.spy()

			obj.on('test', function () { obj.off('test', spy) })
			obj.on('test', spy)
			obj.fire('test')

			expect(spy.called).to.be(false)
		})
	})

	describe('#on, #off & #fire', function () {

		it('works like #on && #off', function () {
			var obj = new Evented(),
			    spy = sinon.spy()

			obj.on('test', spy)
			obj.fire('test')

			expect(spy.called).to.be(true)

			obj.off('test', spy)
			obj.fire('test')

			expect(spy.callCount).to.be.lessThan(2)
		})

		it('does not override existing methods with the same name', function () {
			var spy1 = sinon.spy(),
			    spy2 = sinon.spy(),
			    spy3 = sinon.spy()

			class Klass extends Evented {
				constructor() {
					super()
				}

				on () {
					spy1()
				}

				off () {
					return spy2()
				}

				fire () {
					return spy3()
				}
			}

			var obj = new Klass()

			obj.on()
			expect(spy1.called).to.be(true)

			obj.off()
			expect(spy2.called).to.be(true)

			obj.fire()
			expect(spy3.called).to.be(true)
		})
	})

	describe("#clearEventListeners", function () {
		it("clears all registered listeners on an object", function () {
			var spy = sinon.spy(),
			    obj = new Evented(),
			    otherObj = new Evented()

			obj.on('test', spy, obj)
			obj.on('testTwo', spy)
			obj.on('test', spy, otherObj)
			obj.off()

			obj.fire('test')

			expect(spy.called).to.be(false)
		})
	})

	describe('#once', function () {
		it('removes event listeners after first trigger', function () {
			var obj = new Evented(),
			    spy = sinon.spy()

			obj.once('test', spy, obj)
			obj.fire('test')

			expect(spy.called).to.be(true)

			obj.fire('test')

			expect(spy.callCount).to.be.lessThan(2)
		})

		it('works with an object hash', function () {
			var obj = new Evented(),
			    spy = sinon.spy(),
			    otherSpy = sinon.spy()

			obj.once({
				'test': spy,
				otherTest: otherSpy
			}, obj)

			obj.fire('test')
			obj.fire('otherTest')

			expect(spy.called).to.be(true)
			expect(otherSpy.called).to.be(true)

			obj.fire('test')
			obj.fire('otherTest')

			expect(spy.callCount).to.be.lessThan(2)
			expect(otherSpy.callCount).to.be.lessThan(2)
		})

		it("doesn't call listeners to events that have been removed", function () {
			var obj = new Evented(),
			    spy = sinon.spy()

			obj.once('test', spy, obj)
			obj.off('test', spy, obj)

			obj.fire('test')

			expect(spy.called).to.be(false)
		})

		it('works if called from a context that doesnt implement #Events', function () {
			var obj = new Evented(),
			    spy = sinon.spy(),
			    foo = {}

			obj.once('test', spy, foo)

			obj.fire('test')

			expect(spy.called).to.be(true)
		})
	})

	describe('addEventParent && removeEventParent', function () {
		it('makes the object propagate events with to the given one if fired with propagate=true', function () {
			var obj = new Evented(),
			    parent1 = new Evented(),
			    parent2 = new Evented(),
			    spy1 = sinon.spy(),
			    spy2 = sinon.spy()

			parent1.on('test', spy1)
			parent2.on('test', spy2)

			obj.addEventParent(parent1).addEventParent(parent2)

			obj.fire('test')

			expect(spy1.called).to.be(false)
			expect(spy2.called).to.be(false)

			obj.fire('test', null, true)

			expect(spy1.called).to.be(true)
			expect(spy2.called).to.be(true)

			obj.removeEventParent(parent1)

			obj.fire('test', null, true)

			expect(spy1.callCount).to.be(1)
			expect(spy2.callCount).to.be(2)
		})
	})
})
