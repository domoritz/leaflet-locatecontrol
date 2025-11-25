// Dark Mode Toggle
const darkModeToggle = document.getElementById("dark-mode-toggle");
const root = document.documentElement;
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

// Check for saved preference
const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  root.setAttribute("data-theme", savedTheme);
}

// Helper to get current effective theme
function getCurrentTheme() {
  const dataTheme = root.getAttribute("data-theme");
  if (dataTheme) return dataTheme;
  return prefersDark ? "dark" : "light";
}

const osmUrl = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const osmAttrib = 'Map data © <a href="http://osm.org/copyright">OpenStreetMap</a> contributors';
let osm = new L.TileLayer(osmUrl, {
  attribution: osmAttrib,
  detectRetina: true
});

const osmDarkUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const osmDarkAttrib =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';
let osmDark = new L.TileLayer(osmDarkUrl, {
  attribution: osmDarkAttrib,
  detectRetina: true
});

function updateMapLayer() {
  if (getCurrentTheme() === "dark") {
    map.removeLayer(osm);
    map.removeLayer(mapbox);
    osmDark.addTo(map);
  } else {
    map.removeLayer(osmDark);
    osm.addTo(map);
  }
}

darkModeToggle.addEventListener("click", () => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateMapLayer();
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
  layers: [getCurrentTheme() === "dark" ? osmDark : osm],
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
