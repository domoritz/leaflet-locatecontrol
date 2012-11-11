L.Control.Locate = L.Control.extend({
    options: {
        position: 'topleft',
        drawCircle: true,
        autoLocate: false,  // locate at start up
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
        locateOptions: {
            setView: true,  // pan and zoom to the user's initial location
            maxZoom: 16,
            watch: true  // the circle follows the location
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

        var stopLocate = function() {
            map.stopLocate();
            self._following = false;
            self._container.className = classNames;
        };

        L.DomEvent
            .on(link, 'click', L.DomEvent.stopPropagation)
            .on(link, 'click', L.DomEvent.preventDefault)
            .on(link, 'click', function(){
                if (!self._following) {
                    map.locate(self.options.locateOptions);
                } else {
                    stopLocate();
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

        var onLocationError = function (err) {
            // ignore timeout error if the location is watched
            if (err.code==3 && this.options.locateOptions.watch) {
                return;
            }

            stopLocate();

            alert(err.message);
        };

        map.on('locationfound', onLocationFound, self);
        map.on('locationerror', onLocationError, self);

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
