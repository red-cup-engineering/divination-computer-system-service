// Settlement: the longitude observable as a settled memetic charge.
//
// Vocabulary (the substrate's, used in its formal sense):
//   claim      — one theory's assertion of a longitude for (body, instant),
//                carrying the theory's own tolerance.
//   witness    — a theory name riding in a Charge's evidence carriers.
//   charge     — the Relationality bilattice word: truth/falsity coordinates
//                over Belnap FOUR plus lossless evidence accumulation.
//   adjudication — the knowledge-join fold of every theory's testimony about
//                one claim: self-affirmation (`potential`), corroboration
//                (another theory's compatible claim, joined positively) and
//                refutation (an incompatible claim, joined through `negate`).
//   settlement — the per-(body, instant) fixed point of that fold (the fold
//                is a finite knowledge-join, so one pass IS the fixed point:
//                joining any testimony again changes nothing), plus the
//                selection of the representative claim.
//
// Paraconsistency, concretely: when theories disagree beyond their joint
// tolerance, the refuted claim's charge becomes STABLE (⊤ — told both). The
// contradiction is HELD in that one cell's charge — both value bits set, both
// evidence sides populated — and does not propagate to any other cell. There
// is no explosion; settlement still selects a representative.
//
// Selection (the only rule that is ours rather than the substrate's, stated
// honestly): prefer claims whose folded charge is `potential` (affirmed,
// never refuted), narrowest tolerance first; if every claim is `stable`,
// prefer the greatest evidence margin (positive witnesses minus negative),
// then the narrowest tolerance. With honest tolerances the classical answer
// emerges as the settled charge: the anchor theory's claim is corroborated by
// the truncation and carries the narrowest tolerance.

import { BODIES, normalizeDegrees, type Body } from "../index.mjs";
import { julianDayFromIso, terrestrialJulianDay } from "../index.mjs";
import {
  articulate,
  fixedPointReadings,
  fixedPoints,
  joinKnowledge,
  mark,
  negate,
  posit,
  predicate,
  predicationSite,
  sectionOf,
  utterance,
  valueOf,
  witnessedPotential,
  type ChargeCarrier,
  type ChargeValueName,
  type SectionCarrier,
  type UtteranceCarrier,
} from "@emsenn/relating";
import { DEFAULT_THEORIES, type EphemerisTheory } from "./theories.mjs";

/** Fixed-point readings over an utterance log. Ported from the substrate's former
 *  `fixedPointReadingsOfUtterances`, which collapsed on the new line into these
 *  primitives: the relating descent (articulate → predicate) folded across the
 *  log into one predication site, posited, fixed-pointed, then read. */
function fixedPointReadingsOfUtterances(log: readonly UtteranceCarrier[]) {
  if (log.length === 0) throw new TypeError("fixedPointReadingsOfUtterances: at least one utterance is required");
  const generated = log.map((carrier) => predicate(articulate(carrier)));
  const predicated = predicationSite(generated.flatMap((site) => [...site.cells.cells, ...site.specializations]));
  return fixedPointReadings(fixedPoints(posit(predicated)));
}

type Charge = ChargeCarrier;
type MemeChargeValue = ChargeValueName;

const potential = (witness: string): Charge => witnessedPotential(mark(witness));
const memeChargeValueOf = (charge: Charge): MemeChargeValue => valueOf(charge).name;

/** One theory's longitude assertion for (body, instant). */
export type LongitudeClaim = Readonly<{
  theory: string;
  body: Body;
  julianDayTt: number;
  /** Asserted geocentric ecliptic-of-date longitude, degrees in [0, 360). */
  longitude: number;
  /** The asserting theory's own accuracy bound, degrees. */
  toleranceDegrees: number;
}>;

/** A claim with its fully folded charge: a meme of the settlement. */
export type AdjudicatedClaim = Readonly<{
  claim: LongitudeClaim;
  /** The knowledge-join of every theory's testimony about this claim. */
  charge: Charge;
  chargeValue: MemeChargeValue;
  /** Theories whose claims are compatible with this one (positive evidence). */
  corroborators: readonly string[];
  /** Theories whose claims contradict this one (negative evidence). */
  refuters: readonly string[];
}>;

