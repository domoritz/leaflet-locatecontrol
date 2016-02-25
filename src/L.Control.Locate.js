/*!
Copyright (c) 2016 Dominik Moritz

This file is part of the leaflet locate control. It is licensed under the MIT license.
You can find the project at: https://github.com/domoritz/leaflet-locatecontrol
*/
(function (factory, window) {
     // see https://github.com/Leaflet/Leaflet/blob/master/PLUGIN-GUIDE.md#module-loaders
     // for details on how to structure a leaflet plugin.

    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);

    // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        if (typeof window !== 'undefined' && window.L) {
            module.exports = factory(L);
        } else {
            module.exports = factory(require('leaflet'));
        }
    }

    // attach your plugin to the global 'L' variable
    if(typeof window !== 'undefined' && window.L){
        window.L.Locate = factory(L);
    }

} (function (L) {
    L.Control.Locate = L.Control.extend({
        options: {
            position: 'topleft',
            layer: undefined,  // use your own layer for the location marker
            drawCircle: true,
            follow: false,  // follow with zoom and pan the user's location
            stopFollowingOnDrag: false, // if follow is true, stop following when map is dragged (deprecated)
            // if true locate control remains active on click even if the user's location is in view.
            // clicking control will just pan to location
            remainActive: false,
            markerClass: L.circleMarker, // L.circleMarker or L.marker
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
            icon: 'fa fa-map-marker',  // fa-location-arrow or fa-map-marker
            iconLoading: 'fa fa-spinner fa-spin',
            iconElementTag: 'span', // span or i
            circlePadding: [0, 0],
            metric: true,
            onLocationError: function(err) {
                // this event is called in case of any location error
                // that is not a time out error.
                alert(err.message);
            },
            onLocationOutsideMapBounds: function(control) {
                // this event is repeatedly called when the location changes
                control.stop();
                alert(control.options.strings.outsideMapBoundsMsg);
            },
            setView: true, // automatically sets the map view to the user's location
            // keep the current map zoom level when displaying the user's location. (if 'false', use maxZoom)
            keepCurrentZoomLevel: false,
            showPopup: true, // display a popup when the user click on the inner marker
            strings: {
                title: "Show me where I am",
                metersUnit: "meters",
                feetUnit: "feet",
                popup: "You are within {distance} {unit} from this point",
                outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
            },
            locateOptions: {
                maxZoom: Infinity,
                watch: true  // if you overwrite this, visualization cannot be updated
            }
        },

        initialize: function (options) {
            L.Map.addInitHook(function () {
                if (this.options.locateControl) {
                    this.addControl(this);
                }
            });

            for (var i in options) {
                if (typeof this.options[i] === 'object') {
                    L.extend(this.options[i], options[i]);
                } else {
                    this.options[i] = options[i];
                }
            }

            L.extend(this.options.locateOptions, {
                setView: false // have to set this to false because we have to
                               // do setView manually
            });
        },

        /**
         * This method launches the location engine.
         * It is called before the marker is updated,
         * event if it does not mean that the event will be ready.
         *
         * Override it if you want to add more functionalities.
         * It should set the this._active to true and do nothing if
         * this._active is not true.
         */
        _activate: function() {
            if (this.options.setView) {
                this._locateOnNextLocationFound = true;
            }

            if(!this._active) {
                this._map.locate(this.options.locateOptions);
            }
            this._active = true;

            if (this.options.follow) {
                this._startFollowing(this._map);
            }
        },

        /**
         * Called to stop the location engine.
         *
         * Override it to shutdown any functionalities you added on start.
         */
        _deactivate: function() {
            this._map.stopLocate();

            this._map.off('dragstart', this._stopFollowing, this);
            if (this.options.follow && this._following) {
                this._stopFollowing(this._map);
            }
        },

        /**
         * Draw the resulting marker on the map.
         *
         * Uses the event retrieved from onLocationFound from the map.
         */
        drawMarker: function(map) {
            if (this._event.accuracy === undefined) {
                this._event.accuracy = 0;
            }

            var radius = this._event.accuracy;
            if (this._locateOnNextLocationFound) {
                if (this._isOutsideMapBounds()) {
                    this.options.onLocationOutsideMapBounds(this);
                } else {
                    // If accuracy info isn't desired, keep the current zoom level
                    if(this.options.keepCurrentZoomLevel) {
                        map.panTo([this._event.latitude, this._event.longitude]);
                    } else {
                        map.fitBounds(this._event.bounds, {
                            padding: this.options.circlePadding,
                            maxZoom: this.options.keepCurrentZoomLevel ?
                            map.getZoom() : this.options.locateOptions.maxZoom
                        });
                    }
                }
                this._locateOnNextLocationFound = false;
            }

            // circle with the radius of the location's accuracy
            var style, o;
            if (this.options.drawCircle) {
                if (this._following) {
                    style = this.options.followCircleStyle;
                } else {
                    style = this.options.circleStyle;
                }

                if (!this._circle) {
                    this._circle = L.circle(this._event.latlng, radius, style)
                    .addTo(this._layer);
                } else {
                    this._circle.setLatLng(this._event.latlng).setRadius(radius);
                    for (o in style) {
                        this._circle.options[o] = style[o];
                    }
                }
            }

            var distance, unit;
            if (this.options.metric) {
                distance = radius.toFixed(0);
                unit =  this.options.strings.metersUnit;
            } else {
                distance = (radius * 3.2808399).toFixed(0);
                unit = this.options.strings.feetUnit;
            }

            // small inner marker
            var mStyle;
            if (this._following) {
                mStyle = this.options.followMarkerStyle;
            } else {
                mStyle = this.options.markerStyle;
            }

            if (!this._marker) {
                this._marker = this.createMarker(this._event.latlng, mStyle)
                .addTo(this._layer);
            } else {
                this.updateMarker(this._event.latlng, mStyle);
            }

            var t = this.options.strings.popup;
            if (this.options.showPopup && t) {
                this._marker.bindPopup(L.Util.template(t, {distance: distance, unit: unit}))
                ._popup.setLatLng(this._event.latlng);
            }

            this._toggleContainerStyle();
        },

        /**
         * Creates the marker.
         *
         * Should return the base marker so it is possible to bind a pop-up if the
         * option is activated.
         *
         * Used by drawMarker, you can ignore it if you have overridden it.
         */
        createMarker: function(latlng, mStyle) {
            return this.options.markerClass(latlng, mStyle);
        },

        /**
         * Updates the marker with current coordinates.
         *
         * Used by drawMarker, you can ignore it if you have overridden it.
         */
        updateMarker: function(latlng, mStyle) {
            this._marker.setLatLng(latlng);
            for (var o in mStyle) {
                this._marker.options[o] = mStyle[o];
            }
        },

        /**
         * Remove the marker from map.
         */
        removeMarker: function() {
            this._layer.clearLayers();
            this._marker = undefined;
            this._circle = undefined;
        },

        onAdd: function (map) {
            var container = L.DomUtil.create('div',
                'leaflet-control-locate leaflet-bar leaflet-control');

            this._layer = this.options.layer || new L.LayerGroup();
            this._layer.addTo(map);
            this._event = undefined;

            // extend the follow marker style and circle from the normal style
            var tmp = {};
            L.extend(tmp, this.options.markerStyle, this.options.followMarkerStyle);
            this.options.followMarkerStyle = tmp;
            tmp = {};
            L.extend(tmp, this.options.circleStyle, this.options.followCircleStyle);
            this.options.followCircleStyle = tmp;

            this._link = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', container);
            this._link.href = '#';
            this._link.title = this.options.strings.title;
            this._icon = L.DomUtil.create(this.options.iconElementTag, this.options.icon, this._link);

            L.DomEvent
                .on(this._link, 'click', L.DomEvent.stopPropagation)
                .on(this._link, 'click', L.DomEvent.preventDefault)
                .on(this._link, 'click', function() {
                    var shouldStop = (this._event === undefined ||
                        this._map.getBounds().contains(this._event.latlng) ||
                        !this.options.setView || this._isOutsideMapBounds());
                    if (!this.options.remainActive && (this._active && shouldStop)) {
                        this.stop();
                    } else {
                        this.start();
                    }
                }, this)
                .on(this._link, 'dblclick', L.DomEvent.stopPropagation);

            this._resetVariables();
            this.bindEvents(map);

            return container;
        },

        /**
         * Binds the actions to the map events.
         */
        bindEvents: function(map) {
            map.on('locationfound', this._onLocationFound, this);
            map.on('locationerror', this._onLocationError, this);
            map.on('unload', this.stop, this);
        },

        /**
         * Starts the plugin:
         * - activates the engine
         * - draws the marker (if coordinates available)
         */
        start: function() {
            this._activate();

            if (!this._event) {
                this._setClasses('requesting');
            } else {
                this.drawMarker(this._map);
            }
        },

        /**
         * Stops the plugin:
         * - deactivates the engine
         * - reinitializes the button
         * - removes the marker
         */
        stop: function() {
            this._deactivate();

            this._cleanClasses();
            this._resetVariables();

            this.removeMarker();
        },

        /**
         * Calls deactivate and dispatches an error.
         */
        _onLocationError: function(err) {
            // ignore time out error if the location is watched
            if (err.code == 3 && this.options.locateOptions.watch) {
                return;
            }

            this.stop();
            this.options.onLocationError(err);
        },

        /**
         * Stores the received event and updates the marker.
         */
        _onLocationFound: function(e) {
            // no need to do anything if the location has not changed
            if (this._event &&
                (this._event.latlng.lat === e.latlng.lat &&
                 this._event.latlng.lng === e.latlng.lng &&
                     this._event.accuracy === e.accuracy)) {
                return;
            }

            if (!this._active) {
                return;
            }

            this._event = e;

            if (this.options.follow && this._following) {
                this._locateOnNextLocationFound = true;
            }

            this.drawMarker(this._map);
        },

        /**
         * Dispatches the 'startfollowing' event on map.
         */
        _startFollowing: function() {
            this._map.fire('startfollowing', this);
            this._following = true;
            if (this.options.stopFollowingOnDrag) {
                this._map.on('dragstart', this._stopFollowing, this);
            }
        },

        /**
         * Dispatches the 'stopfollowing' event on map.
         */
        _stopFollowing: function() {
            this._map.fire('stopfollowing', this);
            this._following = false;
            if (this.options.stopFollowingOnDrag) {
                this._map.off('dragstart', this._stopFollowing, this);
            }
            this._toggleContainerStyle();
        },

        /**
         * Check if location is in map bounds
         */
        _isOutsideMapBounds: function() {
            if (this._event === undefined)
                return false;
            return this._map.options.maxBounds &&
                !this._map.options.maxBounds.contains(this._event.latlng);
        },

        /**
         * Toggles button class between following and active.
         */
        _toggleContainerStyle: function() {
            if (!this._container) {
                return;
            }

            if (this._following) {
                this._setClasses('following');
            } else {
                this._setClasses('active');
            }
        },

        /**
         * Sets the CSS classes for the state.
         */
        _setClasses: function(state) {
            if (state == 'requesting') {
                L.DomUtil.removeClasses(this._container, "active following");
                L.DomUtil.addClasses(this._container, "requesting");

                L.DomUtil.removeClasses(this._icon, this.options.icon);
                L.DomUtil.addClasses(this._icon, this.options.iconLoading);
            } else if (state == 'active') {
                L.DomUtil.removeClasses(this._container, "requesting following");
                L.DomUtil.addClasses(this._container, "active");

                L.DomUtil.removeClasses(this._icon, this.options.iconLoading);
                L.DomUtil.addClasses(this._icon, this.options.icon);
            } else if (state == 'following') {
                L.DomUtil.removeClasses(this._container, "requesting");
                L.DomUtil.addClasses(this._container, "active following");

                L.DomUtil.removeClasses(this._icon, this.options.iconLoading);
                L.DomUtil.addClasses(this._icon, this.options.icon);
            }
        },

        /**
         * Removes all classes from button.
         */
        _cleanClasses: function() {
            L.DomUtil.removeClass(this._container, "requesting");
            L.DomUtil.removeClass(this._container, "active");
            L.DomUtil.removeClass(this._container, "following");

            L.DomUtil.removeClasses(this._icon, this.options.iconLoading);
            L.DomUtil.addClasses(this._icon, this.options.icon);
        },

        /**
         * Reinitializes attributes.
         */
        _resetVariables: function() {
            this._active = false;
            this._locateOnNextLocationFound = this.options.setView;
            this._following = false;
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

      L.DomUtil.addClasses = function(el, names) { LDomUtilApplyClassesMethod('addClass', el, names); };
      L.DomUtil.removeClasses = function(el, names) { LDomUtilApplyClassesMethod('removeClass', el, names); };
    })();

    return L.Control.Locate;
}, window));
