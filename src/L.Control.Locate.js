L.Control.Locate = L.Control.extend({
    options: {
        position: 'topleft',
        drawCircle: true,
        autoLocate: false,
        follow: false,
        circleStyle: {
                color: '#136AEC',
                fillColor: '#136AEC',
                fillOpacity: 0.15,
                weight: 2,
                opacity: 0.5
            },
        markerStyle: {
                color: '#136AEC',
                fillColor: '#2A93EE',
                fillOpacity: 0.7,
                weight: 2,
                opacity: 0.9,
                radius: 4
            },
        locateOptions: {
            setView: true,
            maxZoom: 16,
            watch: true
        }
    },

    onAdd: function (map) {
        var className = 'leaflet-control-locate',
            classNames = className + " leaflet-control",
            container = L.DomUtil.create('div', className);

        var self = this;
        var _map = map;
        this._layer = new L.LayerGroup();
        this._layer.addTo(_map);
        this._following = false;

        var wrapper = L.DomUtil.create('div', className + "-wrap", container);
        var link = L.DomUtil.create('a', className, wrapper);
        link.href = '#';
        link.title = 'Show me where I am';
        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', function(){
                if (!self._following) {
                    map.locate(self.options.locateOptions);
                } else {
                    map.stopLocate();
                    self._following = false;
                    self._container.className = classNames;
                }
            })
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

            if (self.options.locateOptions.watch) {
                if (!self.options.follow && !self._following) {
                    var options = jQuery.extend({},self.options.locateOptions);
                    options['setView'] = false;
                    self._following = true;
                    _map.locate(options);
                }
                self._following = true;
                if (!self._container)
                    return;
                self._container.className = classNames + " active";
            }
        };

        var onLocationError = function (e) {
            alert(e.message);
        };

        map.on('locationfound', onLocationFound);
        map.on('locationerror', onLocationError);

        if (this.options.autoLocate) {
            map.locate(self.options.locateOptions);
        }

        return container;
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
