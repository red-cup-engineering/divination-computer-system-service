/**
 * practicing/geomancy — geomancy (Western / Arabic ʿilm al-raml) as a Practice: the
 * geomantic SHIELD cast from a query, as a panel.
 *
 * Mirrors `practicing/astrology` exactly — the thin divining-facing layer. The geomancy
 * DOMAIN (the figures, the canonical sixteen, the deterministic shield cast/reduction)
 * stays in `../geomancy`; this only wraps it as a Practice. The whole shield is one
 * panel: the four Mothers, the two Witnesses, and the Judge each contribute their
 * figure's valence (favorable corroborates, unfavorable refutes, a "both" figure signs a
 * held `stable` charge — see `../geomancy/reading`), and the core `read` settles the
 * joined panel into one Reading of the question. The Witnesses→Judge reduction IS the
 * core's panel→adjudication.
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { buildPanel, readShield } from "../geomancy/index.mjs";

/** The geomancy query: the question text whose shield is cast (the cast is seeded
 * deterministically from this string). */
export interface GeomancyQuery {
  readonly query: string;
}

/** Geomancy as a Practice: the shield cast from a query settles to one Reading. */
export const geomancy: Practice<GeomancyQuery> = registerPractice({
  name: "geomancy",
  summary: "the geomantic shield (ʿilm al-raml) cast from a query — Mothers, Witnesses, and Judge as one panel",
  buildPanel: (query) => buildPanel(query.query),
  read: (query, question) => readShield(query.query, question),
});
