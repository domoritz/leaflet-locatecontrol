// please replace this with your own mapbox token!
L.mapbox.accessToken = 'pk.eyJ1IjoiZG9tb3JpdHoiLCJhIjoiY2o0OG1tcDdjMGE0ajMzcGN1dDUxYXpraSJ9.hr3x77xpv2v33wM5-9tDcw';

var map = L.mapbox.map('map').setView([51.505, -0.09], 10);
L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v10').addTo(map);

// add location control to global name space for testing only
// on a production site, omit the "lc = "!
lc = L.control.locate({
    strings: {
        title: "Show me where I am, yo!"
    }
}).addTo(map);
