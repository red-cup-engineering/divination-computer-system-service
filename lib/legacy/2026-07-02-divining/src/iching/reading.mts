// Reading: the I Ching cast recast as a SignWitness panel flowing through the
// package's divining Reading core.
//
// This mirrors `astrology/experimental/reading` and `divination/reading` exactly:
// the domain's own seeded machinery (`castIChing`) produces the cast, and each cast
// LINE becomes one `SignWitness` keyed by its position; the whole six-line panel is
// adjudicated by the core `read`. The cast logic is reused, never reimplemented here.
//
// The FOUR-corner sign mapping is the heart of this practice — a line's value in
// {6,7,8,9} is exactly a FOUR-valued reading of that line:
//
//   7 young-yang → CORROBORATING  (a settled present affirmation: solid, held)
//   8 young-yin  → REFUTING       (a settled present negation:   broken, held)
//   9 old-yang and 6 old-yin → SIGNING(`line${i}:changing`, a STABLE/⊤ charge)
//
// The changing lines (6 and 9) are the both/transforming corner: a line that is
// "told both" — present yang becoming yin, or yin becoming yang. They are signed with
// an explicit STABLE (⊤knowledge, "told both") charge so the core reads them as the
// held-contradiction corner. And they are EXACTLY where present→future happens: the
// changing lines turn the present hexagram into the future hexagram (diagnosis →
// prediction). So a panel's changing lines are what realize the core's σ-dual present
// → future — the diagnosis (the held present, the young lines) is carried to the
// prediction (the reach toward the not-yet) precisely through the stable changing
// lines. A cast with NO changing lines is a stable, unmoving present (all young); a
// cast with changing lines holds a transformation, surfaced by the core as
// `holdsContradiction` (a stable diagnosis) when the changing lines dominate.

import {
  corroborating,
  refuting,
  signing,
  cut,
  read as coreRead,
  divine,
  type SignWitness,
  type Reading,
  type DiviningCarrier,
  type DiviningToken,
} from "../index.mjs";
import { witnessedPotential, negate, mark, joinKnowledge, type ChargeCarrier } from "@emsenn/relating";
import { castIChing, type Cast, type CastLine } from "./iching.mjs";

/** Admit a question that may be a raw string (a boundary token, admitted through
 * `divine`) or an already-admitted DiviningCarrier (passed through) — exactly the
 * astrology/tarot template's `admitQuestion`. */
function admitQuestion(question: DiviningCarrier | string): DiviningCarrier {
  if (typeof question === "string") {
    return divine("divining.admit", question as DiviningToken).carrier;
  }
  return question;
}

/** The STABLE/⊤ ("told both") charge a changing line carries: the knowledge-join of a
 * witnessed potential and its negation over the same witness — both affirmed and
 * denied, the both/transforming corner. This is the literal bilattice ⊤knowledge that
 * the core's `cognize` reads as the `stable` standing. */
function changingCharge(witness: string): ChargeCarrier {
  const w = mark(witness);
  return joinKnowledge(witnessedPotential(w), negate(witnessedPotential(w)));
}

/**
 * The SignWitness for one cast line, by the FOUR-corner mapping:
 *  - young-yang (7) corroborates by its position,
 *  - young-yin  (8) refutes by its position,
 *  - the changing lines old-yang (9) and old-yin (6) sign `line${i}:changing` with a
 *    STABLE/⊤ charge — the both/transforming corner where present→future happens.
 * Keyed by the line's 1..6 position so each of the six lines is a distinct witness.
 */
function lineSign(line: CastLine): SignWitness {
  const key = `line${line.position}`;
  if (line.changing) {
    return signing(`${key}:changing`, changingCharge(`${key}:${line.value}`));
  }
  return line.polarity === "yang" ? corroborating(key) : refuting(key);
}

/**
 * The SignWitness panel for a cast: one witness per cast line, keyed by position,
 * signed by the FOUR-corner mapping. Reuses the six lines the domain already cast (its
 * `lines`); no line is re-drawn here. The whole six-line panel settles to ONE Reading.
 */
export function buildCastPanel(cast: Cast): SignWitness[] {
  return cast.lines.map(lineSign);
}

/** Build the SignWitness panel directly from a query string: cast, then panel. */
export function buildPanel(query: string): SignWitness[] {
  return buildCastPanel(castIChing(query));
}

/**
 * Read an I Ching consultation into a Reading of the question.
 *
 * `query` is the consultation's seed string; the domain's deterministic `castIChing`
 * casts the six lines, and the panel is the cast's FOUR-corner signs. The question is
 * admitted through `divine` when a string, or accepted as a carrier. The reading is
 * taken at `cut(query)` — the cast's own label (its seed is its identity), so the
 * whole six-line panel settles to ONE verdict.
 *
 * A cast of all young lines (no transformation) is a coherent present and settles to
 * an affirmed diagnosis; a cast with changing lines puts STABLE/⊤ witnesses in the
 * panel — the both/transforming corner — and the core's knowledge-join can hold the
 * whole reading at `stable` (holdsContradiction === true): the present is in motion,
 * and that motion is exactly the σ-dual present→future the prediction pole reaches.
 */
export function read(query: string, question: DiviningCarrier | string): Reading {
  const cast = castIChing(query);
  const carrier = admitQuestion(question);
  const panel = buildCastPanel(cast);
  return coreRead(carrier, cut(cast.label), panel);
}
