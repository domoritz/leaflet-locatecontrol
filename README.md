# Leaflet.Locate

A useful control to geolocate the user with many options.

Tested with [Leaflet](http://leafletjs.com/) 0.7 in Firefox, Webkit and mobile Webkit. Tested with [Font Awesome](https://fortawesome.github.io/) 4.2.0.


## Demo

Check out the demo at http://domoritz.github.io/leaflet-locatecontrol/demo/


## Usage

### Set up:

tl;dr

1. Get CSS and JavaScript files
2. Include CSS and JavaScript files
3. Initialize plugin

#### Download JavaScript and CSS files

For testing purposes and development, you can use the latest version directly from my repository using [rawgithub](http://rawgithub.com/). However, **don't do this in production environments**!

For production environments, use the [mapbox CDN](https://www.mapbox.com/mapbox.js/plugins/#leaflet-locatecontrol) or [download the files from this repository](/domoritz/leaflet-locatecontrol/archive/gh-pages.zip).

The latest version is always available through [Bower](http://bower.io/), just run `bower install leaflet.locatecontrol`. With bower, everything can easily be kept up to date.

#### Add the JavaScript and CSS files

The control uses [Font Awesome](https://fortawesome.github.io/) for the icons and if you don't have it included yet, you can use the CSS from the CDN.

Then include the CSS and JavaScript files.

This example shows how to include font awesome from a CDN and the locate control files through rawgit. **Only use rawgit for testing and never in production! Always prefer using the Mapbox CDN or bower.**

```html
<link href="//maxcdn.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet">
<link rel="stylesheet" href="//rawgithub.com/domoritz/leaflet-locatecontrol/gh-pages/src/L.Control.Locate.css" />
<!--[if lt IE 9]>
    <link rel="stylesheet" href="//rawgithub.com/domoritz/leaflet-locatecontrol/gh-pages/src/L.Control.Locate.ie.css"/>
<![endif]-->

<script src="//rawgithub.com/domoritz/leaflet-locatecontrol/gh-pages/src/L.Control.Locate.js" ></script>
```

#### Add the following snippet to your map initialization:

This snippet adds the control to the map. You can pass also pass a configuration.

```js
L.control.locate().addTo(map);
```

### Possible options

The locate controls inherits options from [Leaflet Controls](http://leafletjs.com/reference.html#control-options).

```js
L.control.locate({
	position: 'topleft',  // set the location of the control
    drawCircle: true,  // controls whether a circle is drawn that shows the uncertainty about the location
    follow: false,  // follow the user's location
    setView: true, // automatically sets the map view to the user's location, enabled if `follow` is true
    keepCurrentZoomLevel: false, // keep the current map zoom level when displaying the user's location. (if `false`, use maxZoom)
    stopFollowingOnDrag: false, // stop following when the map is dragged if `follow` is true (deprecated, see below)
    remainActive: false, // if true locate control remains active on click even if the user's location is in view.
    markerClass: L.circleMarker, // L.circleMarker or L.marker
    circleStyle: {},  // change the style of the circle around the user's location
    markerStyle: {},
    followCircleStyle: {},  // set difference for the style of the circle around the user's location while following
    followMarkerStyle: {},
    icon: 'fa fa-map-marker',  // class for icon, fa-location-arrow or fa-map-marker
    iconLoading: 'fa fa-spinner fa-spin',  // class for loading icon
    circlePadding: [0, 0], // padding around accuracy circle, value is passed to setBounds
    metric: true,  // use metric or imperial units
    onLocationError: function(err) {alert(err.message)},  // define an error callback function
    onLocationOutsideMapBounds:  function(context) { // called when outside map boundaries
            alert(context.options.strings.outsideMapBoundsMsg);
    },
    showPopup: true, // display a popup when the user click on the inner marker
    strings: {
        title: "Show me where I am",  // title of the locate control
        popup: "You are within {distance} {unit} from this point",  // text to appear if user clicks on circle
        outsideMapBoundsMsg: "You seem located outside the boundaries of the map" // default message for onLocationOutsideMapBounds
    }
    locateOptions: {}  // define location options e.g enableHighAccuracy: true or maxZoom: 10
}).addTo(map);
```

### Methods

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

### Events

The locate control fires `startfollowing` and `stopfollowing` on the map object and passes `self` as data.

### Extending

To add other options, like a compass, use L.extend to override run, stop and/or drawMarker and removeMarker methods.

```js
L.Control.Compass = L.Control.Locate.extend({
   run: function() {
      // execute compass
   },
   stop: function() {
     // override to stop the compass
   },
   drawMarker: function() {
     // override to display the arrow
   },
   removeMarker: function() {
     // override to remove the arrow
    }
});
```

### FAQ

#### How do I set the maximum zoom level?

Set the `maxZoom` in `locateOptions` (`keepCurrentZoomLevel` must not be set to true).

```js
map.addControl(L.control.locate({
       locateOptions: {
               maxZoom: 10
}}));
```


## Screenshot

![screenshot](https://raw.github.com/domoritz/leaflet-locatecontrol/gh-pages/screenshot.png "Screenshot showing the locate control")


## Users

Sites that use this locate control:

* [OpenStreetMap](http://www.openstreetmap.org/)
* [MapBox](https://www.mapbox.com/mapbox.js/example/v1.0.0/leaflet-locatecontrol/)
* [wheelmap.org](http://wheelmap.org/map)
* [OpenMensa](http://openmensa.org/)
* ...


## Developers

Run the demo locally with `python -m SimpleHTTPServer` and then open http://0.0.0.0:8000/demo.


## Thanks

To all [contributors](https://github.com/domoritz/leaflet-locatecontrol/contributors) and issue reporters.

## License

MIT
