// Ephemeris THEORIES: the witnesses of the longitude observable.
//
// Vocabulary: a theory here is a total function (body, instant) → longitude
// claim, together with an honest per-body tolerance — the theory's own stated
// accuracy bound, in degrees. Theories are the WITNESSES of the memetic
// settlement in settlement.mts; their tolerances are what makes corroboration
// and refutation decidable.
//
// Two theories ship:
//
//   ANCHOR_THEORY ("meeus-standish") — the classical reference theory,
//     witnessed through @emsenn/astrology-topology's bodyLongitude. Its
//     tolerances are EPHEMERIS_PROVENANCE's own stated accuracy. This is
//     classical computation admitted as a witness, not re-derived here; the
//     README is explicit about that line.
//
//   TRUNCATED_THEORY ("truncated-frozen") — an independent in-package
//     recomputation of the same celestial mechanics, deliberately cruder:
//     the Sun by mean longitude plus a one-term equation of center; the Moon
//     by the ten largest Σl terms (evaluated through the linear-resource
//     context, each term consumed exactly once); the planets by frozen-J2000
//     Standish elements and a first-order Kepler solution. No nutation, no
//     E factor, no secular rates except mean longitude. Its tolerances price
//     those omissions honestly (verified against the classical theory in the
//     conformance tests).

import { normalizeDegrees, type Body } from "../index.mjs";
import { bodyLongitude } from "../index.mjs";
import { julianCenturies } from "../index.mjs";
import { linearSum } from "./linear.mjs";
import {
  FROZEN_PLANET_ELEMENTS,
  TRUNCATED_LUNAR_LATITUDE_SERIES,
  TRUNCATED_LUNAR_LONGITUDE_SERIES,
  type FrozenPlanetName,
  type LunarSeriesTerm,
} from "./truncated-data.mjs";

const DEGREES = Math.PI / 180;
const sinDegrees = (degrees: number): number => Math.sin(degrees * DEGREES);
const cosDegrees = (degrees: number): number => Math.cos(degrees * DEGREES);

/** A theory: an witness of the longitude observable. */
export type EphemerisTheory = Readonly<{
  /** The theory's name — the witness token carried in charge evidence. */
  name: string;
  /** The theory's own stated accuracy for `body`, degrees. */
  toleranceDegrees: (body: Body) => number;
  /** Geocentric ecliptic-of-date longitude, degrees in [0, 360). */
  longitude: (body: Body, julianDayTt: number) => number;
}>;

// ── the anchor: the classical theory as a witness ────────────────────────────

/** The classical ephemeris' stated accuracy per body, degrees
 * (EPHEMERIS_PROVENANCE: Sun/Moon ≤0.02°; planets a few arcminutes typical,
 * worst cases Jupiter ~0.11°, Saturn ~0.17°). This map is also the
 * conformance bound the experimental ephemeris is tested against. */
export const CLASSICAL_ACCURACY_DEGREES: Readonly<Record<Body, number>> = Object.freeze({
  sun: 0.02,
  moon: 0.02,
  mercury: 0.1,
  venus: 0.1,
  mars: 0.1,
  jupiter: 0.11,
  saturn: 0.17,
  uranus: 0.1,
  neptune: 0.1,
  pluto: 0.1,
});

export const ANCHOR_THEORY: EphemerisTheory = Object.freeze({
  name: "meeus-standish",
  toleranceDegrees: (body: Body) => CLASSICAL_ACCURACY_DEGREES[body],
  longitude: (body: Body, julianDayTt: number) => bodyLongitude(body, julianDayTt),
});

// ── the truncation: an independent, cruder recomputation ─────────────────────

/** The truncated theory's own stated accuracy per body, degrees — an honest
 * worst-case price of the dropped terms, verified in conformance tests. */
export const TRUNCATED_ACCURACY_DEGREES: Readonly<Record<Body, number>> = Object.freeze({
  sun: 0.05,
  moon: 0.7,
  mercury: 3,
  venus: 0.5,
  mars: 2,
  jupiter: 0.5,
  saturn: 0.5,
  uranus: 0.3,
  neptune: 0.3,
  pluto: 4,
});

function truncatedSunLongitude(T: number): number {
  const meanLongitude = 280.46646 + 36000.76983 * T;
  const meanAnomaly = 357.52911 + 35999.05029 * T;
  const center = 1.914602 * sinDegrees(meanAnomaly);
  // Constant aberration kept; nutation, T-rates, and the 2M/3M terms dropped.
  return normalizeDegrees(meanLongitude + center - 0.00569);
}

type TruncatedLunarFundamentals = Readonly<{
  meanLongitude: number;
  elongation: number;
  sunAnomaly: number;
  moonAnomaly: number;
  argumentOfLatitude: number;
}>;

