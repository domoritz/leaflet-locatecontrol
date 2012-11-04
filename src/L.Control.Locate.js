L.Control.Locate = L.Control.extend({
    options: {
        position: 'topleft',
        drawCircle: true,
        autoLocate: false,
        circleStyle: {
                color: '#136AEC',
                fillColor: '#136AEC',
                fillOpacity: 0.15,
                weight: 2,
                opacity: 0.4
            },
        markerStyle: {
                color: '#136AEC',
                fillColor: '#2A93EE',
                fillOpacity: 0.7,
                weight: 2,
                opacity: 0.9,
                radius: 3
            }
    },

    onAdd: function (map) {
        var className = 'leaflet-control-locate',
            container = L.DomUtil.create('div', className);

        var self = this;
        var _map = map;
        this._layer = new L.LayerGroup();
        this._layer.addTo(_map);

        var wrapper = L.DomUtil.create('div', className + "-wrap", container);
        var link = L.DomUtil.create('a', className, wrapper);
        link.href = '#';
        link.title = 'Locate me on the map';
        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', function(){ self.locate(_map); }, map)
            .on(link, 'dblclick', L.DomEvent.stopPropagation);

        var onLocationFound = function (e) {
            var radius = e.accuracy / 2;

            self._layer.clearLayers();

            if (self.options.drawCircle) {
                L.circle(e.latlng, radius, self.options.circleStyle)
                    .addTo(self._layer);
            }

            L.circleMarker(e.latlng, self.options.markerStyle)
                .bindPopup("You are within " + radius.toFixed(0) + " meters from this point")
                .addTo(self._layer);

            self._container.className += " active";
        };

        var onLocationError = function (e) {
            alert(e.message);
        };

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        if (this.options.autoLocate) {
            this.locate(map);
        }

        return container;
    },

    locate: function(map) {
        map.locate({setView: true, maxZoom: 16});
    }
});

L.Map.addInitHook(function () {
    if (this.options.locateControl) {
        this.locateControl = L.control.locate();
        this.addControl(this.locateControl);
    }
});

L.control.locate = function (options) {
    return new L.Control.Locate(options);
};
