/**
 * numogram/reading — the numomantic cast recast as a SignWitness panel flowing through
 * the package's divining Reading core.
 *
 * This mirrors `astrology/experimental/reading` and `divination/reading`: the domain's
 * own deterministic cast (`castNumogram`) is computed once, and each structural fact of
 * the cast becomes ONE `SignWitness`. The four-corner sign mapping (per the documented
 * numogram structure):
 *
 *  - The LANDED ZONE Z corroborates: `corroborating("zone:Z")` — the zone the query
 *    actually landed on is present testimony.
 *  - The TWIN 9-Z is the cast's DUAL (the syzygy involution n ↦ 9-n, the numogram's
 *    built-in σ / conflation, echoing the bilattice σ the Reading core gauges). It is
 *    signed `twin:9-Z`. When the landed zone runs the OUTER/odd current (Z odd), the twin
 *    is the suppressed counter-current and REFUTES; otherwise the twin co-signs as a
 *    corroborating dual (`signing("twin:9-Z", witnessedPotential(mark(...)))`).
 *  - The GATE corroborates: `corroborating("gate:G")` — the zone's gate (its current's
 *    cumulative reduced charge) is present.
 *
 * The VOID/WHOLE syzygy (Z = 0 or 9, the 0::9 pair) is the most over-determined cast: the
 * empty/whole current. It reads richly — an extra corroborating `void-whole:Z::9-Z` sign
 * is added so the panel carries the over-determination, and (when odd, i.e. Z=9) the
 * refuting twin against it makes the void/whole a HELD tension the core can settle to a
 * `stable` (⊤, "told both") diagnosis rather than a flat affirmation.
 *
 * The core's knowledge-join fold is the adjudication, unchanged: a cast whose twin refutes
 * the landed zone puts opposing witnesses in the panel and the core HOLDS the conflict at
 * `stable`; a cast whose twin co-signs settles to an affirmed diagnosis. The witnesses are
 * real reduction facts (the landed zone, its syzygy twin, its gate), not toy tokens.
 *
 * SIMPLIFICATION: see `numogram.mts` — this is a faithful but simplified numomancy (zones
 * + syzygies + gates; the full Time-Circuit currents are summarized as the odd/outer-current
 * flag that decides the twin's polarity).
 */

import { castNumogram, type NumogramCast } from "./numogram.mjs";
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
import { witnessedPotential, mark } from "@emsenn/relating";

/** Admit a question that may be a raw string (a boundary token, admitted through
 * `divine`) or an already-admitted DiviningCarrier (passed through) — exactly the
 * astrology/tarot template's `admitQuestion`. */
function admitQuestion(question: DiviningCarrier | string): DiviningCarrier {
  if (typeof question === "string") {
    return divine("divining.admit", question as DiviningToken).carrier;
  }
  return question;
}

/** A cut label for a numogram cast: the cast's landed zone and twin, the divinatory
 * "where" the reading is taken at (the syzygy the query settled on). */
export function castLabel(cast: NumogramCast): string {
  return `numogram:${cast.zone}::${cast.twin}`;
}

/**
 * The SignWitness panel for a numogram cast: the four-corner mapping of the cast's
 * structure onto signs. Reuses the cast the domain already computed (`castNumogram`);
 * no digit is re-summed here.
 *
 *  - landed zone Z          → corroborating  (`zone:Z`)
 *  - twin 9-Z (the syzygy)  → refuting when Z runs the outer/odd current, else a
 *                              corroborating dual via `signing` (the σ co-sign)
 *  - gate G                 → corroborating  (`gate:G`)
 *  - void/whole (Z=0 or 9)  → an extra corroborating over-determination sign
 */
export function buildPanelFromCast(cast: NumogramCast): SignWitness[] {
  const panel: SignWitness[] = [corroborating(`zone:${cast.zone}`)];

  if (cast.outerCurrent) {
    // The landed zone runs the outer/odd current; its twin is the suppressed
    // counter-current and refutes.
    panel.push(refuting(`twin:${cast.twin}`));
  } else {
    // The twin co-signs as the corroborating syzygy dual (the numogram's σ): an
    // already-formed potential charge witnessed by the twin zone.
    panel.push(signing(`twin:${cast.twin}`, witnessedPotential(mark(`twin:${cast.twin}`))));
  }

  panel.push(corroborating(`gate:${cast.gate}`));

  if (cast.voidWhole) {
    // The 0::9 void/whole syzygy is the most over-determined cast — carry the
    // over-determination explicitly so the panel reads richly.
    panel.push(corroborating(`void-whole:${cast.zone}::${cast.twin}`));
  }

  return panel;
}

/** Build the panel for a query string (cast it, then map the cast to signs). */
export function buildPanel(query: string): SignWitness[] {
  return buildPanelFromCast(castNumogram(query));
}

/**
 * Read a numogram cast into a Reading of the question.
 *
 * The query is cast deterministically (`castNumogram`), the question is admitted through
 * `divine` when a string (or accepted as a carrier), and the panel is read through the
 * core `read` at `cut(castLabel(cast))` — the syzygy the query settled on.
 *
 * The whole cast settles to ONE Reading (one verdict per query). A cast running the
 * outer/odd current — whose twin refutes the landed zone — puts opposing witnesses in the
 * panel; the core's knowledge-join HOLDS that as a `stable` diagnosis
 * (holdsContradiction === true), a real numomantic tension held local, not collapsed. A
 * cast whose twin co-signs settles to an affirmed diagnosis.
 */
export function read(query: string, question: DiviningCarrier | string): Reading {
  const cast = castNumogram(query);
  const carrier = admitQuestion(question);
  const panel = buildPanelFromCast(cast);
  return coreRead(carrier, cut(castLabel(cast)), panel);
}
