var map,
	spy;
beforeEach(function () {
	map = L.map(document.createElement('div'));
	control = L.control.locate().addTo(map);
});

it('L.control.locate should exist', function(){
	expect(L.control.locate).not.to.be(undefined);
});

it("exists when added", function() {
	container = control.getContainer();
	expect(container.innerHTML).to.be.ok();
});

it("should set setView to false", function() {
	locateOptions = control._locateOptions;
	expect(locateOptions.setView).to.be(false);
});

it("should set watch to true", function() {
	locateOptions = control._locateOptions;
	expect(locateOptions.watch).to.be(true);
});

it("should be possible to set watch to false", function() {
	control = L.control.locate({
		'locateOptions': {
			'watch': false
		}
	}).addTo(map);
	locateOptions = control._locateOptions;
	expect(locateOptions.watch).to.be(false);
});

it("should not be possible to set setView to true", function() {
	control = L.control.locate({
		'locateOptions': {
			'setView': true
		}
	}).addTo(map);
	locateOptions = control._locateOptions;
	expect(locateOptions.watch).to.be(false);
});
