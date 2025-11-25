import { Map, TileLayer } from "leaflet";
import { LocateControl } from "../dist/L.Control.Locate.esm.js";

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
let osm = new TileLayer(osmUrl, {
  attribution: osmAttrib,
  detectRetina: true
});

const osmDarkUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const osmDarkAttrib =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>';
let osmDark = new TileLayer(osmDarkUrl, {
  attribution: osmDarkAttrib,
  detectRetina: true
});

function updateMapLayer() {
  if (getCurrentTheme() === "dark") {
    map.removeLayer(osm);
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

let map = new Map("map", {
  layers: [getCurrentTheme() === "dark" ? osmDark : osm],
  center: [51.505, -0.09],
  zoom: 10,
  zoomControl: true
});

let lc = new LocateControl({
  strings: {
    title: "Show me where I am, yo!"
  }
}).addTo(map);
