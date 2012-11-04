#Leaflet.Locate

A control to geolocate the user.

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
    drawCircle: true,  // controls whether a circle is drawn that shows the uncertainty about the location
    autoLocate: false,  // locate the user on init
    circleStyle: {},  // change the style of the circle around the user's location
    markerStyle: {}
}).addTo(map);
```

## Devlopers

Run the demo locally with `python -m SimpleHTTPServer` and then open http://0.0.0.0:8000/demo.