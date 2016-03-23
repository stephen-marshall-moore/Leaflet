import {Browser} from 'src/core/Browser'
import {Map} from 'src/map/Map'
import {TileLayer} from 'src/layer/tile/TileLayer'

export function makemap(container) {
	Browser.any3d = false

	let map = new Map(container, {center: [51.505, -0.09], zoom: 13})

	let tiles = new TileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		})
	tiles.addTo(map)
	tiles.on("load",function() { tiles.bringToFront(); tiles.setOpacity(1); console.log("all visible tiles have been loaded") })

	return map
}
