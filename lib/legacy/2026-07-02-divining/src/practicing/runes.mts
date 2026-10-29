/**
 * practicing/runes — the Elder Futhark cast as a Practice: N runes drawn for a
 * question, as one panel.
 *
 * Mirrors the reference `astrology` practice exactly: the rune DOMAIN (the
 * futhark, the seeded cast, the cast→sign projection, the settlement) lives in
 * `../runes`; this is only the thin divining-facing layer. A whole cast is one
 * panel — every drawn rune contributes its sign (an upright/non-invertible rune
 * corroborates, a reversed rune refutes) — and the core `read` settles the joined
 * panel into ONE Reading of the question. The cast is reproducible: it is seeded
 * deterministically from the query string, so the same question always casts the
 * same runes and reads the same verdict.
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { buildPanel as buildCastPanelForQuery, readCast } from "../runes/index.mjs";
import { DEFAULT_RUNE_COUNT } from "../runes/index.mjs";

/** The runes query: the question string whose cast is read, and how many runes to draw. */
export interface RunesQuery {
  /** The question the cast is seeded from and read against. */
  readonly question: string;
  /** How many runes to draw (default three — the Norn spread). */
  readonly count?: number;
}

/** The Elder Futhark cast as a Practice: N seeded runes settle to one Reading. */
export const runes: Practice<RunesQuery> = registerPractice({
  name: "runes",
  summary:
    "an Elder Futhark cast — N runes drawn deterministically from the question, each rune's orientation as one panel",
  buildPanel: (query) => buildCastPanelForQuery(query.question, query.count ?? DEFAULT_RUNE_COUNT),
  read: (query, question) => readCast(query.question, question, query.count ?? DEFAULT_RUNE_COUNT),
});
