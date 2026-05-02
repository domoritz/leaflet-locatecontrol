# Changelog

Here we document notable changes.

## **0.89.1** - 2026-05-02

- Fix Android compass heading (#418)
- Fix: unbind link listeners on remove (#417)
- Improve documentation (#411)
- Update dependencies (#412, #413, #414, #415, #418)

## **0.89.0** - 2026-03-08

- Add `{speed}` (raw m/s) and `{heading}` (degrees) placeholders to popup template data (#405)
- Refactor compass activation/deactivation and error handling (#401)
- Replace Leaflet DOM helpers with native equivalents for Leaflet 2 compatibility (#404, #369)
- Fix incorrect `onLocationError` option description in README (wrong since 2014) (#409)

## **0.88** - 2026-02-12

- Add `{lat}`, `{lng}`, and `{altitude}` placeholders to popup template data. (#398)
- Add `locatelocationfound` event fired on the map with a reference to the control. (#395)
- Fix `flyTo` breaking following mode with `untilPanOrZoom`. (#396)
- Fix color status changes for custom icons. (#399)

## **0.87** - 2026-01-28

- Add test framework. (#390)
- Add timeout feedback in watch mode (visual indicator after 3 consecutive timeouts). (#387)
- Add `locatedeactivate` event when control is removed from map. (#388)
- Fix `stopFollowing` crash when called before location found. (#389)
- Fix `strings.text` styling and documentation. (#394)
- Fix prototype pollution in `LocateControl` options. (#391)

## **0.86** - 2026-01-11

- Add ARIA label to button. (#386)
- Add zoom range support to `keepCurrentZoomLevel` option (e.g. `[13, 18]`). (#384)
- Enable CSS theming and migrate from SCSS to modern CSS. (#380)
- Replace build tooling with native Rollup (removed Grunt). (#377, #379)

## **0.85** - 2025-09-07

- Fix rotation of compass arrow on Safari and Firefox. (#374)

## **0.84** - 2025-04-01

- Fix compass rotation center. (#368)
- Set SVG style as attributes instead of CSS properties. (#364)

## **0.83** - 2024-12-28

- Add TypeScript definitions. (#360)
- Fix `LocateOptions` parameter type. (#361)

## **0.82** - 2024-10-29

- Refactor source to ES module (ESM). (#357)

## **0.80** - 2024-04-10

- Add `module` field and CDN support. (#342)

## **0.79** - 2022-11-30

- Fix `stopLocate` crash on null. (#330)

## **0.78** - 2022-11-03

- Dark mode support.

## **0.70** - 2020-01-08

- Use scaling instead of setting r via CSS as it's not allowed in the SVG 1.1 specification. Thanks to @KristjanESPERANTO.

## **0.69** - 2020-01-07

- Support functions for `strings.popup`. Thanks to @simon04.

## **0.64** - 2018-11-06

Thanks to @brendanheywood for the updates!

- Add support for heading.
- Modernize style. Breathing location marker.
- Use Leaflet marker.

## **0.63** - 2018-09-12

- Change default `setView` from `untilPan` to `untilPanOrZoom`.

## **0.59** - 2016-12-03

- Add `cacheLocation` option.

## **0.57, 0.58** - 2016-11-28

- Apply marker style only to markers that support it. Fixes #169

## **0.54** - 2016-09-26

- Support `flyTo`

## **0.50** - 2016-04-25

- extended `setView` to support more options
- removed `remainActive`, use `clickBehavior`
- removed `follow`, use `setView`
- removed `stopFollowingOnDrag`, use `setView`
- removed `startfollowing` and `startfollowing` events
- changed a few internal methods
- add `drawMarker`
- small fixes

## **0.46.0** - 2016-01-13

- Remove IE specific CSS

---

_Changes prior to v0.46.0 are not documented here. See the [full commit history](https://github.com/domoritz/leaflet-locatecontrol/commits/gh-pages/) for details._
