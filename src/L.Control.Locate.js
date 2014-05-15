/*
Copyright (c) 2014 Dominik Moritz

This file is part of the leaflet locate control. It is licensed under the MIT license.
You can find the project at: https://github.com/domoritz/leaflet-locatecontrol
*/


// MIT-licensed code by Benjamin Becquet
// https://github.com/bbecquet/Leaflet.PolylineDecorator
// 
// Note: This may become obsolete after https://github.com/Leaflet/Leaflet/pull/2362 gets merged.
L.RotatedMarker = L.Marker.extend({
  options: { angle: 0 },
  _setPos: function(pos) {
    L.Marker.prototype._setPos.call(this, pos);
    if (L.DomUtil.TRANSFORM) {
      // use the CSS transform rule if available
      this._icon.style[L.DomUtil.TRANSFORM] += ' rotate(' + this.options.angle + 'deg)';
    } else if (L.Browser.ie) {
      // fallback for IE6, IE7, IE8
      var rad = this.options.angle * L.LatLng.DEG_TO_RAD,
      costheta = Math.cos(rad),
      sintheta = Math.sin(rad);
      this._icon.style.filter += ' progid:DXImageTransform.Microsoft.Matrix(sizingMethod=\'auto expand\', M11=' +
        costheta + ', M12=' + (-sintheta) + ', M21=' + sintheta + ', M22=' + costheta + ')';
    }
  }
});
L.rotatedMarker = function(pos, options) {
    return new L.RotatedMarker(pos, options);
};


