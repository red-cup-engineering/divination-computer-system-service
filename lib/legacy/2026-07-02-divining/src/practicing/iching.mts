/**
 * practicing/iching — the I Ching as a Practice: a consultation as a panel.
 *
 * The thin divining-facing layer over the `../iching` DOMAIN (the deterministic cast,
 * the hexagram structure, the King Wen recovery, and the reading). The whole six-line
 * cast at a query is ONE panel: each line contributes its FOUR-corner sign
 * (`buildPanel`, where young-yang corroborates, young-yin refutes, and the changing
 * lines 6/9 sign a STABLE/⊤ "told both" charge — the both/transforming corner where
 * present→future happens), and the core `read` settles the joined panel into one
 * Reading of the question. The query is the cast's seed: the same question text always
 * yields the same consultation.
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { buildPanel as buildCastPanel, read as readCast } from "../iching/index.mjs";
import type { Reading } from "../articulating/predicating/positing/settling/reading.mjs";
import type { DiviningCarrier } from "../topology/index.mjs";

/** The I Ching query: the consultation's seed string — the question/occasion text the
 * cast is deterministically drawn from. */
export interface IChingQuery {
  readonly seed: string;
}

/** The I Ching as a Practice: a deterministic six-line cast settles to one Reading. */
export const iching: Practice<IChingQuery> = registerPractice({
  name: "iching",
  summary: "a six-line cast — each line's FOUR-corner sign, changing lines as the σ-dual present→future, as one panel",
  buildPanel: (query) => buildCastPanel(query.seed),
  read: (query, question): Reading => readCast(query.seed, question as DiviningCarrier | string),
});
