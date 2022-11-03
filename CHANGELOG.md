# Changelog

Here we document breaking changes.

## **0.78**

- Dark mode support.

## **0.70**

- Use scaling instead of setting r via CSS as it's not allowed in the SVG 1.1 specification. Thanks to @KristjanESPERANTO.

## **0.69**

- Support functions for `strings.popup`. Thanks to @simon04.

## **0.64**

Thanks to @brendanheywood for the updates!

- Add support for heading.
- Modernize style. Breathing location marker.
- Use Leaflet marker.

## **0.63**

- Change default `setView` from `untilPan` to `untilPanOrZoom`.

## **0.59**

- Add `cacheLocation` option.

## **0.57, 0.58**

- Apply marker style only to markers that support it. Fixes #169

## **0.54**

- Support `flyTo`

## **0.50**

- extended `setView` to support more options
- removed `remainActive`, use `clickBehavior`
- removed `follow`, use `setView`
- removed `stopFollowingOnDrag`, use `setView`
- removed `startfollowing` and `startfollowing` events
- changed a few internal methods
- add `drawMarker`
- small fixes

## **0.46.0**

- Remove IE specific CSS
