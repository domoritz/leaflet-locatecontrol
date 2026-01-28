import { Control, Layer, Map, ControlOptions, PathOptions, MarkerOptions, LocationEvent, LatLngBounds, LocateOptions as LeafletLocateOptions } from "leaflet";

export type SetView = false | "once" | "always" | "untilPan" | "untilPanOrZoom";

/**
 * Event fired when a location is found by the locate control.
 * Extends Leaflet's LocationEvent with a reference to the control instance.
 */
export interface LocateLocationFoundEvent extends LocationEvent {
  /** Reference to the locate control instance */
  control: LocateControl;
}

export type ClickBehavior = "stop" | "setView";

export interface StringsOptions {
  title?: string | undefined;
  text?: string | undefined;
  metersUnit?: string | undefined;
  feetUnit?: string | undefined;
  popup?: string | undefined;
  outsideMapBoundsMsg?: string | undefined;
}

export interface ClickBehaviorOptions {
  inView?: ClickBehavior | undefined;
  outOfView?: ClickBehavior | undefined;
  inViewNotFollowing?: ClickBehavior | "inView" | undefined;
}

export interface LocateOptions extends ControlOptions {
  layer?: Layer | undefined;
  setView?: SetView | undefined;
  keepCurrentZoomLevel?: boolean | undefined;
  initialZoomLevel?: number | boolean | undefined;
  getLocationBounds?: ((locationEvent: LocationEvent) => LatLngBounds) | undefined;
  flyTo?: boolean | undefined;
  clickBehavior?: ClickBehaviorOptions | undefined;
  returnToPrevBounds?: boolean | undefined;
  cacheLocation?: boolean | undefined;
  drawCircle?: boolean | undefined;
  drawMarker?: boolean | undefined;
  showCompass?: boolean | undefined;
  markerClass?: any;
  compassClass?: any;
  circleStyle?: PathOptions | undefined;
  markerStyle?: PathOptions | MarkerOptions | undefined;
  compassStyle?: PathOptions | undefined;
  followCircleStyle?: PathOptions | undefined;
  followMarkerStyle?: PathOptions | undefined;
  icon?: string | undefined;
  iconLoading?: string | undefined;
  iconElementTag?: string | undefined;
  textElementTag?: string | undefined;
  circlePadding?: number[] | undefined;
  metric?: boolean | undefined;
  createButtonCallback?: ((container: HTMLDivElement, options: LocateOptions) => { link: HTMLAnchorElement; icon: HTMLElement }) | undefined;
  onLocationError?: ((event: ErrorEvent, control: LocateControl) => void) | undefined;
  onLocationOutsideMapBounds?: ((control: LocateControl) => void) | undefined;
  showPopup?: boolean | undefined;
  strings?: StringsOptions | undefined;
  locateOptions?: LeafletLocateOptions | undefined;
}

export class LocateControl extends Control {
  constructor(locateOptions?: LocateOptions);

  onAdd(map: Map): HTMLElement;

  onRemove(): void;

  start(): void;

  stop(): void;

  stopFollowing(): void;

  setView(): void;
}
