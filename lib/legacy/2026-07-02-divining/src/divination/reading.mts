// Reading: the cartomantic and numerological domain recast as a producer of a
// SignWitness panel flowing through the package's divining Reading core.
//
// This mirrors `astrology/experimental/reading` exactly. There, each ephemeris
// THEORY about a (body, instant) becomes one `SignWitness` and the panel is read
// by the core `read`; the celestial-mechanics logic is reused, never reimplemented.
// Here the same shape is applied to this domain's two practices:
//
//  - A TAROT spread is drawn by the domain's own seeded draw/spread machinery
//    (`dailySpread`/`drawCards`), and each drawn card becomes one `SignWitness`
//    keyed by the card's name. The card's ORIENTATION is the sign's polarity: a
//    card drawn UPRIGHT corroborates (a potential charge witnessed by the card),
//    a card drawn REVERSED refutes (the negation of that charge). The panel is the
//    spread read as testimony; the core `read` adjudicates it by knowledge-join.
//
//  - A NUMEROLOGICAL reduction is computed by the domain's own `reduceDate`, and
//    each step of the reduction orbit becomes one `SignWitness` keyed by that
//    step's number. The reduction computes no per-step charge, so each step
//    CORROBORATES by its number's name (per the core contract: `signing` with the
//    step's charge when the domain computes one, else `corroborating` by name).
//    A reduction agrees with itself all the way to its terminal, so it reads as an
//    affirmed (non-`stable`) diagnosis.
//
// The core's knowledge-join fold is the adjudication: a real cartomantic conflict
// (corroborating and refuting cards over the same question) is HELD at `stable`
// (⊤, "told both") — a genuine standing disagreement — while a coherent spread or
// a clean reduction settles to an affirmed diagnosis. The witnesses here are real
// drawn cards and real reduction steps, not toy tokens.

import { dailySpread, type Spread, type Orientation } from "./tarot.mjs";
import { reduceDate, type DateReduction } from "./numerology.mjs";
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
 * astrology template's `admitQuestion`. */
function admitQuestion(question: DiviningCarrier | string): DiviningCarrier {
  if (typeof question === "string") {
    return divine("divining.admit", question as DiviningToken).carrier;
  }
  return question;
}

/** The sign polarity of one drawn card: UPRIGHT corroborates, REVERSED refutes — the
 * card's name is the witness either way. This is the only domain-to-sign mapping for
 * tarot; the draw itself is the domain's `dailySpread`/`drawCards` machinery. */
function cardSign(name: string, orientation: Orientation): SignWitness {
  return orientation === "upright" ? corroborating(name) : refuting(name);
}

/**
 * The SignWitness panel for a tarot spread: one witness per drawn card, keyed by
 * the card's name, signed by its orientation. Reuses the spread the domain already
 * drew (its `positions`); no card is re-drawn and no orientation is re-decided here.
 */
export function buildSpreadPanel(spread: Spread): SignWitness[] {
  return spread.positions.map((position) => cardSign(position.card.name, position.orientation));
}

/**
 * The SignWitness panel for a numerological reduction: one witness per step of the
 * reduction orbit, keyed by that step's number. The reduction computes no per-step
 * charge, so each step corroborates by its number's name. Reuses the reduction the
 * domain already computed (its `steps`); no digit is re-summed here.
 */
export function buildReductionPanel(reduction: DateReduction): SignWitness[] {
  return reduction.steps.map((step) => corroborating(String(step)));
}

/**
 * Read a tarot spread into a Reading of the question.
 *
 * `query` is the draw: either an already-drawn `Spread` (passed through), or an ISO
 * date string, in which case the domain's seeded `dailySpread` draws the day's card.
 * The question is admitted through `divine` when a string, or accepted as a carrier.
 * The reading is taken at `cut(spread.date)` — the spread's own instant.
 *
 * A spread whose cards point both ways over the same question — an upright card
 * corroborating while a reversed card refutes — puts opposing witnesses in the
 * panel; the core's knowledge-join holds that as a `stable` diagnosis
 * (holdsContradiction === true): a real cartomantic conflict, held local and stable,
 * not collapsed. A spread that reads one way settles to an affirmed diagnosis.
 */
export function readSpread(query: Spread | string, question: DiviningCarrier | string): Reading {
  const spread = typeof query === "string" ? dailySpread(query) : query;
  const carrier = admitQuestion(question);
  const panel = buildSpreadPanel(spread);
  return read(carrier, cut(spread.date), panel);
}

/**
 * Read a numerological reduction into a Reading of the question.
 *
 * `dateOrNumber` is reduced by the domain's own `reduceDate` (which reduces the
 * digits of any string — an ISO date or a number rendered as a string). The
 * question is admitted through `divine` when a string, or accepted as a carrier.
 * The reading is taken at `cut(reduction.date)` — the reduced value's label.
 *
 * Every step of a reduction agrees toward the terminal, so the panel is all
 * corroboration: the reading settles to an affirmed (non-`stable`) diagnosis, the
 * numerological reduction read through the same core that adjudicates the spread.
 */
export function readReduction(dateOrNumber: string | number, question: DiviningCarrier | string): Reading {
  const reduction = reduceDate(String(dateOrNumber));
  const carrier = admitQuestion(question);
  const panel = buildReductionPanel(reduction);
  return read(carrier, cut(reduction.date), panel);
}
