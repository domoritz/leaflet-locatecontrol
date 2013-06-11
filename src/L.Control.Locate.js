L.Control.Locate = L.Control.extend({
    options: {
        position: 'topleft',
        drawCircle: true,
        follow: false,  // follow with zoom and pan the user's location
        stopFollowingOnDrag: false, // if follow is true, stop following when map is dragged
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
        // range circle while following
        followCircleStyle: {
            color: '#FFA500',
            fillColor: '#FFB000',
            fillOpacity: 0.15,
            weight: 2,
            opacity: 0.5
        },
        // inner marker while following
        followMarkerStyle: {
            color: '#FFA500',
            fillColor: '#FFB000',
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
        setView: true, // automatically sets the map view to the user's location
        locateOptions: {}
    },

    onAdd: function (map) {
        var className = 'leaflet-control-locate',
            classNames = className + ' leaflet-control-zoom leaflet-bar leaflet-control',
            container = L.DomUtil.create('div', classNames);

        var self = this;
        this._layer = new L.LayerGroup();
        this._layer.addTo(map);
        this._event = undefined;
        // nested extend so that the first can overwrite the second
        // and the second can overwrite the third
        this._locateOptions = L.extend(L.extend({
            'setView': false // have to set this to false because we have to
                             // do setView manually
        }, this.options.locateOptions), {
            'watch': true  // if you overwrite this, visualization cannot be updated
        });

        var link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
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
                if (self._active && (map.getBounds().contains(self._event.latlng) || !self.options.setView)) {
                    stopLocate();
                } else {
                    if (self.options.setView) {
                        self._locateOnNextLocationFound = true;
                    }
                    if(!self._active) {
                        map.locate(self._locateOptions);
                    }
                    self._active = true;
                    if (self.options.follow) {
                        startFollowing();
                    }
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

            self._active = true;

            if (self._event &&
                (self._event.latlng.lat != e.latlng.lat ||
                 self._event.latlng.lng != e.latlng.lng)) {
                _log('location has changed');
            }

            self._event = e;

            if (self.options.follow && self._following) {
                self._locateOnNextLocationFound = true;
            }

            visualizeLocation();
        };

        var startFollowing = function() {
            self._following = true;
            if (self.options.stopFollowingOnDrag) {
                map.on('dragstart', stopFollowing);
            }
        };

        var stopFollowing = function() {
            self._following = false;
            if (self.options.stopFollowingOnDrag) {
                map.off('dragstart', stopFollowing);
            }
            visualizeLocation();
        };

        var visualizeLocation = function() {
            _log('visualizeLocation,' + 'setView:' + self._locateOnNextLocationFound);

            var radius = self._event.accuracy / 2;

            if (self._locateOnNextLocationFound) {
                map.fitBounds(self._event.bounds);
                self._locateOnNextLocationFound = false;
            }

            self._layer.clearLayers();

            // circle with the radius of the location's accuracy
            if (self.options.drawCircle) {
                if (self._following) {
                    c = self.options.followCircleStyle;
                } else {
                    c = self.options.circleStyle;
                }

                L.circle(self._event.latlng, radius, c)
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

            if (self._following) {
                m = self.options.followMarkerStyle;
            } else {
                m = self.options.markerStyle;
            }

            L.circleMarker(self._event.latlng, m)
                .bindPopup(t[0] + distance + " " + unit  + t[1])
                .addTo(self._layer);

            if (!self._container)
                return;
            if (self._following) {
            	self._container.className = classNames + " active following";
            } else {
            	self._container.className = classNames + " active";
            }
        };

        var resetVariables = function() {
            self._active = false;
            self._locateOnNextLocationFound = true;
            self._following = false;
        };

        resetVariables();

        var stopLocate = function() {
            _log('stopLocate');
            map.stopLocate();
            map.off('dragstart', stopFollowing);

            self._container.className = classNames;
            resetVariables();

            self._layer.clearLayers();
        };


        var onLocationError = function (err) {
            _log('onLocationError');

            // ignore timeout error if the location is watched
            if (err.code==3 && this._locateOptions.watch) {
                return;
            }

            stopLocate();
            self.options.onLocationError(err);
        };

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
