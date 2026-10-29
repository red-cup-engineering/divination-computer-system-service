// Numerical tables for the TRUNCATED ephemeris theory.
//
// These are deliberate truncations of the same celestial mechanics the
// classical ephemeris uses, kept small so the truncated theory is a genuinely
// different (cruder) witness:
//
//   TRUNCATED_LUNAR_LONGITUDE_SERIES — the ten largest terms of the Meeus
//     ch. 47 Σl table (the classical theory carries 59 plus three additives).
//   TRUNCATED_LUNAR_LATITUDE_SERIES — the six largest terms of Σb.
//   FROZEN_PLANET_ELEMENTS — the Standish J2000 element VALUES with only the
//     mean-longitude rate retained; all other secular rates dropped.
//
// Entries of the lunar series are [D, M, M', F, coefficient], coefficients in
// 1e-6 degrees, same convention as the classical tables. The truncated theory
// also drops the E eccentricity factor, nutation, and all T²⁺ polynomial
// terms; its per-body tolerance claims in theories.mts price those omissions.

export type LunarSeriesTerm = readonly [number, number, number, number, number];

export const TRUNCATED_LUNAR_LONGITUDE_SERIES: readonly LunarSeriesTerm[] = Object.freeze([
  [0, 0, 1, 0, 6288774],
  [2, 0, -1, 0, 1274027],
  [2, 0, 0, 0, 658314],
  [0, 0, 2, 0, 213618],
  [0, 1, 0, 0, -185116],
  [0, 0, 0, 2, -114332],
  [2, 0, -2, 0, 58793],
  [2, -1, -1, 0, 57066],
  [2, 0, 1, 0, 53322],
  [2, -1, 0, 0, 45758],
]);

export const TRUNCATED_LUNAR_LATITUDE_SERIES: readonly LunarSeriesTerm[] = Object.freeze([
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
]);

export type FrozenPlanetName =
  | "mercury"
  | "venus"
  | "embary"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type FrozenElements = Readonly<{
  /** Semi-major axis at J2000, au. */
  a: number;
  /** Eccentricity at J2000. */
  e: number;
  /** Inclination at J2000, degrees. */
  i: number;
  /** Mean longitude, degrees: [value at J2000, rate per Julian century]. */
  l: readonly [number, number];
  /** Longitude of perihelion at J2000, degrees. */
  lonPeri: number;
  /** Longitude of the ascending node at J2000, degrees. */
  lonNode: number;
}>;

const frozen = (record: FrozenElements): FrozenElements => Object.freeze(record);

/** Standish Table 1 element values, frozen at J2000 except the mean longitude. */
export const FROZEN_PLANET_ELEMENTS: Readonly<Record<FrozenPlanetName, FrozenElements>> = Object.freeze({
  mercury: frozen({ a: 0.38709927, e: 0.20563593, i: 7.00497902, l: [252.2503235, 149472.67411175], lonPeri: 77.45779628, lonNode: 48.33076593 }),
  venus: frozen({ a: 0.72333566, e: 0.00677672, i: 3.39467605, l: [181.9790995, 58517.81538729], lonPeri: 131.60246718, lonNode: 76.67984255 }),
  embary: frozen({ a: 1.00000261, e: 0.01671123, i: -0.00001531, l: [100.46457166, 35999.37244981], lonPeri: 102.93768193, lonNode: 0 }),
  mars: frozen({ a: 1.52371034, e: 0.0933941, i: 1.84969142, l: [-4.55343205, 19140.30268499], lonPeri: -23.94362959, lonNode: 49.55953891 }),
  jupiter: frozen({ a: 5.202887, e: 0.04838624, i: 1.30439695, l: [34.39644051, 3034.74612775], lonPeri: 14.72847983, lonNode: 100.47390909 }),
  saturn: frozen({ a: 9.53667594, e: 0.05386179, i: 2.48599187, l: [49.95424423, 1222.49362201], lonPeri: 92.59887831, lonNode: 113.66242448 }),
  uranus: frozen({ a: 19.18916464, e: 0.04725744, i: 0.77263783, l: [313.23810451, 428.48202785], lonPeri: 170.9542763, lonNode: 74.01692503 }),
  neptune: frozen({ a: 30.06992276, e: 0.00859048, i: 1.77004347, l: [-55.12002969, 218.45945325], lonPeri: 44.96476227, lonNode: 131.78422574 }),
  pluto: frozen({ a: 39.48211675, e: 0.2488273, i: 17.14001206, l: [238.92903833, 145.20780515], lonPeri: 224.06891629, lonNode: 110.30393684 }),
});
