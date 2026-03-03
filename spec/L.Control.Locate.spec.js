import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert";
import "./setup.js";
import { Map, LayerGroup } from "leaflet";

// Import after setup
const { LocateControl, LocationMarker, CompassMarker, locate } = await import("../src/L.Control.Locate.js");

describe("LocateControl", () => {
  let map;
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    container.style.width = "800px";
    container.style.height = "600px";
    document.body.appendChild(container);
    map = new Map(container).setView([51.505, -0.09], 13);
  });

  afterEach(() => {
    if (map) {
      map.remove();
    }
    document.body.innerHTML = "";
  });

  describe("Initialization & Options", () => {
    it("should create a LocateControl instance", () => {
      const control = new LocateControl();
      assert.ok(control, "Control should be created");
      assert.strictEqual(typeof control.start, "function", "Should have start method");
      assert.strictEqual(typeof control.stop, "function", "Should have stop method");
      assert.strictEqual(typeof control.setView, "function", "Should have setView method");
    });

    it("should have default options", () => {
      const control = new LocateControl();
      assert.strictEqual(control.options.position, "topleft");
      assert.strictEqual(control.options.setView, "untilPanOrZoom");
      assert.strictEqual(control.options.keepCurrentZoomLevel, false);
      assert.strictEqual(control.options.flyTo, false);
      assert.strictEqual(control.options.drawCircle, true);
      assert.strictEqual(control.options.drawMarker, true);
      assert.strictEqual(control.options.showCompass, true);
      assert.strictEqual(control.options.cacheLocation, true);
      assert.strictEqual(control.options.showPopup, true);
      assert.strictEqual(control.options.metric, true);
    });

    it("should accept custom options", () => {
      const control = new LocateControl({
        position: "topright",
        flyTo: true,
        drawCircle: false,
        metric: false
      });
      assert.strictEqual(control.options.position, "topright");
      assert.strictEqual(control.options.flyTo, true);
      assert.strictEqual(control.options.drawCircle, false);
      assert.strictEqual(control.options.metric, false);
    });

    it("should merge nested options", () => {
      const control = new LocateControl({
        strings: {
          title: "Locate me!"
        },
        clickBehavior: {
          inView: "setView"
        }
      });
      assert.strictEqual(control.options.strings.title, "Locate me!");
      assert.strictEqual(control.options.clickBehavior.inView, "setView");
      // Should still have other default strings
      assert.ok(control.options.strings.popup);
      assert.ok(control.options.strings.metersUnit);
    });

    it("should accept a custom layer", () => {
      const layer = new LayerGroup();
      const control = new LocateControl({ layer });
      assert.strictEqual(control.options.layer, layer);
    });
  });

  describe("DOM Creation", () => {
    it("should create DOM elements when added to map", () => {
      const control = new LocateControl();
      map.addControl(control);
      const controlContainer = document.querySelector(".leaflet-control-locate");

      assert.ok(controlContainer instanceof HTMLElement, "Should create control container");
      assert.ok(controlContainer.classList.contains("leaflet-bar"), "Should have leaflet-bar class");
    });

    it("should create a link element", () => {
      const control = new LocateControl();
      map.addControl(control);
      const link = document.querySelector(".leaflet-control-locate a");

      assert.ok(link instanceof HTMLElement, "Should create link element");
      assert.ok(link.hasAttribute("href"), "Link should have href");
    });

    it("should create an icon element", () => {
      const control = new LocateControl();
      map.addControl(control);
      const icon = document.querySelector(".leaflet-control-locate-location-arrow");

      assert.ok(icon instanceof HTMLElement, "Should create icon element");
    });

    it("should support text display", () => {
      const control = new LocateControl({
        strings: {
          text: "Locate"
        }
      });
      map.addControl(control);
      const text = document.querySelector(".leaflet-locate-text");

      assert.ok(text instanceof HTMLElement, "Should create text element");
      assert.strictEqual(text.textContent, "Locate");
    });
  });

  describe("Accessibility (ARIA)", () => {
    it('should set role="button" on link', () => {
      const control = new LocateControl();
      map.addControl(control);
      const link = document.querySelector(".leaflet-control-locate a");

      assert.strictEqual(link.getAttribute("role"), "button");
    });

    it("should set aria-label on link", () => {
      const control = new LocateControl();
      map.addControl(control);
      const link = document.querySelector(".leaflet-control-locate a");

      assert.ok(link.hasAttribute("aria-label"));
      assert.strictEqual(link.getAttribute("aria-label"), control.options.strings.title);
    });

    it("should set title on link", () => {
      const customTitle = "Find my location";
      const control = new LocateControl({
        strings: { title: customTitle }
      });
      map.addControl(control);
      const link = document.querySelector(".leaflet-control-locate a");

      assert.strictEqual(link.title, customTitle);
    });
  });

  describe("setView Options", () => {
    it('should accept "once" as setView option', () => {
      const control = new LocateControl({ setView: "once" });
      assert.strictEqual(control.options.setView, "once");
    });

    it('should accept "always" as setView option', () => {
      const control = new LocateControl({ setView: "always" });
      assert.strictEqual(control.options.setView, "always");
    });

    it('should accept "untilPan" as setView option', () => {
      const control = new LocateControl({ setView: "untilPan" });
      assert.strictEqual(control.options.setView, "untilPan");
    });

    it("should accept false as setView option", () => {
      const control = new LocateControl({ setView: false });
      assert.strictEqual(control.options.setView, false);
    });
  });

  describe("clickBehavior Options", () => {
    it("should have default click behaviors", () => {
      const control = new LocateControl();
      assert.strictEqual(control.options.clickBehavior.inView, "stop");
      assert.strictEqual(control.options.clickBehavior.outOfView, "setView");
      assert.strictEqual(control.options.clickBehavior.inViewNotFollowing, "inView");
    });

    it("should not share options between instances", () => {
      // This test verifies the fix for prototype pollution bug
      const control1 = new LocateControl({
        clickBehavior: { inView: "setView" }
      });
      const control2 = new LocateControl();

      assert.strictEqual(control1.options.clickBehavior.inView, "setView");
      assert.strictEqual(control2.options.clickBehavior.inView, "stop", "Options should not be shared between instances");
    });

    it("should accept custom click behaviors", () => {
      const control = new LocateControl({
        clickBehavior: {
          inView: "setView",
          outOfView: "stop"
        }
      });
      assert.strictEqual(control.options.clickBehavior.inView, "setView");
      assert.strictEqual(control.options.clickBehavior.outOfView, "stop");
    });
  });

  describe("keepCurrentZoomLevel Options", () => {
    it("should accept boolean true", () => {
      const control = new LocateControl({ keepCurrentZoomLevel: true });
      assert.strictEqual(control.options.keepCurrentZoomLevel, true);
    });

    it("should accept boolean false", () => {
      const control = new LocateControl({ keepCurrentZoomLevel: false });
      assert.strictEqual(control.options.keepCurrentZoomLevel, false);
    });

    it("should accept array [minZoom, maxZoom]", () => {
      const control = new LocateControl({ keepCurrentZoomLevel: [10, 15] });
      assert.deepStrictEqual(control.options.keepCurrentZoomLevel, [10, 15]);
    });
  });

  describe("Style Options", () => {
    it("should have default circle style", () => {
      const control = new LocateControl();
      assert.ok(control.options.circleStyle);
      assert.strictEqual(control.options.circleStyle.className, "leaflet-control-locate-circle");
      assert.ok(control.options.circleStyle.color);
    });

    it("should have default marker style", () => {
      const control = new LocateControl();
      assert.ok(control.options.markerStyle);
      assert.strictEqual(control.options.markerStyle.className, "leaflet-control-locate-marker");
      assert.ok(control.options.markerStyle.radius);
    });

    it("should have default compass style", () => {
      const control = new LocateControl();
      assert.ok(control.options.compassStyle);
      assert.ok(control.options.compassStyle.radius);
      assert.ok(control.options.compassStyle.width);
      assert.ok(control.options.compassStyle.depth);
    });

    it("should merge follow styles from default styles", () => {
      const control = new LocateControl();
      // Follow styles should inherit from default styles
      assert.strictEqual(control.options.followCircleStyle.className, control.options.circleStyle.className);
      assert.strictEqual(control.options.followMarkerStyle.className, control.options.markerStyle.className);
    });
  });

  describe("Localization", () => {
    it("should have default string values", () => {
      const control = new LocateControl();
      assert.strictEqual(control.options.strings.title, "Show me where I am");
      assert.strictEqual(control.options.strings.metersUnit, "meters");
      assert.strictEqual(control.options.strings.feetUnit, "feet");
      assert.ok(control.options.strings.popup);
      assert.ok(control.options.strings.outsideMapBoundsMsg);
    });

    it("should not share strings between instances", () => {
      // This test verifies the fix for prototype pollution bug
      const control1 = new LocateControl({
        strings: { title: "Custom Title" }
      });
      const control2 = new LocateControl();

      assert.strictEqual(control1.options.strings.title, "Custom Title");
      assert.strictEqual(control2.options.strings.title, "Show me where I am", "Strings should not be shared between instances");
    });

    it("should accept custom strings", () => {
      const control = new LocateControl({
        strings: {
          title: "Zeige meinen Standort",
          metersUnit: "Meter",
          feetUnit: "Fuß"
        }
      });
      assert.strictEqual(control.options.strings.title, "Zeige meinen Standort");
      assert.strictEqual(control.options.strings.metersUnit, "Meter");
      assert.strictEqual(control.options.strings.feetUnit, "Fuß");
    });
  });

  describe("Events", () => {
    it("should fire locatelocationfound event when location is found", () => {
      const control = new LocateControl({ setView: false });
      map.addControl(control);

      let eventFired = false;
      let eventData = null;

      map.on("locatelocationfound", (e) => {
        eventFired = true;
        eventData = e;
      });

      // Simulate the control being active
      control._active = true;

      // Simulate a location found event
      const locationEvent = {
        latlng: { lat: 51.5, lng: -0.09 },
        accuracy: 100,
        altitude: 50,
        altitudeAccuracy: 10,
        heading: 90,
        speed: 5,
        timestamp: Date.now(),
        bounds: null
      };

      control._onLocationFound(locationEvent);

      assert.ok(eventFired, "Event should be fired");
      assert.deepStrictEqual(eventData.latlng, locationEvent.latlng);
      assert.strictEqual(eventData.accuracy, 100);
      assert.strictEqual(eventData.control, control);
    });

    it("should allow stopping the control from the event handler (oneshot)", () => {
      const control = new LocateControl({ setView: false });
      map.addControl(control);

      map.on("locatelocationfound", (e) => {
        e.control.stop();
      });

      control._active = true;
      control._onLocationFound({
        latlng: { lat: 51.5, lng: -0.09 },
        accuracy: 100,
        bounds: null
      });

      assert.strictEqual(control._active, false, "Control should be stopped");
    });
  });

  describe("Control Lifecycle", () => {
    it("should add layer to map when added", () => {
      const control = new LocateControl();
      map.addControl(control);
      // The internal layer should be added to map
      assert.ok(control._layer);
    });

    it("should clean up when removed from map", () => {
      const control = new LocateControl();
      map.addControl(control);
      map.removeControl(control);
      // Control should be stopped
      assert.strictEqual(control._active, false);
    });
  });

  describe("CSS state", () => {
    it("should remove state classes when stopped", () => {
      const control = new LocateControl();
      map.addControl(control);
      control._container.classList.add("requesting", "active", "following");
      control.stop();
      assert.ok(!control._container.classList.contains("requesting"));
      assert.ok(!control._container.classList.contains("active"));
      assert.ok(!control._container.classList.contains("following"));
    });

    it("should set requesting class when active without location", () => {
      const control = new LocateControl();
      map.addControl(control);
      control._active = true;
      control._event = undefined;
      control._updateContainerStyle();
      assert.ok(control._container.classList.contains("requesting"));
      assert.ok(!control._container.classList.contains("active"));
      assert.ok(!control._container.classList.contains("following"));
    });

    it("should set active class when active with location but not following", () => {
      const control = new LocateControl({ setView: false });
      map.addControl(control);
      control._active = true;
      control._event = { latlng: { lat: 51.5, lng: -0.09 }, accuracy: 50 };
      control._updateContainerStyle();
      assert.ok(control._container.classList.contains("active"));
      assert.ok(!control._container.classList.contains("requesting"));
      assert.ok(!control._container.classList.contains("following"));
    });

    it("should set following class when following", () => {
      const control = new LocateControl({ setView: "always" });
      map.addControl(control);
      control._active = true;
      control._event = { latlng: { lat: 51.5, lng: -0.09 }, accuracy: 50 };
      control._updateContainerStyle();
      assert.ok(control._container.classList.contains("active"));
      assert.ok(control._container.classList.contains("following"));
      assert.ok(!control._container.classList.contains("requesting"));
    });

    it("should restore default icon class when stopped", () => {
      const control = new LocateControl();
      map.addControl(control);
      // Simulate loading state
      control._icon.classList.remove(control.options.icon);
      control._icon.classList.add(control.options.iconLoading);
      control.stop();
      assert.ok(control._icon.classList.contains(control.options.icon));
      assert.ok(!control._icon.classList.contains(control.options.iconLoading));
    });
  });

  describe("setView", () => {
    it("should zoom to initialZoomLevel when justClicked", () => {
      const control = new LocateControl({ initialZoomLevel: 15 });
      map.addControl(control);
      control._event = { latlng: { lat: 51.5, lng: -0.09 }, accuracy: 100 };
      control._justClicked = true;
      control.setView();
      assert.strictEqual(map.getZoom(), 15);
    });

    it("should not break following when flyTo is used with untilPanOrZoom", () => {
      const control = new LocateControl({
        flyTo: true,
        setView: "untilPanOrZoom",
        initialZoomLevel: 15
      });
      map.addControl(control);

      // Activate to bind event listeners (zoomstart -> _onZoom)
      control._activate();

      // Simulate first location found (user just clicked)
      control._justClicked = true;
      control._event = {
        latlng: { lat: 51.5, lng: -0.09 },
        accuracy: 100,
        bounds: { getSouthWest: () => ({ lat: 51.49, lng: -0.1 }), getNorthEast: () => ({ lat: 51.51, lng: -0.08 }) }
      };

      control.setView();

      // flyTo triggers zoomstart internally, but _ignoreEvent should prevent
      // _userZoomed from being set to true
      assert.strictEqual(control._userZoomed, false, "_userZoomed should remain false after flyTo");
    });

    it("should set _ignoreEvent when using keepCurrentZoomLevel path", async () => {
      const control = new LocateControl({
        flyTo: true,
        setView: "untilPanOrZoom",
        keepCurrentZoomLevel: true
      });
      map.addControl(control);
      control._activate();

      control._event = {
        latlng: { lat: 51.5, lng: -0.09 },
        accuracy: 100,
        bounds: { getSouthWest: () => ({ lat: 51.49, lng: -0.1 }), getNorthEast: () => ({ lat: 51.51, lng: -0.08 }) }
      };

      // Capture _ignoreEvent state during setView
      let ignoreEventDuringCall = null;
      const originalFlyTo = map.flyTo;
      map.flyTo = function (...args) {
        ignoreEventDuringCall = control._ignoreEvent;
        return originalFlyTo.apply(this, args);
      };

      try {
        control.setView();

        // _ignoreEvent should have been true during the flyTo call
        assert.strictEqual(ignoreEventDuringCall, true, "_ignoreEvent should be set during flyTo call");

        // Wait for requestAnimationFrame to complete
        await new Promise((resolve) => requestAnimationFrame(resolve));
        assert.strictEqual(control._ignoreEvent, false, "_ignoreEvent should be reset after requestAnimationFrame");
      } finally {
        // Restore original method
        map.flyTo = originalFlyTo;
      }
    });
  });

  describe("Compass Activation", () => {
    let originalOnDeviceOrientation;
    let originalOnDeviceOrientationAbsolute;
    let originalRequestPermission;

    beforeEach(() => {
      originalOnDeviceOrientation = window.ondeviceorientation;
      originalOnDeviceOrientationAbsolute = window.ondeviceorientationabsolute;
      originalRequestPermission = DeviceOrientationEvent.requestPermission;

      // Default: deviceorientation supported, no requestPermission
      window.ondeviceorientation = null;
      delete window.ondeviceorientationabsolute;
      delete DeviceOrientationEvent.requestPermission;
    });

    afterEach(() => {
      // Restore originals
      if (originalOnDeviceOrientation !== undefined) {
        window.ondeviceorientation = originalOnDeviceOrientation;
      } else {
        delete window.ondeviceorientation;
      }
      if (originalOnDeviceOrientationAbsolute !== undefined) {
        window.ondeviceorientationabsolute = originalOnDeviceOrientationAbsolute;
      } else {
        delete window.ondeviceorientationabsolute;
      }
      if (originalRequestPermission !== undefined) {
        DeviceOrientationEvent.requestPermission = originalRequestPermission;
      } else {
        delete DeviceOrientationEvent.requestPermission;
      }
      mock.restoreAll();
    });

    it("should skip compass when showCompass is false", async () => {
      const control = new LocateControl({ showCompass: false });
      map.addControl(control);
      const spy = mock.method(control, "_onDeviceOrientation");

      await control._activateCompass();

      // Dispatch orientation event — should not be received
      window.dispatchEvent(new DeviceOrientationEvent("deviceorientation", { alpha: 90 }));
      assert.strictEqual(spy.mock.callCount(), 0, "_onDeviceOrientation should not be called");
    });

    it("should skip compass when device has no orientation support", async () => {
      delete window.ondeviceorientation;
      delete window.ondeviceorientationabsolute;

      const control = new LocateControl({ showCompass: true });
      map.addControl(control);
      const spy = mock.method(control, "_onDeviceOrientation");

      await control._activateCompass();

      window.dispatchEvent(new DeviceOrientationEvent("deviceorientation", { alpha: 90 }));
      assert.strictEqual(spy.mock.callCount(), 0, "_onDeviceOrientation should not be called");
    });

    it("should bind deviceorientation event when supported", async () => {
      const control = new LocateControl({ showCompass: true });
      map.addControl(control);
      control._active = true;

      await control._activateCompass();

      // Verify the handler is bound by dispatching an event
      const event = new DeviceOrientationEvent("deviceorientation", { alpha: 90, absolute: true });
      window.dispatchEvent(event);
      assert.strictEqual(control._compassHeading, 270, "Should process orientation event (360 - 90)");
    });

    it("should prefer deviceorientationabsolute when available", async () => {
      window.ondeviceorientationabsolute = null;

      const control = new LocateControl({ showCompass: true });
      map.addControl(control);
      control._active = true;

      await control._activateCompass();

      // deviceorientation should NOT trigger the handler
      window.dispatchEvent(new DeviceOrientationEvent("deviceorientation", { alpha: 45, absolute: true }));
      assert.strictEqual(control._compassHeading, null, "Should not react to deviceorientation");

      // deviceorientationabsolute SHOULD trigger the handler
      const event = new DeviceOrientationEvent("deviceorientationabsolute", { alpha: 45, absolute: true });
      window.dispatchEvent(event);
      assert.strictEqual(control._compassHeading, 315, "Should process absolute orientation event");
    });

    it("should bind compass when requestPermission grants access", async () => {
      DeviceOrientationEvent.requestPermission = async () => "granted";

      const control = new LocateControl({ showCompass: true });
      map.addControl(control);
      control._active = true;

      await control._activateCompass();

      const event = new DeviceOrientationEvent("deviceorientation", { alpha: 180, absolute: true });
      window.dispatchEvent(event);
      assert.strictEqual(control._compassHeading, 180, "Should process orientation after granted permission");
    });

    it("should not bind compass when requestPermission denies access", async () => {
      DeviceOrientationEvent.requestPermission = async () => "denied";

      const control = new LocateControl({ showCompass: true });
      map.addControl(control);
      const spy = mock.method(control, "_onDeviceOrientation");

      await control._activateCompass();

      window.dispatchEvent(new DeviceOrientationEvent("deviceorientation", { alpha: 90 }));
      assert.strictEqual(spy.mock.callCount(), 0, "_onDeviceOrientation should not be called when denied");
    });

    it("should handle requestPermission rejection gracefully", async () => {
      DeviceOrientationEvent.requestPermission = async () => {
        throw new Error("NotAllowedError");
      };

      const control = new LocateControl({ showCompass: true });
      map.addControl(control);
      const spy = mock.method(control, "_onDeviceOrientation");

      // Should not throw
      await control._activateCompass();

      window.dispatchEvent(new DeviceOrientationEvent("deviceorientation", { alpha: 90 }));
      assert.strictEqual(spy.mock.callCount(), 0, "_onDeviceOrientation should not be called after rejection");
    });

    it("should call _activateCompass from _activate", () => {
      const control = new LocateControl({ showCompass: true });
      map.addControl(control);
      const spy = mock.method(control, "_activateCompass", () => {});

      control._activate();

      assert.strictEqual(spy.mock.callCount(), 1, "_activateCompass should be called once");
    });
  });

  describe("Popup Binding", () => {
    it("should bind popup to marker when showPopup is true", () => {
      const control = new LocateControl({ showPopup: true });
      map.addControl(control);

      // Simulate location event
      control._event = {
        latlng: { lat: 51.5, lng: -0.09 },
        accuracy: 100
      };
      control._drawMarker();

      assert.ok(control._marker);
      assert.ok(control._marker.getPopup());
    });

    it("should not bind popup when showPopup is false", () => {
      const control = new LocateControl({ showPopup: false });
      map.addControl(control);

      control._event = {
        latlng: { lat: 51.5, lng: -0.09 },
        accuracy: 100
      };
      control._drawMarker();

      assert.ok(control._marker);
      assert.strictEqual(control._marker.getPopup(), undefined);
    });

    it("should bind popup to compass when compass is active", () => {
      const control = new LocateControl({ showPopup: true, showCompass: true });
      map.addControl(control);

      control._event = {
        latlng: { lat: 51.5, lng: -0.09 },
        accuracy: 100
      };
      control._compassHeading = 45;
      control._active = true;
      control._drawMarker();

      assert.ok(control._compass);
      assert.ok(control._compass.getPopup());
    });

    it("should not crash when compass is null", () => {
      const control = new LocateControl({ showPopup: true, showCompass: false });
      map.addControl(control);

      control._event = {
        latlng: { lat: 51.5, lng: -0.09 },
        accuracy: 100
      };
      control._compass = null;
      control._drawMarker();

      // Should not throw, marker should still have popup
      assert.ok(control._marker);
      assert.ok(control._marker.getPopup());
    });

    it("should include lat, lng, and altitude in popup text", () => {
      const control = new LocateControl({
        showPopup: true,
        strings: {
          popup: "{lat} {lng} {altitude} {distance} {unit}"
        }
      });
      map.addControl(control);

      control._event = {
        latlng: { lat: 51.505, lng: -0.09 },
        accuracy: 100,
        altitude: 42.7
      };
      control._drawMarker();

      const popupContent = control._marker.getPopup().getContent();
      assert.ok(popupContent.includes("51.505000"), "popup should contain formatted lat");
      assert.ok(popupContent.includes("-0.090000"), "popup should contain formatted lng");
      assert.ok(popupContent.includes("42.7"), "popup should contain altitude");
    });

    it("should show N/A for altitude when not available", () => {
      const control = new LocateControl({
        showPopup: true,
        strings: {
          popup: "alt:{altitude}"
        }
      });
      map.addControl(control);

      control._event = {
        latlng: { lat: 51.505, lng: -0.09 },
        accuracy: 100
      };
      control._drawMarker();

      const popupContent = control._marker.getPopup().getContent();
      assert.ok(popupContent.includes("N/A"), "popup should show N/A when altitude is not available");
    });

    it("should pass all template data to popup function", () => {
      let receivedData;
      const control = new LocateControl({
        showPopup: true,
        strings: {
          popup: (data) => {
            receivedData = data;
            return "test";
          }
        }
      });
      map.addControl(control);

      control._event = {
        latlng: { lat: 51.505, lng: -0.09 },
        accuracy: 200,
        altitude: 15
      };
      control._drawMarker();

      assert.strictEqual(receivedData.lat, "51.505000");
      assert.strictEqual(receivedData.lng, "-0.090000");
      assert.strictEqual(receivedData.altitude, "15.0");
      assert.ok(receivedData.distance);
      assert.ok(receivedData.unit);
    });
  });
});

