/**
 * ifa/reading — the Opele cast recast as a producer of a SignWitness panel flowing
 * through the package's divining Reading core, mirroring `divination/reading` and
 * `astrology/experimental/reading` exactly.
 *
 * CULTURAL CONSTRAINT (non-negotiable): Public casting structure attributed to the
 * Yoruba/Ifá tradition; not the initiated oracular corpus.
 *
 * Each of the eight chain MARKS becomes one `SignWitness`, keyed by its position
 * (`pos0`..`pos7`): an open mark (concave, 1) CORROBORATES and a closed mark (convex, 0)
 * REFUTES — PURE STRUCTURAL PARITY, with NO meaning attached to any position. Plus one
 * `signing(`odu:${name}`, …)` names the identified compound Odu, carrying a charge derived
 * ONLY from the structural parity of the cast (the count of open marks), never from any
 * invented oracular meaning. The panel is the cast read as testimony; the core `read`
 * adjudicates it by knowledge-join into ONE Reading.
 *
 * SIMPLIFICATION (stated per the doc-comment contract): the Odu's signing charge is the
 * cast's structural parity (open-mark count even ⇒ potential/corroborating polarity, odd ⇒
 * its negation), a deliberately content-free structural valence. We attach NO oracular
 * weight, ranking, or meaning to any Odu — the name is named, the charge is parity, and
 * that is all.
 */
import { witnessedPotential, negate, mark, type ChargeCarrier } from "@emsenn/relating";
import { castOpele, type IfaCast } from "./ifa.mjs";
import {
  corroborating,
  refuting,
  signing,
  cut,
  read as readPanel,
  divine,
  type SignWitness,
  type Reading,
  type DiviningCarrier,
  type DiviningToken,
} from "../index.mjs";

/** Admit a question that may be a raw string (a boundary token, admitted through
 * `divine`) or an already-admitted DiviningCarrier (passed through) — exactly the
 * astrology / divination template's `admitQuestion`. */
function admitQuestion(question: DiviningCarrier | string): DiviningCarrier {
  if (typeof question === "string") {
    return divine("divining.admit", question as DiviningToken).carrier;
  }
  return question;
}

/** The STRUCTURAL charge of the identified Odu, derived ONLY from the cast's parity (the
 * count of open marks): even ⇒ a potential charge witnessed by the compound name, odd ⇒
 * its negation. No oracular meaning — pure structural parity, the same parity principle
 * the per-position signs use, lifted to name the whole figure. */
function oduCharge(cast: IfaCast): ChargeCarrier {
  const openCount = cast.marks.reduce<number>((sum, m) => sum + m, 0);
  const base = witnessedPotential(mark(`odu:${cast.compound}`));
  return openCount % 2 === 0 ? base : negate(base);
}

/**
 * The SignWitness panel for an Opele cast: one witness per of the eight binary
 * positions, keyed by `pos${i}` — open(1) corroborates, closed(0) refutes (pure
 * structural parity, no meaning attached) — plus one `signing(`odu:${name}`, …)` naming
 * the identified compound Odu with its structural-parity charge. Reuses the cast the
 * domain already cast; no mark is re-drawn here.
 */
export function buildPanelFromCast(cast: IfaCast): SignWitness[] {
  const positionSigns = cast.marks.map((m, i) => (m === 1 ? corroborating(`pos${i}`) : refuting(`pos${i}`)));
  return [...positionSigns, signing(`odu:${cast.compound}`, oduCharge(cast))];
}

/** The SignWitness panel for a query: cast the Opele deterministically from the query
 * string, then build the panel from the cast. */
export function buildPanel(query: string): SignWitness[] {
  return buildPanelFromCast(castOpele(query));
}

/**
 * Read an Opele cast into one Reading of the question.
 *
 * The query string seeds the deterministic cast (the same query always yields the same
 * cast); its eight marks plus the identified compound Odu become the panel. The question
 * is admitted through `divine` when a string, or accepted as a carrier. The reading is
 * taken at `cut(<query label>)` — the cast's own label. The whole cast settles to ONE
 * Reading (one verdict per query) through the core's knowledge-join.
 */
export function readCast(query: string, question: DiviningCarrier | string): Reading {
  const cast = castOpele(query);
  const carrier = admitQuestion(question);
  const panel = buildPanelFromCast(cast);
  return readPanel(carrier, cut(query), panel);
}
