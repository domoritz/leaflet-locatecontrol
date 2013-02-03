#Leaflet.Locate

A useful control to geolocate the user with many options.

Tested with Leaflet 0.4.5 on Firefox and Webkit.

##Demo

Check out the demo at http://domoritz.github.com/leaflet-locatecontrol/demo/

## Usage

### Minimal set up:

* add the javascript and css files
* add the following snippet to your map initialization:

```javascript
L.control.locate().addTo(map);
```

### Possible options

The locate controls inherits options from [Leaflet Controls](http://leafletjs.com/reference.html#control-options).

```javascript
L.control.locate({
	position: 'topleft',  // set the location of the control
    drawCircle: true,  // controls whether a circle is drawn that shows the uncertainty about the location
    follow: false,  // follow the location if `watch` and `setView` are set to true in locateOptions
    circleStyle: {},  // change the style of the circle around the user's location
    markerStyle: {},
    metric: true  // use metric or imperial units
}).addTo(map);
```

## Screenshot

![screenshot](https://raw.github.com/domoritz/leaflet-locatecontrol/gh-pages/screenshot.png "Screenshot showing the locate control")

## Developers

Run the demo locally with `python -m SimpleHTTPServer` and then open http://0.0.0.0:8000/demo.