L.Control.Locate = L.Control.extend({
    options: {
        position: 'topleft',
        drawCircle: true,
        follow: false,  // follow with zoom and pan the user's location
        stopFollowingOnDrag: false, // if follow is true, stop following when map is dragged (deprecated)
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
            radius: 5
        },
        // changes to range circle and inner marker while following
        // it is only necessary to provide the things that should change
        followCircleStyle: {},
        followMarkerStyle: {
            //color: '#FFA500',
            //fillColor: '#FFB000'
        },
        icon: 'icon-location',  // icon-location or icon-direction
        iconLoading: 'icon-spinner animate-spin',
        circlePadding: [0, 0],
        metric: true,
        onLocationError: function(err) {
            // this event is called in case of any location error
            // that is not a time out error.
            alert(err.message);
        },
        onLocationOutsideMapBounds: function(control) {
            // this event is repeatedly called when the location changes
            control.stopLocate();
            alert(context.options.strings.outsideMapBoundsMsg);
        },
        setView: true, // automatically sets the map view to the user's location
        // keep the current map zoom level when displaying the user's location. (if 'false', use maxZoom)
        keepCurrentZoomLevel: false,
        strings: {
            title: "Show me where I am",
            popup: "You are within {distance} {unit} from this point",
            outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
        },
        enableCompass: false,
        compassOptions: { // Cordova-specific options
            frequency: 100 // [ms] how often the angle should be updated? 
            // filter: 3 // not supported on Android - don't set it! if it's set, watchHeading stops working on Android
        },
        compassMarkerStyle: {
            icon: L.divIcon({
                className: "icon-direction leaflet-control-locate-compass",
                iconSize: [24, 24]
            })
        },
        locateOptions: {
            maxZoom: Infinity,
            watch: true  // if you overwrite this, visualization cannot be updated
        }
    },

    onAdd: function (map) {
        var container = L.DomUtil.create('div',
            'leaflet-control-locate leaflet-bar leaflet-control');

        var self = this;
        this._layer = new L.LayerGroup();
        this._layer.addTo(map);
        this._event = undefined;

        this._locateOptions = this.options.locateOptions;
        L.extend(this._locateOptions, this.options.locateOptions, {
            setView: false // have to set this to false because we have to
                           // do setView manually
        });

        // extend the follow marker style and circle from the normal style
        this.options.followMarkerStyle = L.extend({}, this.options.markerStyle, this.options.followMarkerStyle);
        this.options.followCircleStyle = L.extend({}, this.options.circleStyle, this.options.followCircleStyle);

        var link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single ' + this.options.icon, container);
        link.href = '#';
        link.title = this.options.strings.title;

        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', function() {
                if (self._active && (self._event === undefined || map.getBounds().contains(self._event.latlng) || !self.options.setView ||
                    isOutsideMapBounds())) {
                    stopLocate();
                } else {
                    locate();
                }
            })
            .on(link, 'dblclick', L.DomEvent.stopPropagation);

        var locate = function () {
            if (self.options.setView) {
                self._locateOnNextLocationFound = true;
            }
            if(!self._active) {
                map.locate(self._locateOptions);
                if (self.options.enableCompass) {
                    startCompass();
                }
            }
            self._active = true;
            if (self.options.follow) {
                startFollowing();
            }
            if (!self._event) {
                setClasses('requesting');
            } else {
                visualizeLocation();
            }
        };

        var startCompass = function() {
            if (navigator.compass) { // cordova navigator.compass plugin
                var onCompassSuccess = function(heading) {
                    updateCompassHeading(heading.magneticHeading);
                };

                if (self._locateOptions.watch) {
                    self._compassWatchID = navigator.compass.watchHeading(onCompassSuccess, null, self.options.compassOptions);
                } else {
                    navigator.compass.getCurrentHeading(onCompassSuccess, null, self.options.compassOptions);
                }
            } else if(window.DeviceOrientationEvent) { // HTML5 deviceOrientation API
                self._deviceOrientationListener = window.addEventListener('deviceorientation', function(event) {
                  updateCompassHeading(event.alpha);
                });
            }
        };

        var stopCompass = function() {
            if (self._compassWatchID) {
                navigator.compass.clearWatch(self._compassWatchID);
            }
            if (self._deviceOrientationListener) {
                window.removeEventListener('deviceorientation', self._deviceOrientationListener);
            }
        };

        var onLocationFound = function (e) {
            // no need to do anything if the location has not changed
            if (self._event &&
                (self._event.latlng.lat === e.latlng.lat &&
                 self._event.latlng.lng === e.latlng.lng &&
                 self._event.accuracy === e.accuracy)) {
                return;
            }

            if (!self._active) {
                return;
            }

            self._event = e;

            if (self.options.follow && self._following) {
                self._locateOnNextLocationFound = true;
            }

            visualizeLocation();
        };

        var startFollowing = function() {
            map.fire('startfollowing', self);
            self._following = true;
            if (self.options.stopFollowingOnDrag) {
                map.on('dragstart', stopFollowing);
            }
        };

        var stopFollowing = function() {
            map.fire('stopfollowing', self);
            self._following = false;
            if (self.options.stopFollowingOnDrag) {
                map.off('dragstart', stopFollowing);
            }
            visualizeLocation();
        };

        var isOutsideMapBounds = function () {
            if (self._event === undefined)
                return false;
            return map.options.maxBounds &&
                !map.options.maxBounds.contains(self._event.latlng);
        };

        var visualizeLocation = function() {
            if (self._event.accuracy === undefined)
                self._event.accuracy = 0;

            var radius = self._event.accuracy;
            if (self._locateOnNextLocationFound) {
                if (isOutsideMapBounds()) {
                    self.options.onLocationOutsideMapBounds(self);
                } else {
                    map.fitBounds(self._event.bounds, {
                        padding: self.options.circlePadding,
                        maxZoom: self.options.keepCurrentZoomLevel ? map.getZoom() : self._locateOptions.maxZoom
                    });
                }
                self._locateOnNextLocationFound = false;
            }

            // circle with the radius of the location's accuracy
            var circleStyle, o;
            if (self.options.drawCircle) {
                if (self._following) {
                    circleStyle = self.options.followCircleStyle;
                } else {
                    circleStyle = self.options.circleStyle;
                }

                if (!self._outerMarker) {
                    self._outerMarker = L.circle(self._event.latlng, radius, circleStyle)
                        .addTo(self._layer);
                } else {
                    self._outerMarker.setLatLng(self._event.latlng).setRadius(radius);
                    for (o in circleStyle) {
                        self._outerMarker.options[o] = circleStyle[o];
                    }
                }
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
            var markerStyle;
            if (self._following) {
                markerStyle = self.options.followMarkerStyle;
            } else {
                markerStyle = self.options.markerStyle;
            }

            var t = self.options.strings.popup;
            if (!self._innerMarker) {
                if (self.options.compassOptions) {
                    self._innerMarker = L.rotatedMarker(self._event.latlng, self.options.compassMarkerStyle);
                } else {
                    self._innerMarker = L.circleMarker(self._event.latlng, markerStyle);
                }
                self._innerMarker
                    .bindPopup(L.Util.template(t, {distance: distance, unit: unit}))
                    .addTo(self._layer);
            } else {
                self._innerMarker.setLatLng(self._event.latlng)
                    .bindPopup(L.Util.template(t, {distance: distance, unit: unit}))
                    ._popup.setLatLng(self._event.latlng);
                for (o in markerStyle) {
                    self._innerMarker.options[o] = markerStyle[o];
                }
            }

            if (!self._container)
                return;
            if (self._following) {
                setClasses('following');
            } else {
                setClasses('active');
            }
        };

        var setClasses = function(state) {
            if (state == 'requesting') {
                L.DomUtil.removeClasses(self._container, "active following");
                L.DomUtil.addClasses(self._container, "requesting");

                L.DomUtil.removeClasses(link, self.options.icon);
                L.DomUtil.addClasses(link, self.options.iconLoading);
            } else if (state == 'active') {
                L.DomUtil.removeClasses(self._container, "requesting following");
                L.DomUtil.addClasses(self._container, "active");

                L.DomUtil.removeClasses(link, self.options.iconLoading);
                L.DomUtil.addClasses(link, self.options.icon);
            } else if (state == 'following') {
                L.DomUtil.removeClasses(self._container, "requesting");
                L.DomUtil.addClasses(self._container, "active following");

                L.DomUtil.removeClasses(link, self.options.iconLoading);
                L.DomUtil.addClasses(link, self.options.icon);
            }
        }

        var resetVariables = function() {
            self._active = false;
            self._locateOnNextLocationFound = self.options.setView;
            self._following = false;
        };

        resetVariables();

        var stopLocate = function() {
            map.stopLocate();
            stopCompass();
            map.off('dragstart', stopFollowing);
            if (self.options.follow && self._following) {
                stopFollowing();
            }

            L.DomUtil.removeClass(self._container, "requesting");
            L.DomUtil.removeClass(self._container, "active");
            L.DomUtil.removeClass(self._container, "following");
            resetVariables();

            self._layer.clearLayers();
            self._innerMarker = undefined;
            self._outerMarker = undefined;
        };

        var onLocationError = function (err) {
            // ignore time out error if the location is watched
            if (err.code == 3 && self._locateOptions.watch) {
                return;
            }

            stopLocate();
            self.options.onLocationError(err);
        };

        var updateCompassHeading = function(degrees) {
            if (self._innerMarker) {
                self._innerMarker.options.angle = degrees;
                self._innerMarker.update();
            }
        };

        // event hooks
        map.on('locationfound', onLocationFound, self);
        map.on('locationerror', onLocationError, self);

        // make locate functions available to outside world
        this.locate = locate;
        this.stopLocate = stopLocate;
        this.stopFollowing = stopFollowing;

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

(function(){
  // leaflet.js raises bug when trying to addClass / removeClass multiple classes at once
  // Let's create a wrapper on it which fixes it.
  var LDomUtilApplyClassesMethod = function(method, element, classNames) {
    classNames = classNames.split(' ');
    classNames.forEach(function(className) {
        L.DomUtil[method].call(this, element, className);
    });
  };

  L.DomUtil.addClasses = function(el, names) { LDomUtilApplyClassesMethod('addClass', el, names); }
  L.DomUtil.removeClasses = function(el, names) { LDomUtilApplyClassesMethod('removeClass', el, names); }
})();