describe("LocationMarker", () => {
  let map;
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    container.style.width = "800px";
    container.style.height = "600px";
    document.body.appendChild(container);
    map = new Map(container).setView([51.505, -0.09], 13);
  });

  afterEach(() => {
    if (map) {
      map.remove();
    }
    document.body.innerHTML = "";
  });

  it("should create a LocationMarker", () => {
    const marker = new LocationMarker([51.505, -0.09], {
      color: "#fff",
      fillColor: "#2A93EE",
      radius: 9
    });
    assert.ok(marker);
  });

  it("should generate SVG icon", () => {
    const marker = new LocationMarker([51.505, -0.09], {
      color: "#fff",
      fillColor: "#2A93EE",
      fillOpacity: 1,
      weight: 3,
      opacity: 1,
      radius: 9
    });
    assert.ok(marker._locationIcon);
    assert.ok(marker._locationIcon.options.html.includes("<svg"));
    assert.ok(marker._locationIcon.options.html.includes("<circle"));
  });

  it("should update style with setStyle", () => {
    const marker = new LocationMarker([51.505, -0.09], {
      radius: 9
    });
    marker.setStyle({ radius: 12 });
    assert.strictEqual(marker.options.radius, 12);
  });
});

describe("CompassMarker", () => {
  let map;
  let container;

  beforeEach(() => {
    container = document.createElement("div");
    container.style.width = "800px";
    container.style.height = "600px";
    document.body.appendChild(container);
    map = new Map(container).setView([51.505, -0.09], 13);
  });

  afterEach(() => {
    if (map) {
      map.remove();
    }
    document.body.innerHTML = "";
  });

  it("should create a CompassMarker with heading", () => {
    const marker = new CompassMarker([51.505, -0.09], 45, {
      radius: 9,
      width: 9,
      depth: 6
    });
    assert.ok(marker);
    assert.strictEqual(marker._heading, 45);
  });

  it("should generate SVG with arrow path", () => {
    const marker = new CompassMarker([51.505, -0.09], 90, {
      fillColor: "#2A93EE",
      fillOpacity: 1,
      weight: 0,
      radius: 9,
      width: 9,
      depth: 6
    });
    assert.ok(marker._locationIcon);
    assert.ok(marker._locationIcon.options.html.includes("<svg"));
    assert.ok(marker._locationIcon.options.html.includes("<path"));
  });

  it("should update heading with setHeading", () => {
    const marker = new CompassMarker([51.505, -0.09], 0, {
      radius: 9,
      width: 9,
      depth: 6
    });
    marker.setHeading(180);
    assert.strictEqual(marker._heading, 180);
  });
});

describe("Exports", () => {
  it("should export LocateControl", () => {
    assert.ok(LocateControl);
  });

  it("should export LocationMarker", () => {
    assert.ok(LocationMarker);
  });

  it("should export CompassMarker", () => {
    assert.ok(CompassMarker);
  });

  it("should export locate factory function", () => {
    assert.ok(locate);
    assert.strictEqual(typeof locate, "function");
  });
});
