# Leaflet.Locate

[![Bower version](https://badge.fury.io/bo/leaflet.locatecontrol.svg)](http://badge.fury.io/bo/leaflet.locatecontrol)
[![npm version](https://badge.fury.io/js/leaflet.locatecontrol.svg)](http://badge.fury.io/js/leaflet.locatecontrol)
[![jsDelivr Hits](https://data.jsdelivr.com/v1/package/npm/leaflet.locatecontrol/badge?style=rounded)](https://www.jsdelivr.com/package/npm/leaflet.locatecontrol)

A useful control to geolocate the user with many options. Official [Leaflet](http://leafletjs.com/plugins.html#geolocation) and [MapBox plugin](https://www.mapbox.com/mapbox.js/example/v1.0.0/leaflet-locatecontrol/).

Tested with [Leaflet](http://leafletjs.com/) 1.3 in Firefox, Chrome, and Safari. Tested with [Font Awesome](https://fortawesome.github.io/Font-Awesome/) 4.7.

Please check for [breaking changes in the changelog](https://github.com/domoritz/leaflet-locatecontrol/blob/gh-pages/CHANGELOG.md).


## Demo

Check out the demo at http://domoritz.github.io/leaflet-locatecontrol/demo/


## Basic Usage

### Set up:

tl;dr

1. Get CSS and JavaScript files
2. Include CSS and JavaScript files
3. Initialize plugin


#### Download JavaScript and CSS files

For testing purposes and development, you can use the latest version directly from my repository.

For production environments, use [Bower](http://bower.io/) and run `bower install leaflet.locatecontrol` or [download the files from this repository](https://github.com/domoritz/leaflet-locatecontrol/archive/gh-pages.zip). Bower will always download the latest version and keep the code up to date. The original JS and CSS files are in [`\src`](https://github.com/domoritz/leaflet-locatecontrol/tree/gh-pages/src) and the minified versions suitable for production are in [`\dist`](https://github.com/domoritz/leaflet-locatecontrol/tree/gh-pages/dist).

You can also get the latest version of the plugin with [npm](https://www.npmjs.org/). This plugin is available in the [npm repository](https://www.npmjs.org/package/leaflet.locatecontrol). Just run `npm install leaflet.locatecontrol`.

The control is [available from JsDelivr CDN](https://www.jsdelivr.com/projects/leaflet.locatecontrol). If you don't need the latest version, you can use the [mapbox CDN](https://www.mapbox.com/mapbox.js/plugins/#leaflet-locatecontrol).


#### Add the JavaScript and CSS files

The control uses [Font Awesome](https://fortawesome.github.io/Font-Awesome/) for the icons and if you don't have it included yet, you can use the CSS from the CDN.

Then include the CSS and JavaScript files. In this example, we are loading the [files from the JsDelivr CDN](https://www.jsdelivr.com/package/npm/leaflet.locatecontrol?path=dist). In the URLs below, replace `[VERSION]` with the latest release number or remove `@[VERSION]` to always use the latest version. 

```html
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@[VERSION]/dist/L.Control.Locate.min.css" />

<script src="https://cdn.jsdelivr.net/npm/leaflet.locatecontrol@[VERSION]/dist/L.Control.Locate.min.js" charset="utf-8"></script>
```


#### Add the following snippet to your map initialization:

This snippet adds the control to the map. You can pass also pass a configuration.

```js
L.control.locate().addTo(map);
```


### Possible options

The locate controls inherits options from [Leaflet Controls](http://leafletjs.com/reference.html#control-options).

To customize the control, pass an object with your custom options to the locate control.

```js
L.control.locate(OPTIONS).addTo(map);
```

Possible options are listed in the following table. More details are [in the code](https://github.com/domoritz/leaflet-locatecontrol/blob/gh-pages/src/L.Control.Locate.js#L31).


| Option     | Type      | Description       |  Default |
|------------|-----------|-------------------|----------|
| `position` | `string`  | Position of the control | `topleft` |
| `layer` | [`ILayer`](http://leafletjs.com/reference.html#ilayer)  | The layer that the user's location should be drawn on. | a new layer |
| `setView` | `boolean`  or `string`  | Set the map view (zoom and pan) to the user's location as it updates. Options are `false`, `'once'`, `'always'`, `'untilPan'`, or `'untilPanOrZoom'` | `'untilPanOrZoom'` |
| `flyTo` | `boolean` | Smooth pan and zoom to the location of the marker. Only works in Leaflet 1.0+. | `false` |
| `keepCurrentZoomLevel` | `boolean`  | Only pan when setting the view. | `false` |
| `clickBehavior` | `object`  | What to do when the user clicks on the control. Has three options `inView`, `inViewNotFollowing` and `outOfView`. Possible values are `stop` and `setView`, or the name of a behaviour to inherit from. | `{inView: 'stop', outOfView: 'setView', inViewNotFollowing: 'inView'}` |
| `returnToPrevBounds` | `boolean`  | If set, save the map bounds just before centering to the user's location. When control is disabled, set the view back to the bounds that were saved. | `false` |
| `cacheLocation` | `boolean` | Keep a cache of the location after the user deactivates the control. If set to false, the user has to wait until the locate API returns a new location before they see where they are again. | `true` |
| `showCompass` | `boolean` | Show the compass bearing on top of the location marker | `true` |
| `drawCircle` | `boolean`  | If set, a circle that shows the location accuracy is drawn. | `true` |
| `drawMarker` | `boolean`  | If set, the marker at the users' location is drawn. | `true` |
| `markerClass` | `class`  | The class to be used to create the marker. | `LocationMarker` |
| `compassClass` | `class`  | The class to be used to create the marker. | `CompassMarker` |
| `circleStyle` | [`Path options`](http://leafletjs.com/reference.html#path-options) | Accuracy circle style properties. | see code |
| `markerStyle` | [`Path options`](http://leafletjs.com/reference.html#path-options) | Inner marker style properties. Only works if your marker class supports `setStyle`. | see code |
| `compassStyle` | [`Path options`](http://leafletjs.com/reference.html#path-options) | Triangle compass heading marker style properties. Only works if your marker class supports `setStyle`. | see code |
| `followCircleStyle` | [`Path options`](http://leafletjs.com/reference.html#path-options)  | Changes to the accuracy circle while following. Only need to provide changes. | `{}` |
| `followMarkerStyle` | [`Path options`](http://leafletjs.com/reference.html#path-options)  | Changes to the inner marker while following. Only need to provide changes. | `{}` |
| `followCompassStyle` | [`Path options`](http://leafletjs.com/reference.html#path-options)  | Changes to the compass marker while following. Only need to provide changes. | `{}` |
| `icon` | `string`  | The CSS class for the icon. | `fa fa-map-marker` |
| `iconLoading` | `string`  | The CSS class for the icon while loading. | `fa fa-spinner fa-spin` |
| `iconElementTag` | `string`  | The element to be created for icons. | `span` |
| `circlePadding` | `array`  | Padding around the accuracy circle. | `[0, 0]` |
| `createButtonCallback` | `function`  | This callback can be used in case you would like to override button creation behavior. | see code |
| `getLocationBounds` | `function`  | This callback can be used to override the viewport tracking behavior. | see code |
| `onLocationError` | `function`  | This even is called when the user's location is outside the bounds set on the map. | see code |
| `onLocationOutsideMapBounds` | `function`  | Use metric units. | see code |
| `showPopup` | `boolean`  | Display a pop-up when the user click on the inner marker. | `true` |
| `strings` | `object`  | Strings used in the control. Options are `title`, `metersUnit`, `feetUnit`, `popup`, and `outsideMapBoundsMsg` | see code |
| `locateOptions` | [`Locate options`](http://leafletjs.com/reference.html#map-locate-options)  | The default options passed to leaflets locate method. | see code |

For example, to customize the position and the title, you could write

```js
var lc = L.control.locate({
    position: 'topright',
    strings: {
        title: "Show me where I am, yo!"
    }
}).addTo(map);
```


## Screenshot

![screenshot](https://raw.github.com/domoritz/leaflet-locatecontrol/gh-pages/screenshot.png "Screenshot showing the locate control")


## Users

Sites that use this locate control:

* [OpenStreetMap](http://www.openstreetmap.org/) on the start page
* [MapBox](https://www.mapbox.com/mapbox.js/example/v1.0.0/leaflet-locatecontrol/)
* [wheelmap.org](http://wheelmap.org/map)
* [OpenMensa](http://openmensa.org/)
* [Maps Marker Pro](https://www.mapsmarker.com) (WordPress plugin)
* [Bikemap](https://jackdougherty.github.io/bikemapcode/)
* [MyRoutes](https://myroutes.io/)
* ...

## Advanced Usage

### Methods

You can call `start()` or `stop()` on the locate control object to set the location on page load for example.

```js
// create control and add to map
var lc = L.control.locate().addTo(map);

// request location update and set location
lc.start();
```

You can keep the plugin active but stop following using `lc.stopFollowing()`.

### Events

You can leverage the native Leaflet events `onlocationfound` and `onlocationerror` to handle when geolocation is successful or produces an error. You can find out more about these events in the [Leaflet documentation](http://leafletjs.com/examples/mobile.html#geolocation).

### Extending

To customize the behavior of the plugin, use L.extend to override `start`, `stop`, `_drawMarker` and/or `_removeMarker`. Please be aware that functions may change and customizations become incompatible.

```js
L.Control.MyLocate = L.Control.Locate.extend({
   _drawMarker: function() {
     // override to customize the marker
   }
});

var lc = new L.Control.MyLocate();
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

#### How do I enable high accuracy?

To enable [high accuracy (GPS) mode](http://leafletjs.com/reference.html#map-enablehighaccuracy), set the `enableHighAccuracy` in `locateOptions`.

```js
map.addControl(L.control.locate({
       locateOptions: {
               enableHighAccuracy: true
}}));
```


## Developers

Run the demo locally with `grunt serve` and then open [localhost:9000/demo/index.html](http://localhost:9000/demo/index.html).

To generate the minified JS and CSS files, use [grunt](http://gruntjs.com/getting-started) and run `grunt`. However, don't include new minified files or a new version as part of a pull request.


## Making a release (only core developer)

A new version is released with `npm run bump:minor`. Then push the new code with `git push && git push --tags` and publish to npm with `npm publish`.

### Terms

* **active**: After we called `map.locate()` and before `map.stopLocate()`. Any time, the map can fire the `locationfound` or `locationerror` events.
* **following**: Following refers to whether the map zooms and pans automatically when a new location is found.


## Thanks

To all [contributors](https://github.com/domoritz/leaflet-locatecontrol/contributors) and issue reporters.


## License

MIT
