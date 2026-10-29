/**
 * practicing/numerology — numerology as a Practice: a date's digit-reduction, as a panel.
 *
 * The thin divining-facing layer over the numerology DOMAIN, which stays in
 * `../divination`: the digit-reduction (`reduceDate`) and its SignWitness panel
 * (`buildReductionPanel`) and reading (`readReduction`) already live there and are
 * reused here, never reimplemented. A reduction is one orbit of digit sums toward
 * its terminal; every step contributes a corroborating witness keyed by its number
 * (`buildReductionPanel`), and the core `read` settles the joined panel into one
 * Reading of the question. Every step agrees toward the terminal, so a clean
 * reduction reads as an affirmed diagnosis.
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { reduceDate } from "../divination/numerology.mjs";
import { buildReductionPanel, readReduction } from "../divination/reading.mjs";

/** The numerology query: the date or number string whose digits are reduced. */
export interface NumerologyQuery {
  readonly value: string;
}

/** Numerology as a Practice: a date's digit-reduction settles to one Reading. */
export const numerology: Practice<NumerologyQuery> = registerPractice({
  name: "numerology",
  summary: "a date's digit-reduction — every step of the orbit toward its terminal as one panel",
  buildPanel: (query) => buildReductionPanel(reduceDate(query.value)),
  read: (query, question) => readReduction(query.value, question),
});
