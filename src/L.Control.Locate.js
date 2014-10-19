/*
Copyright (c) 2014 Dominik Moritz

This file is part of the leaflet locate control. It is licensed under the MIT license.
You can find the project at: https://github.com/domoritz/leaflet-locatecontrol
*/
L.Control.Locate = L.Control.extend({
    options: {
        position: 'topleft',
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
        circlePadding: [0, 0],
        metric: true,
        onLocationError: function(err) {
            // this event is called in case of any location error
            // that is not a time out error.
            alert(err.message);
        },
        onLocationOutsideMapBounds: function(control) {
            // this event is repeatedly called when the location changes
            control.stopLocate(control);
            alert(control.options.strings.outsideMapBoundsMsg);
        },
        setView: true, // automatically sets the map view to the user's location
        // keep the current map zoom level when displaying the user's location. (if 'false', use maxZoom)
        keepCurrentZoomLevel: false,
        showPopup: true, // display a popup when the user click on the inner marker
        strings: {
            title: "Show me where I am",
            popup: "You are within {distance} {unit} from this point",
            outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
        },
        locateOptions: {
            maxZoom: Infinity,
            watch: true  // if you overwrite this, visualization cannot be updated
        }
    },

    initialize: function (options) {
        for (var i in options) {
            L.extend(this.options[i], options[i]);
        }
    },

    /**
     * Tells the map to stopLocating.
     * Removes dragstart bind (to stopFollowing).
     * Cleans container classes.
     * Resets variables.
     * Clears layers.
     * Removes marker and circle
     */
    stopLocate: function(control) {
        control._map.stopLocate();
        control._map.off('dragstart', this.stopFollowing);
        if (control.options.follow && control._following) {
            this.stopFollowing(control._map);
        }

        this.cleanClasses();
        this.resetVariables();

        control._layer.clearLayers();
        control._marker = undefined;
        control._circle = undefined;
    },

    /**
     * Changes container class
     */
    toggleContainerStyle: function() {
        if (!this._container) {
            return;
        }

        if (this._following) {
            this.setClasses('following');
        } else {
            this.setClasses('active');
        }
    },

    /**
     * Changes container class
     */
    cleanClasses: function() {
        L.DomUtil.removeClass(this._container, "requesting");
        L.DomUtil.removeClass(this._container, "active");
        L.DomUtil.removeClass(this._container, "following");
    },

    /**
     * Changes container class
     */
    setClasses: function(state) {
        if (state === 'requesting') { L.DomUtil.removeClasses(this._container, "active following");
            L.DomUtil.addClasses(this._container, "requesting");

            L.DomUtil.removeClasses(this._icon, this.options.icon);
            L.DomUtil.addClasses(this._icon, this.options.iconLoading);
        } else if (state === 'active') {
            L.DomUtil.removeClasses(this._container, "requesting following");
            L.DomUtil.addClasses(this._container, "active");

            L.DomUtil.removeClasses(this._icon, this.options.iconLoading);
            L.DomUtil.addClasses(this._icon, this.options.icon);
        } else if (state === 'following') {
            L.DomUtil.removeClasses(this._container, "requesting");
            L.DomUtil.addClasses(this._container, "active following");

            L.DomUtil.removeClasses(this._icon, this.options.iconLoading);
            L.DomUtil.addClasses(this._icon, this.options.icon);
        }
    },

    /**
     * Dispatches an event.
     * Unbinds stopFollowing.
     * Changes style.
     */
    stopFollowing: function(map) {
        map.fire('stopfollowing', this);
        this._following = false;
        if (this.options.stopFollowingOnDrag) {
            map.off('dragstart', this.stopFollowing);
        }
        this.toggleContainerStyle();
    },

    /**
     * Dispatches an event.
     * Binds stopFollowing.
     */
    startFollowing: function(map) {
        map.fire('startfollowing', this);
        this._following = true;
        if (this.options.stopFollowingOnDrag) {
            map.on('dragstart', this.stopFollowing);
        }
    },
 
    /**
     * Does stuff.
     * Launches map.locate.
     * Starts following.
     * Toggles class or shows location on map.
     */
    locate: function (map) {
        if (this.options.setView) {
            this._locateOnNextLocationFound = true;
        }
        if(!this._active) {
            map.locate(this._locateOptions);
        }
        this._active = true;
        if (this.options.follow) {
            this.startFollowing(map);
        }
        if (!this._event) {
            this.setClasses('requesting');
        } else {
            this.visualizeLocation(map);
        }
    },

    /**
     * Creates button.
     * Binds events on button.
     * Reinitializes state.
     * Binds events on map.
     */
    onAdd: function (map) {
        var container = L.DomUtil.create('div',
            'leaflet-control-locate leaflet-bar leaflet-control');

        this._layer = new L.LayerGroup();
        this._layer.addTo(map);
        this._event = undefined;

        this._locateOptions = this.options.locateOptions;
        L.extend(this._locateOptions, this.options.locateOptions);
        L.extend(this._locateOptions, {
            setView: false // have to set this to false because we have to
                           // do setView manually
        });

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
        this._icon = L.DomUtil.create('span', this.options.icon, this._link);

        L.DomEvent
            .on(this._link, 'click', L.DomEvent.stopPropagation)
            .on(this._link, 'click', L.DomEvent.preventDefault)
            .on(this._link, 'dblclick', L.DomEvent.stopPropagation)
            .on(this._link, 'click', function() {
                var shouldStop = (this._event === undefined || this._map.getBounds().contains(this._event.latlng) || !this.options.setView || this.isOutsideMapBounds())
                if (!this.options.remainActive && (this._active && shouldStop)) {
                    this.stopLocate(this);
                } else {
                    this.locate(map);
                }
            }, this
        );

        //for (var i = 0, len = this.options.hooks.length; i < len; i++) {
        //    L.DomEvent
        //        // @todo This is compatible only IE9+
        //        .on(link, 'click', this.options.hooks[i], this);
        //}

        this.resetVariables();

        // event hooks
        map.on('locationfound', this.onLocationFound, this, this);
        map.on('locationerror', this.onLocationError, this, this);
        map.on('unload', this.stopLocate, this, this);

        return container;
    },

    /**
     * Stops Location.
     * Dispatch error.
     */
    onLocationError: function (err) {
        // ignore time out error if the location is watched
        if (err.code == 3 && this._locateOptions.watch) {
            return;
        }

        this.stopLocate(this);
        this.options.onLocationError(err);
    },
    
    /**
     * Updates location on map if needed.
     */
    onLocationFound: function (e) {
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

        this.visualizeLocation(this._map);
    },

    /**
     * Reinitializes local variables
     */
    resetVariables: function() {
        this._active = false;
        this._locateOnNextLocationFound = this.options.setView;
        this._following = false;
    },

    /**
     * Show location on map
     */
    visualizeLocation: function(map, center) {
        if (this._event.accuracy === undefined) {
            this._event.accuracy = 0;
        }

        var radius = this._event.accuracy;
        if (this._locateOnNextLocationFound) {
            if (this.isOutsideMapBounds()) {
                this.options.onLocationOutsideMapBounds(this);
            } else {
                map.fitBounds(this._event.bounds, {
                    padding: this.options.circlePadding,
                    maxZoom: this.options.keepCurrentZoomLevel ? map.getZoom() : this._locateOptions.maxZoom
                });
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
            unit = "meters";
        } else {
            distance = (radius * 3.2808399).toFixed(0);
            unit = "feet";
        }

        // small inner marker
        var mStyle;
        if (this._following) {
            mStyle = this.options.followMarkerStyle;
        } else {
            mStyle = this.options.markerStyle;
        }

        if (!this._marker) {
            this._marker = this.options.markerClass(this._event.latlng, mStyle)
                .addTo(this._layer);
        } else {
            this._marker.setLatLng(this._event.latlng);
            for (o in mStyle) {
                this._marker.options[o] = mStyle[o];
            }
        }

        var t = this.options.strings.popup;
        if (this.options.showPopup && t) {
            this._marker.bindPopup(L.Util.template(t, {distance: distance, unit: unit}))
                ._popup.setLatLng(this._event.latlng);
        }

        this.toggleContainerStyle();
    },

    /**
     * Check if location is in map bounds
     */
    isOutsideMapBounds: function () {
        if (this._event === undefined)
            return false;
        return this._map.options.maxBounds &&
            !this._map.options.maxBounds.contains(this._event.latlng);
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

  L.DomUtil.addClasses = function(el, names) { LDomUtilApplyClassesMethod('addClass', el, names); };
  L.DomUtil.removeClasses = function(el, names) { LDomUtilApplyClassesMethod('removeClass', el, names); };
})();
