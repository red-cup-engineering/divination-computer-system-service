/**
 * practicing/numogram — the CCRU Numogram (numomancy) as a Practice: a query string cast
 * onto the Decimal Labyrinth's ten Zones, as a panel.
 *
 * The thin divining-facing layer over the `../numogram` domain (the deterministic cast,
 * the zones/syzygies/gates structure, and the SignWitness panel). Exactly the astrology
 * template's shape: a small `Query`, then `registerPractice({ name, summary, buildPanel,
 * read })`. The whole cast settles to ONE Reading — one verdict per query: the landed
 * zone corroborates, its syzygy twin (the numogram's σ involution) co-signs or refutes by
 * the outer/odd current, and the gate corroborates. See `../numogram/reading.mts` for the
 * four-corner mapping and the faithful-but-simplified note (zones + syzygies + gates; the
 * Time-Circuit currents are summarized).
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { buildPanel, read } from "../numogram/index.mjs";

/** The numogram query: the question/string cast onto the Decimal Labyrinth. The cast is a
 * deterministic digital reduction of this string — the string IS the seed. */
export interface NumogramQuery {
  readonly query: string;
}

/** The CCRU Numogram as a Practice: a query string casts onto the ten Zones — landed
 * zone, syzygy twin, and gate as one panel — settling to one Reading. */
export const numogram: Practice<NumogramQuery> = registerPractice({
  name: "numogram",
  summary: "a query cast onto the Decimal Labyrinth's ten Zones — landed zone, syzygy twin, and gate as one panel",
  buildPanel: (query) => buildPanel(query.query),
  read: (query, question) => read(query.query, question),
});
