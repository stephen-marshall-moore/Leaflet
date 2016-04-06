import {LatLng} from 'src/geo/LatLng'
import {LatLngBounds} from 'src/geo/LatLngBounds'
import {ImageOverlay} from 'src/layer/ImageOverlay'

describe('ImageOverlay', function () {
	describe('#setStyle', function () {
		it('sets opacity', function () {
			let overlay = new ImageOverlay()
			overlay.style = {opacity: 0.5}
			expect(overlay.options.opacity).to.equal(0.5)
		})
	})
	describe('#setBounds', function () {
		it('sets bounds', function () {
			let bounds = new LatLngBounds(
				new LatLng(14, 12),
				new LatLng(30, 40));
			let overlay = new ImageOverlay()
			overlay.bounds = bounds
			expect(overlay._bounds).to.equal(bounds)
		})
	})
})
