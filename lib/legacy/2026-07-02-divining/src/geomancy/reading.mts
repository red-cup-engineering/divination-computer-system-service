/**
 * geomancy/reading — the geomantic shield recast as a producer of a SignWitness panel
 * flowing through the package's divining Reading core. Mirrors `divination/reading`
 * (tarot/numerology) and `astrology/experimental/reading`: the geomancy DOMAIN (the
 * shield's figures and their reduction) stays in `./geomancy`; this is only the thin
 * divining-facing layer that turns the cast shield into signs and reads them.
 *
 * The panel is the seven significant figures of the shield: the four MOTHERS, the two
 * WITNESSES, and the JUDGE — one `SignWitness` each, keyed by the figure's traditional
 * name. The figure's VALENCE is the sign's polarity:
 *  - a FAVORABLE figure CORROBORATES (a potential charge witnessed by the figure name),
 *  - an UNFAVORABLE figure REFUTES (the negation of that charge),
 *  - a NEUTRAL "both" figure (Via, Populus, Coniunctio) `signs` a STABLE charge — told
 *    both, held local, neither affirmed nor denied.
 *
 * The Witnesses→Judge structure IS the core's panel→adjudication: the Right and Left
 * Witnesses are two sub-tableaux that, with the Mothers, reduce to one verdict (the
 * Judge) by XOR — exactly as the core's knowledge-join folds a panel of sign-witnesses
 * into one settled Reading. We therefore put both Witnesses AND the Judge into the panel
 * (rather than only the Judge): the core re-performs the adjudication over the same
 * testimony, and a shield whose figures point both ways is HELD at `stable` by the
 * knowledge-join, not collapsed.
 */

import {
  castShield,
  nameFigure,
  type Figure,
  type Shield,
  type Valence,
} from "./geomancy.mjs";
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
import {
  joinKnowledge,
  mark,
  negate,
  witnessedPotential,
} from "@emsenn/relating";

/** Admit a question that may be a raw string (a boundary token, admitted through
 * `divine`) or an already-admitted DiviningCarrier — exactly the astrology/tarot
 * template's `admitQuestion`. */
function admitQuestion(question: DiviningCarrier | string): DiviningCarrier {
  if (typeof question === "string") {
    return divine("divining.admit", question as DiviningToken).carrier;
  }
  return question;
}

/** A STABLE charge witnessed by a name: both the truth and falsity sides carry the
 * witness, so it settles to `stable` (⊤knowledge, "told both"). Built by knowledge-joining
 * a witnessed-potential with its negation — the held charge a "both" figure contributes. */
function bothCharge(witness: string) {
  const positive = witnessedPotential(mark(witness));
  return joinKnowledge(positive, negate(positive));
}

/** The sign one named figure contributes: favorable corroborates, unfavorable refutes,
 * neutral signs a held `stable` charge. The figure's traditional name is the witness. */
function figureSign(name: string, valence: Valence): SignWitness {
  if (valence === "favorable") return corroborating(name);
  if (valence === "unfavorable") return refuting(name);
  return signing(name, bothCharge(name));
}

/** Turn one figure into its named sign-witness (name + valence → polarity). */
function signOf(figure: Figure): SignWitness {
  const named = nameFigure(figure);
  return figureSign(named.name, named.valence);
}

/**
 * The SignWitness panel of a cast shield: one witness per significant figure — the four
 * Mothers, the Right and Left Witnesses, and the Judge — keyed by each figure's
 * traditional name, signed by its valence. Reuses the shield the domain already cast; no
 * figure is re-derived here.
 */
export function buildShieldPanel(shield: Shield): SignWitness[] {
  return [
    signOf(shield.mothers[0]),
    signOf(shield.mothers[1]),
    signOf(shield.mothers[2]),
    signOf(shield.mothers[3]),
    signOf(shield.rightWitness),
    signOf(shield.leftWitness),
    signOf(shield.judge),
  ];
}

/** The panel for a query: cast the shield deterministically, then build its panel. */
export function buildPanel(query: string): SignWitness[] {
  return buildShieldPanel(castShield(query));
}

/**
 * Read a geomancy query into one Reading of the question. The shield is cast
 * deterministically from the query string; its seven significant figures become the
 * panel, and the core `read` settles them at `cut(query)` — the query label is the cut.
 *
 * A shield whose figures point both ways over the same question (a favorable figure
 * corroborating while an unfavorable one refutes, or a "both" figure already holding both
 * sides) puts opposing witnesses in the panel; the core's knowledge-join holds that as a
 * `stable` diagnosis — a real geomantic conflict, held local and stable, not collapsed.
 * A shield that reads one way settles to an affirmed diagnosis. The whole cast settles to
 * ONE verdict: one Reading per query.
 */
export function readShield(query: string, question: DiviningCarrier | string): Reading {
  const shield = castShield(query);
  const carrier = admitQuestion(question);
  const panel = buildShieldPanel(shield);
  return coreRead(carrier, cut(query), panel);
}
