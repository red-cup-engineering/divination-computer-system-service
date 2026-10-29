// Reading: the ephemeris settlement recast as a SignWitness panel flowing
// through the package's divining Reading core.
//
// settlement.mts adjudicates a panel of ephemeris THEORIES about each
// (body, instant) longitude with the relating bilattice directly. This module
// reuses exactly that celestial-mechanics + tolerance logic — settleBody and the
// DEFAULT_THEORIES — but instead of folding charges in-package, it emits one
// `SignWitness` per theory (corroborating when the theory's claim is compatible
// with the panel, refuting when it is beyond joint tolerance) and hands the panel
// to the core `read`. The core's knowledge-join fold is the same adjudication, so
// a real cross-theory disagreement beyond tolerance reads as a `stable` diagnosis
// (⊤, "told both") — exactly the cell settlement.mts counted in contradictionsHeld.
//
// The ephemeris is the canonical instance proving the Reading core against real
// signs: the witnesses here are computed celestial longitudes, not toy tokens.

import { BODIES, type Body } from "../index.mjs";
import { julianDayFromIso, terrestrialJulianDay } from "../index.mjs";
import {
  corroborating,
  refuting,
  cut,
  read,
  divine,
  type SignWitness,
  type Reading,
  type DiviningCarrier,
  type DiviningToken,
} from "../../index.mjs";
import { settleBody } from "./settlement.mjs";
import { DEFAULT_THEORIES, type EphemerisTheory } from "./theories.mjs";

/** Admit a question that may be a raw string (a boundary token, admitted through
 * `divine`) or an already-admitted DiviningCarrier (passed through). */
function admitQuestion(question: DiviningCarrier | string): DiviningCarrier {
  if (typeof question === "string") {
    return divine("divining.admit", question as DiviningToken).carrier;
  }
  return question;
}

/**
 * The SignWitness panel for one (body, instant): one witness per theory.
 *
 * settleBody folds the same theories' claims by knowledge-join; we reuse its
 * adjudication to decide each theory's sign. A theory CORROBORATES when its claim
 * is compatible with the panel — concretely, when its adjudicated charge never
 * took a refutation, i.e. it carries no refuters (its claim agreed with every
 * other claim within joint tolerance). A theory REFUTES when its claim is beyond
 * joint tolerance of some other claim (it has refuters / its charge went stable).
 *
 * This is the same compat test settlement.mts runs — imported through settleBody,
 * never reimplemented — projected onto the core's corroborating/refuting signs.
 */
export function buildBodyPanel(
  body: Body,
  julianDayTt: number,
  theories: readonly EphemerisTheory[] = DEFAULT_THEORIES,
): SignWitness[] {
  const settlement = settleBody(body, julianDayTt, theories);
  return settlement.claims.map((adjudicated) =>
    adjudicated.refuters.length === 0
      ? corroborating(adjudicated.claim.theory)
      : refuting(adjudicated.claim.theory),
  );
}

/**
 * Read one body at an instant: admit the question, build the body's theory panel
 * for that instant, and read the panel through the core `read` at `cut(isoUtc)`.
 *
 * A genuine cross-theory ephemeris disagreement beyond tolerance puts a refuting
 * witness in the panel against the corroborating ones; the core's knowledge-join
 * holds that as a `stable` diagnosis (holdsContradiction === true) — the same
 * contradiction settlement.mts held in its cell, now read through divining.
 */
export function readBody(
  body: Body,
  isoUtc: string,
  question: DiviningCarrier | string,
  theories: readonly EphemerisTheory[] = DEFAULT_THEORIES,
): Reading {
  const carrier = admitQuestion(question);
  const julianDayTt = terrestrialJulianDay(julianDayFromIso(isoUtc));
  const panel = buildBodyPanel(body, julianDayTt, theories);
  return read(carrier, cut(isoUtc), panel);
}

/**
 * Read the whole chart at an instant: a Reading per body, each over its own
 * theory panel, all taken at the same cut and against the same admitted question.
 */
export function readChart(
  isoUtc: string,
  question: DiviningCarrier | string,
  theories: readonly EphemerisTheory[] = DEFAULT_THEORIES,
): Record<Body, Reading> {
  const carrier = admitQuestion(question);
  const julianDayTt = terrestrialJulianDay(julianDayFromIso(isoUtc));
  const c = cut(isoUtc);
  const readings = {} as Record<Body, Reading>;
  for (const body of BODIES) {
    readings[body] = read(carrier, c, buildBodyPanel(body, julianDayTt, theories));
  }
  return readings;
}
