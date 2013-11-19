var base_layer = new L.tileLayer(
    'http://{s}.tile.cloudmade.com/63250e2ef1c24cc18761c70e76253f75/997/256/{z}/{x}/{y}.png',{
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }
);

var map = new L.Map('map', {
    layers: [base_layer],
    center: [51.505, -0.09],
    zoom: 10,
	zoomControl: true
});

// add location control to global name space for testing only
// on a production site, omit the "lc = "!
lc = L.control.locate({
	follow: true
}).addTo(map);

map.on('startfollowing', function() {
    map.on('dragstart', lc.stopFollowing);
}).on('stopfollowing', function() {
    map.off('dragstart', lc.stopFollowing);
});
