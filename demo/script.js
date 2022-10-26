const osmUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const osmAttrib = 'Map data © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
let osm = new L.TileLayer(osmUrl, {
  attribution: osmAttrib,
  detectRetina: true
});

// please replace this with your own mapbox token!
const token = "pk.eyJ1IjoiZG9tb3JpdHoiLCJhIjoiY2s4a2d0OHp3MDFxMTNmcWoxdDVmdHF4MiJ9.y9-0BZCXJBpNBzEHxhFq1Q";
const mapboxUrl = "https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/{z}/{x}/{y}@2x?access_token=" + token;
const mapboxAttrib = 'Map data © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors. Tiles from <a href="https://www.mapbox.com">Mapbox</a>.';
let mapbox = new L.TileLayer(mapboxUrl, {
  attribution: mapboxAttrib,
  tileSize: 512,
  zoomOffset: -1
});

let map = new L.Map("map", {
  layers: [mapbox],
  center: [51.505, -0.09],
  zoom: 10,
  zoomControl: true
});

// add location control to global name space for testing only
// on a production site, omit the "lc = "!
lc = L.control
  .locate({
    strings: {
      title: "Show me where I am, yo!"
    }
  })
  .addTo(map);