/** The settled state of one (body, instant) cell. */
export type BodySettlement = Readonly<{
  body: Body;
  julianDayTt: number;
  claims: readonly AdjudicatedClaim[];
  /** The selected representative claim. */
  selected: LongitudeClaim;
  /** The settled longitude — the selected claim's asserted value. */
  longitude: number;
  /** How many claims settled STABLE (⊤): contradictions held, not exploded. */
  contradictionsHeld: number;
}>;

/** Arc distance on the circle R/360°, degrees in [0, 180]. */
export function circularDistanceDegrees(a: number, b: number): number {
  const difference = normalizeDegrees(a - b);
  return difference > 180 ? 360 - difference : difference;
}

/** Two claims are compatible when their values agree within their joint tolerance. */
function compatible(a: LongitudeClaim, b: LongitudeClaim): boolean {
  return circularDistanceDegrees(a.longitude, b.longitude) <= a.toleranceDegrees + b.toleranceDegrees;
}

/** Settle one (body, instant) cell over a panel of theory-witnesses. */
export function settleBody(
  body: Body,
  julianDayTt: number,
  theories: readonly EphemerisTheory[] = DEFAULT_THEORIES,
): BodySettlement {
  if (theories.length === 0) throw new TypeError("settleBody: at least one theory-witness is required");
  const claims: LongitudeClaim[] = theories.map((theory) =>
    Object.freeze({
      theory: theory.name,
      body,
      julianDayTt,
      longitude: theory.longitude(body, julianDayTt),
      toleranceDegrees: theory.toleranceDegrees(body),
    }),
  );

  const adjudicated: AdjudicatedClaim[] = claims.map((claim) => {
    // Self-affirmation: the asserting theory witnesses its own claim.
    let charge: Charge = potential(claim.theory);
    const corroborators: string[] = [];
    const refuters: string[] = [];
    for (const other of claims) {
      if (other.theory === claim.theory) continue;
      if (compatible(claim, other)) {
        corroborators.push(other.theory);
        charge = joinKnowledge(charge, potential(other.theory));
      } else {
        refuters.push(other.theory);
        charge = joinKnowledge(charge, negate(potential(other.theory)));
      }
    }
    return Object.freeze({
      claim,
      charge,
      chargeValue: memeChargeValueOf(charge),
      corroborators: Object.freeze(corroborators),
      refuters: Object.freeze(refuters),
    });
  });

  const selected = selectRepresentative(adjudicated);
  return Object.freeze({
    body,
    julianDayTt,
    claims: Object.freeze(adjudicated),
    selected: selected.claim,
    longitude: selected.claim.longitude,
    contradictionsHeld: adjudicated.filter((a) => memeChargeValueOf(a.charge) === "stable").length,
  });
}

function selectRepresentative(adjudicated: readonly AdjudicatedClaim[]): AdjudicatedClaim {
  const consistent = adjudicated.filter((a) => a.chargeValue === "potential");
  if (consistent.length > 0) {
    return [...consistent].sort((a, b) => a.claim.toleranceDegrees - b.claim.toleranceDegrees)[0]!;
  }
  // Every claim is stable (⊤): adjudicate on the carried evidence.
  const margin = (a: AdjudicatedClaim): number => a.charge.evidence[0].length - a.charge.evidence[1].length;
  return [...adjudicated].sort(
    (a, b) => margin(b) - margin(a) || a.claim.toleranceDegrees - b.claim.toleranceDegrees,
  )[0]!;
}

/** The settled longitude of a body at a TT Julian day — the experimental
 * counterpart of the classical `bodyLongitude`. */
export function settledBodyLongitude(
  body: Body,
  julianDayTt: number,
  theories: readonly EphemerisTheory[] = DEFAULT_THEORIES,
): number {
  return settleBody(body, julianDayTt, theories).longitude;
}

// ── the settled chart ─────────────────────────────────────────────────────────