function truncatedLunarFundamentals(T: number): TruncatedLunarFundamentals {
  // Linear fundamentals only: every T²⁺ polynomial term is dropped.
  return {
    meanLongitude: 218.3164477 + 481267.88123421 * T,
    elongation: 297.8501921 + 445267.1114034 * T,
    sunAnomaly: 357.5291092 + 35999.0502909 * T,
    moonAnomaly: 134.9633964 + 477198.8675055 * T,
    argumentOfLatitude: 93.272095 + 483202.0175233 * T,
  };
}

/** Sum a truncated lunar series through the linear-resource discipline:
 * each periodic term is a resource consumed exactly once. */
function truncatedLunarSeriesSum(series: readonly LunarSeriesTerm[], fundamentals: TruncatedLunarFundamentals): number {
  return linearSum(series, ([d, m, mp, f, coefficient]) =>
    coefficient *
    sinDegrees(
      d * fundamentals.elongation +
        m * fundamentals.sunAnomaly +
        mp * fundamentals.moonAnomaly +
        f * fundamentals.argumentOfLatitude,
    ),
  );
}

function truncatedMoonLongitude(T: number): number {
  const fundamentals = truncatedLunarFundamentals(T);
  const sum = truncatedLunarSeriesSum(TRUNCATED_LUNAR_LONGITUDE_SERIES, fundamentals);
  return normalizeDegrees(fundamentals.meanLongitude + sum / 1_000_000);
}

/** Truncated lunar latitude, degrees (used by tests; not part of settlement). */
export function truncatedMoonLatitude(julianDayTt: number): number {
  const fundamentals = truncatedLunarFundamentals(julianCenturies(julianDayTt));
  return truncatedLunarSeriesSum(TRUNCATED_LUNAR_LATITUDE_SERIES, fundamentals) / 1_000_000;
}

type Vector3 = readonly [number, number, number];

function frozenHeliocentric(planet: FrozenPlanetName, T: number): Vector3 {
  const elements = FROZEN_PLANET_ELEMENTS[planet];
  const meanLongitude = elements.l[0] + elements.l[1] * T;
  const meanAnomaly = normalizeDegrees(meanLongitude - elements.lonPeri);
  // First-order Kepler only: E ≈ M + (e in degrees)·sin M, no Newton steps.
  const eccentricAnomaly = meanAnomaly + (elements.e / DEGREES) * sinDegrees(meanAnomaly);
  const xOrbital = elements.a * (cosDegrees(eccentricAnomaly) - elements.e);
  const yOrbital = elements.a * Math.sqrt(1 - elements.e * elements.e) * sinDegrees(eccentricAnomaly);
  const argumentOfPerihelion = elements.lonPeri - elements.lonNode;
  const cosNode = cosDegrees(elements.lonNode);
  const sinNode = sinDegrees(elements.lonNode);
  const cosPeri = cosDegrees(argumentOfPerihelion);
  const sinPeri = sinDegrees(argumentOfPerihelion);
  const cosInclination = cosDegrees(elements.i);
  const sinInclination = sinDegrees(elements.i);
  return [
    (cosPeri * cosNode - sinPeri * sinNode * cosInclination) * xOrbital +
      (-sinPeri * cosNode - cosPeri * sinNode * cosInclination) * yOrbital,
    (cosPeri * sinNode + sinPeri * cosNode * cosInclination) * xOrbital +
      (-sinPeri * sinNode + cosPeri * cosNode * cosInclination) * yOrbital,
    sinPeri * sinInclination * xOrbital + cosPeri * sinInclination * yOrbital,
  ];
}

function truncatedPlanetLongitude(planet: FrozenPlanetName, T: number): number {
  const planetHelio = frozenHeliocentric(planet, T);
  const earthHelio = frozenHeliocentric("embary", T);
  const x = planetHelio[0] - earthHelio[0];
  const y = planetHelio[1] - earthHelio[1];
  const longitudeJ2000 = Math.atan2(y, x) / DEGREES;
  // Linear precession only; nutation dropped.
  const precession = (5029.0966 * T) / 3600;
  return normalizeDegrees(longitudeJ2000 + precession);
}

export const TRUNCATED_THEORY: EphemerisTheory = Object.freeze({
  name: "truncated-frozen",
  toleranceDegrees: (body: Body) => TRUNCATED_ACCURACY_DEGREES[body],
  longitude: (body: Body, julianDayTt: number): number => {
    const T = julianCenturies(julianDayTt);
    if (body === "sun") return truncatedSunLongitude(T);
    if (body === "moon") return truncatedMoonLongitude(T);
    return truncatedPlanetLongitude(body, T);
  },
});

/** The default witness panel of the experimental ephemeris. */
export const DEFAULT_THEORIES: readonly EphemerisTheory[] = Object.freeze([ANCHOR_THEORY, TRUNCATED_THEORY]);
