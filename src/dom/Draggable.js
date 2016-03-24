import {Browser} from 'src/core/Browser'
import {Util} from 'src/core/Util'
import {Evented} from 'src/core/Events'
import {DomUtil} from 'src/dom/DomUtil'
import {DomEvent} from 'src/dom/DomEvent'

/*
 * Draggable allows you to add dragging capabilities to any element. Supports mobile devices too.
 */

export const	Dragged = {
		//START: Browser.touch ? ['touchstart', 'mousedown'] : ['mousedown'],
		START: ['touchstart', 'mousedown'],
		END: {
			mousedown: 'mouseup',
			touchstart: 'touchend',
			pointerdown: 'touchend',
			MSPointerDown: 'touchend'
		},
		MOVE: {
			mousedown: 'mousemove',
			touchstart: 'touchmove',
			pointerdown: 'touchmove',
			MSPointerDown: 'touchmove'
		}
	}

export class Draggable extends Evented {

	constructor(element, dragStartTarget, preventOutline) {
		super()

		this._element = element
		this._dragStartTarget = dragStartTarget || element
		this._preventOutline = preventOutline
	}

	enable() {
		if (this._enabled) { return; }

		DomEvent.on(this._dragStartTarget, Dragged.START.join(' '), this._onDown, this);

		this._enabled = true;
	}

	disable() {
		if (!this._enabled) { return; }

		DomEvent.off(this._dragStartTarget, Dragged.START.join(' '), this._onDown, this);

		this._enabled = false;
		this._moved = false;
	}

	_onDown(e) {
		this._moved = false;

		if (DomUtil.hasClass(this._element, 'leaflet-zoom-anim')) { return; }

		if (Draggable._dragging || e.shiftKey || ((e.which !== 1) && (e.button !== 1) && !e.touches) || !this._enabled) { return; }
		Draggable._dragging = true;  // Prevent dragging multiple objects at once.

		if (this._preventOutline) {
			DomUtil.preventOutline(this._element);
		}

		DomUtil.disableImageDrag();
		DomUtil.disableTextSelection();

		if (this._moving) { return; }

		this.fire('down');

		var first = e.touches ? e.touches[0] : e;

		this._startPoint = new Point(first.clientX, first.clientY);
		this._startPos = this._newPos = DomUtil.getPosition(this._element);

		DomEvent
		    .on(document, Draggable.MOVE[e.type], this._onMove, this)
		    .on(document, Draggable.END[e.type], this._onUp, this);
	}

	_onMove(e) {
		if (e.touches && e.touches.length > 1) {
			this._moved = true;
			return;
		}

		var first = (e.touches && e.touches.length === 1 ? e.touches[0] : e),
		    newPoint = new Point(first.clientX, first.clientY),
		    offset = new Point.subtract(this._startPoint);

		if (!offset.x && !offset.y) { return; }
		if (Browser.touch && Math.abs(offset.x) + Math.abs(offset.y) < 3) { return; }

		DomEvent.preventDefault(e);

		if (!this._moved) {
			this.fire('dragstart');

			this._moved = true;
			this._startPos = DomUtil.getPosition(this._element).subtract(offset);

			DomUtil.addClass(document.body, 'leaflet-dragging');

			this._lastTarget = e.target || e.srcElement;
			DomUtil.addClass(this._lastTarget, 'leaflet-drag-target');
		}

		this._newPos = this._startPos.add(offset);
		this._moving = true;

		Util.cancelAnimFrame(this._animRequest);
		this._lastEvent = e;
		this._animRequest = Util.requestAnimFrame(this._updatePosition, this, true);
	}

	_updatePosition() {
		var e = {originalEvent: this._lastEvent};
		this.fire('predrag', e);
		DomUtil.setPosition(this._element, this._newPos);
		this.fire('drag', e);
	}

	_onUp() {
		DomUtil.removeClass(document.body, 'leaflet-dragging');

		if (this._lastTarget) {
			DomUtil.removeClass(this._lastTarget, 'leaflet-drag-target');
			this._lastTarget = null;
		}

		for (var i in Draggable.MOVE) {
			DomEvent
			    .off(document, Dragged.MOVE[i], this._onMove, this)
			    .off(document, Dragged.END[i], this._onUp, this);
		}

		DomUtil.enableImageDrag();
		DomUtil.enableTextSelection();

		if (this._moved && this._moving) {
			// ensure drag is not fired after dragend
			Util.cancelAnimFrame(this._animRequest);

			this.fire('dragend', {
				distance: this._newPos.distanceTo(this._startPos)
			});
		}

		this._moving = false;
		Draggable._dragging = false;
	}
}