const SPEED_STEP_DAYS: Readonly<Record<Body, number>> = Object.freeze({
  sun: 0.25,
  moon: 0.05,
  mercury: 0.25,
  venus: 0.25,
  mars: 0.5,
  jupiter: 1,
  saturn: 1,
  uranus: 2,
  neptune: 2,
  pluto: 2,
});

/** dLongitude/dt of the settled longitude, degrees/day (central difference). */
export function settledBodySpeed(
  body: Body,
  julianDayTt: number,
  theories: readonly EphemerisTheory[] = DEFAULT_THEORIES,
): number {
  const step = SPEED_STEP_DAYS[body];
  const before = settledBodyLongitude(body, julianDayTt - step, theories);
  const after = settledBodyLongitude(body, julianDayTt + step, theories);
  let difference = after - before;
  if (difference > 180) difference -= 360;
  if (difference < -180) difference += 360;
  return difference / (2 * step);
}

export const EXPERIMENTAL_PROVENANCE = Object.freeze({
  algorithm:
    "memetic-settlement(meeus-standish anchor witness + truncated-frozen witness; bilattice adjudication, knowledge-join fold)",
  accuracy:
    "Conformant to @emsenn/astrology-topology within its own stated accuracy: with honest tolerances the settled longitude is the anchor theory's value (Sun/Moon ≤0.02°, planets a few arcminutes; Jupiter ~0.11°, Saturn ~0.17°).",
});

export type SettledBodyState = Readonly<{
  longitude: number;
  /** dLongitude/dt in degrees per day; negative is apparent retrograde. */
  speed: number;
  /** The full settlement record the state was read from. */
  settlement: BodySettlement;
}>;

export type SettledChart = Readonly<{
  time: string;
  julianDay: number;
  bodies: Readonly<Record<Body, SettledBodyState>>;
  /** Total contradictions held across all bodies' claims. */
  contradictionsHeld: number;
  provenance: typeof EXPERIMENTAL_PROVENANCE;
}>;

/** The experimental ephemeris as a chart of settled longitudes. */
export function computeSettledChart(
  isoUtc: string,
  theories: readonly EphemerisTheory[] = DEFAULT_THEORIES,
): SettledChart {
  const julianDayTt = terrestrialJulianDay(julianDayFromIso(isoUtc));
  const states = {} as Record<Body, SettledBodyState>;
  let contradictionsHeld = 0;
  for (const body of BODIES) {
    const settlement = settleBody(body, julianDayTt, theories);
    contradictionsHeld += settlement.contradictionsHeld;
    states[body] = Object.freeze({
      longitude: settlement.longitude,
      speed: settledBodySpeed(body, julianDayTt, theories),
      settlement,
    });
  }
  return Object.freeze({
    time: isoUtc,
    julianDay: julianDayTt,
    bodies: Object.freeze(states),
    contradictionsHeld,
    provenance: EXPERIMENTAL_PROVENANCE,
  });
}

// ── the settlement as a sheaf of memes ───────────────────────────────────────

/** Articulate a settlement's claims as utterances and return the knowledge-least
 * section derived by Relationality. The carrier descends through Mark and
 * Utterance first; the section is the settled topology reading of those
 * utterances, not an independently admitted DTO. */
export function settlementSheaf(settlements: readonly BodySettlement[]): SectionCarrier {
  const utterances: UtteranceCarrier[] = [];
  for (const settlement of settlements) {
    const subject = `${settlement.body}@${settlement.julianDayTt}`;
    for (const { claim } of settlement.claims) {
      utterances.push(utterance(mark(subject), mark({
        predicate: "claims-longitude",
        theory: claim.theory,
        longitude: claim.longitude,
        toleranceDegrees: claim.toleranceDegrees,
      })));
    }
    utterances.push(utterance(mark(subject), mark({
      predicate: "settled-longitude",
      longitude: settlement.longitude,
    })));
  }
  return sectionOf(fixedPointReadingsOfUtterances(utterances).knowledgeLeast);
}
