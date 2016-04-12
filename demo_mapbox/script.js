L.mapbox.accessToken = 'pk.eyJ1IjoiZG9tb3JpdHoiLCJhIjoieENoTEhXUSJ9.kjCosRk1pmnOqTvfsjmgIg';

var map = L.mapbox.map('map', 'mapbox.streets').setView([51.505, -0.09], 10);

// add location control to global name space for testing only
// on a production site, omit the "lc = "!
lc = L.control.locate({
    strings: {
        title: "Show me where I am, yo!"
    }
}).addTo(map);
