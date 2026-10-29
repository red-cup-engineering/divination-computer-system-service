// Reading: the Elder Futhark cast recast as a SignWitness panel flowing through
// the package's divining Reading core.
//
// This mirrors `divination/reading.mts` (the tarot reading) exactly. There each
// drawn card becomes one `SignWitness` keyed by the card's name, its ORIENTATION
// the sign's polarity, and the panel is read by the core `read`; the seeded draw
// machinery is reused, never reimplemented. Here the same shape is applied to a
// rune cast:
//
//  - A CAST is drawn by the domain's own seeded `castRunes` machinery, and each
//    drawn rune becomes one `SignWitness` keyed by the rune's name. The rune's
//    ORIENTATION is the sign's polarity: a rune drawn UPRIGHT corroborates (a
//    potential charge witnessed by the rune), a rune drawn REVERSED refutes (the
//    negation of that charge). A NON-INVERTIBLE rune is always drawn upright (it
//    has no distinct reversed reading) and so always corroborates — the draw
//    already forces this, so it falls out of the same upright→corroborating rule
//    with no special case here.
//
// The core's knowledge-join fold is the adjudication: a cast whose runes point
// both ways over the same question (an upright rune corroborating while a
// reversed rune refutes) is HELD at `stable` (⊤, "told both") — a genuine
// standing disagreement — while a cast of all-upright (or all-reversed) runes
// settles to an affirmed diagnosis. The witnesses here are real drawn runes,
// not toy tokens.

import { castRunes, type Cast, type Orientation } from "./runes.mjs";
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
} from "../index.mjs";

/** Admit a question that may be a raw string (a boundary token, admitted through
 * `divine`) or an already-admitted DiviningCarrier (passed through) — exactly the
 * tarot reading's `admitQuestion`. */
function admitQuestion(question: DiviningCarrier | string): DiviningCarrier {
  if (typeof question === "string") {
    return divine("divining.admit", question as DiviningToken).carrier;
  }
  return question;
}

/** The sign polarity of one drawn rune: UPRIGHT corroborates, REVERSED refutes —
 * the rune's name is the witness either way. This is the only domain-to-sign
 * mapping for runes; the cast itself is the domain's seeded `castRunes` machinery,
 * which already forces non-invertible runes upright (so they corroborate). */
function runeSign(name: string, orientation: Orientation): SignWitness {
  return orientation === "upright" ? corroborating(name) : refuting(name);
}

/**
 * The SignWitness panel for a rune cast: one witness per drawn rune, keyed by the
 * rune's name, signed by its orientation. Reuses the cast the domain already drew
 * (its `drawn`); no rune is re-cast and no orientation is re-decided here.
 */
export function buildCastPanel(cast: Cast): SignWitness[] {
  return cast.drawn.map((drawnRune) => runeSign(drawnRune.rune, drawnRune.orientation));
}

/**
 * The SignWitness panel for a query: cast the runes deterministically from the
 * query string, then project the cast to signs. One panel per query.
 */
export function buildPanel(query: string, count?: number): SignWitness[] {
  return buildCastPanel(castRunes(query, count));
}

/**
 * Read a rune cast into ONE Reading of the question.
 *
 * `query` is the cast: either an already-drawn `Cast` (passed through), or a
 * query string, in which case the domain's seeded `castRunes` draws the runes.
 * The question is admitted through `divine` when a string, or accepted as a
 * carrier. The reading is taken at `cut(cast.date)` — the cast's own query label.
 *
 * A cast whose runes point both ways over the same question — an upright rune
 * corroborating while a reversed rune refutes — puts opposing witnesses in the
 * panel; the core's knowledge-join holds that as a `stable` diagnosis
 * (holdsContradiction === true): a real divinatory conflict, held local and
 * stable, not collapsed. A cast that reads one way settles to an affirmed
 * diagnosis. Either way the whole cast settles to one Reading.
 */
export function readCast(
  query: Cast | string,
  question: DiviningCarrier | string,
  count?: number,
): Reading {
  const cast = typeof query === "string" ? castRunes(query, count) : query;
  const carrier = admitQuestion(question);
  const panel = buildCastPanel(cast);
  return read(carrier, cut(cast.date), panel);
}
