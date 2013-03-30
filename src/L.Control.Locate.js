L.Control.Locate = L.Control.extend({
    options: {
        position: 'topleft',
        drawCircle: true,
        follow: false,  // follow with zoom and pan the user's location
        // range circle
        circleStyle: {
                color: '#136AEC',
                fillColor: '#136AEC',
                fillOpacity: 0.15,
                weight: 2,
                opacity: 0.5
            },
        // inner marker
        markerStyle: {
            color: '#136AEC',
            fillColor: '#2A93EE',
            fillOpacity: 0.7,
            weight: 2,
            opacity: 0.9,
            radius: 4
        },
        metric: true,
        debug: false,
        onLocationError: function(err) {
            alert(err.message);
        },
        title: "Show me where I am",
        popupText: ["You are within ", " from this point"],
        locateOptions: {}
    },

    onAdd: function (map) {
        var className = 'leaflet-control-locate',
            classNames = className + ' leaflet-bar leaflet-control',
            container = L.DomUtil.create('div', classNames);

        var self = this;
        var _map = map;
        this._layer = new L.LayerGroup();
        this._layer.addTo(_map);
        this._event = undefined;
        this._locateOptions = L.extend({
            'setView': false,
            'watch': true
        }, this.options.locateOptions);
        this._locateOnNextLocationFound = true;
        this._atLocation = false;
        this._active = false;

        var link = L.DomUtil.create('a', 'leaflet-bar-part', container);
        link.href = '#';
        link.title = this.options.title;

        var _log = function(data) {
            if (self.options.debug) {
                console.log(data);
            }
        };

        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', function() {
                _log('at location: ' + self._atLocation);
                if (self._atLocation && self._active) {
                    map.stopLocate();
                    removeVisualization();
                } else {
                    if(!self._active) {
                        map.locate(self._locateOptions);
                    }
                    self._active = true;
                    self._locateOnNextLocationFound = true;
                    if (!self._event) {
                        self._container.className = classNames + " requesting";
                    } else {
                        visualizeLocation();
                    }
                }
            })
            .on(link, 'dblclick', L.DomEvent.stopPropagation);

        var onLocationFound = function (e) {
            _log('onLocationFound');

            if (self._event &&
                (self._event.latlng.lat != e.latlng.lat ||
                 self._event.latlng.lng != e.latlng.lng)) {
                _log('location has changed');
                self._atLocation = false;
            }

            self._event = e;

            if (!self._active) {
                return;
            }

            if (self.options.follow) {
                self._locateOnNextLocationFound = true;
            }

            visualizeLocation();
        };

        var visualizeLocation = function() {
            _log('visualizeLocation,' + 'setView:' + self._locateOnNextLocationFound);

            var radius = self._event.accuracy / 2;

            if (self._locateOnNextLocationFound) {
                self._map.fitBounds(self._event.bounds);
                self._atLocation = true;
                self._locateOnNextLocationFound = false;
            }

            self._layer.clearLayers();

            // curcle with the radius of the location's accuracy
            if (self.options.drawCircle) {
                L.circle(self._event.latlng, radius, self.options.circleStyle)
                    .addTo(self._layer);
            }

            var distance, unit;
            if (self.options.metric) {
                distance = radius.toFixed(0);
                unit = "meters";
            } else {
                distance = (radius * 3.2808399).toFixed(0);
                unit = "feet";
            }

            // small inner marker
            var t = self.options.popupText;
            L.circleMarker(self._event.latlng, self.options.markerStyle)
                .bindPopup(t[0] + distance + " " + unit  + t[1])
                .addTo(self._layer);

            if (!self._container)
                return;
            self._container.className = classNames + " active";
        };

        var removeVisualization = function() {
            self._container.className = classNames;
            self._active = false;

            self._layer.clearLayers();
        };

        var onLocationError = function (err) {
            _log('onLocationError');

            // ignore timeout error if the location is watched
            if (err.code==3 && this.options.locateOptions.watch) {
                return;
            }

            self._container.className = classNames;

            map.stopLocate();
            removeVisualization();
            self.options.onLocationError(err);
        };

        map.on('movestart', function() {
            self._atLocation = false;
        });

        // event hooks
        map.on('locationfound', onLocationFound, self);
        map.on('locationerror', onLocationError, self);

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
