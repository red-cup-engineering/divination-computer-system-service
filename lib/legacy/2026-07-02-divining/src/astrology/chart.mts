// Charts: the carrier for a moment's sky.
//
// Vocabulary: a Body is one of the eleven members of the astrological
// septenary-plus-moderns (Sun through Pluto). A BodyState is a body's
// geocentric ecliptic coordinates of date — longitude and latitude on the
// circle, plus the longitude's time-derivative, whose sign carries apparent
// motion. A Chart is a finite map from bodies to states at one instant,
// stamped with the provenance of the computation that witnessed it.
//
// Motion is a three-valued reading of the derivative, not a boolean: a body
// within the stationary band is neither direct nor retrograde.

export type Body =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export const BODIES: readonly Body[] = Object.freeze([
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
]);

export const BODY_GLYPHS: Readonly<Record<Body, string>> = Object.freeze({
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
});

export type BodyState = Readonly<{
  /** Geocentric ecliptic longitude of date, degrees in [0, 360). */
  longitude: number;
  /** Geocentric ecliptic latitude, degrees. */
  latitude: number;
  /** dLongitude/dt in degrees per day; negative is apparent retrograde. */
  speed: number;
}>;

export type Motion = "direct" | "stationary" | "retrograde";

/** Below this |speed| (degrees/day) a body reads as stationary. */
export const STATIONARY_BAND = 0.003;

export function motionOf(state: Pick<BodyState, "speed">): Motion {
  if (Math.abs(state.speed) <= STATIONARY_BAND) return "stationary";
  return state.speed > 0 ? "direct" : "retrograde";
}

export type ChartProvenance = Readonly<{
  /** Name of the computation that produced the states. */
  algorithm: string;
  /** Honest accuracy claims, per body class, in the algorithm's own terms. */
  accuracy: string;
}>;

export type Chart = Readonly<{
  /** The instant, as an ISO 8601 UTC timestamp. */
  time: string;
  /** Julian day (terrestrial time) the states were evaluated at. */
  julianDay: number;
  bodies: Readonly<Record<Body, BodyState>>;
  provenance: ChartProvenance;
}>;
