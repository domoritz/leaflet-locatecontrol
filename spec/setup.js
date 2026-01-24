import { Window } from "happy-dom";

// Setup happy-dom as global DOM environment
const window = new Window({
  url: "https://localhost:3000"
});

// Must set navigator BEFORE leaflet is imported (leaflet checks userAgent on load)
Object.defineProperty(global, "navigator", {
  value: {
    userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    platform: "Linux x86_64",
    language: "en-US",
    languages: ["en-US", "en"],
    geolocation: {
      watchPosition: (_success, _error, _options) => {
        // Return a watch ID
        return 1;
      },
      getCurrentPosition: (success, _error, _options) => {
        success({
          coords: {
            latitude: 51.505,
            longitude: -0.09,
            accuracy: 100,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null
          },
          timestamp: Date.now()
        });
      },
      clearWatch: (_watchId) => {}
    }
  },
  writable: true,
  configurable: true
});

global.window = window;
global.document = window.document;
global.HTMLElement = window.HTMLElement;
global.Element = window.Element;
global.Node = window.Node;
global.CustomEvent = window.CustomEvent;
global.Event = window.Event;

// Mock DeviceOrientationEvent
global.DeviceOrientationEvent = class DeviceOrientationEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type, eventInitDict);
    this.alpha = eventInitDict.alpha ?? null;
    this.beta = eventInitDict.beta ?? null;
    this.gamma = eventInitDict.gamma ?? null;
    this.absolute = eventInitDict.absolute ?? false;
  }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};
