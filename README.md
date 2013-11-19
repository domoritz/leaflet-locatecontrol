#Leaflet.Locate

A useful control to geolocate the user with many options.

Tested with Leaflet 0.6.4 in Firefox, Webkit and mobile Webkit.


##Demo

Check out the demo at http://domoritz.github.com/leaflet-locatecontrol/demo/


## Usage


### Minimal set up:

* add the javascript and css files
* add the following snippet to your map initialization:

```javascript
L.control.locate().addTo(map);
```

The CSS style is compatible with the latest Leaflet. If you cannot use the latest Leaflet, you can use the provided `L.Control.Locate.0.5.css` style for Leaflet 0.5.1 and below.


### Possible options

The locate controls inherits options from [Leaflet Controls](http://leafletjs.com/reference.html#control-options).

```javascript
L.control.locate({
	position: 'topleft',  // set the location of the control
    drawCircle: true,  // controls whether a circle is drawn that shows the uncertainty about the location
    follow: false,  // follow the location if `watch` and `setView` are set to true in locateOptions
    stopFollowingOnDrag: false, // stop following when the map is dragged if `follow` is set to true (deprecated, see below)
    circleStyle: {},  // change the style of the circle around the user's location
    markerStyle: {},
    followCircleStyle: {},  // set difference for the style of the circle around the user's location while following
    followMarkerStyle: {},
    circlePadding: [0, 0], // padding around accuracy circle, value is passed to setBounds
    metric: true,  // use metric or imperial units
    onLocationError: function(err) {alert(err.message)},  // define an error callback function
    onLocationOutsideMapBounds:  function(context) { // called when outside map boundaries
            alert(context.options.strings.outsideMapBoundsMsg);
    },
    setView: true, // automatically sets the map view to the user's location
    strings: {
        title: "Show me where I am",  // title of the locat control
        popup: "You are within {distance} {unit} from this point",  // text to appear if user clicks on circle
        outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
    }
    locateOptions: {}  // define location options e.g enableHighAccuracy: true
}).addTo(map);
```

### Helper functions

You can call `locate()` or `stopLocate()` on the locate control object to set the location of page load for example.

```js
// create control and add to map
var lc = L.control.locate().addTo(map);

// request location update and set location
lc.locate();
```

You can also use the helper functions to automatically stop following when the map is panned. See the example below.

```js
var lc = L.control.locate().addTo(map);
map.on('dragstart', lc.stopFollowing);
```

Alternatively, you can unload events when not following to avoid unnecessary events.

```js
map.on('startfollowing', function() {
    map.on('dragstart', lc.stopFollowing);
}).on('stopfollowing', function() {
    map.off('dragstart', lc.stopFollowing);
});
```

## Screenshot

![screenshot](https://raw.github.com/domoritz/leaflet-locatecontrol/gh-pages/screenshot.png "Screenshot showing the locate control")


## Users

Sites that use this locate control:

* [OpenStreetMap](http://www.openstreetmap.org/)
* [wheelmap.org](http://wheelmap.org/map)
* [OpenMensa](http://openmensa.org/)
* ...


## Developers

Run the demo locally with `python -m SimpleHTTPServer` and then open http://0.0.0.0:8000/demo.


## Thanks

To all [contributors](https://github.com/domoritz/leaflet-locatecontrol/contributors) and issue reporters.

## License

MIT
