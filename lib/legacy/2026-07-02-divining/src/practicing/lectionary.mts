/**
 * practicing/lectionary — the lectionary as a Practice: the day's appointed
 * readings, as a panel.
 *
 * The lectionary DOMAIN (the Revised Common Lectionary and General Roman Calendar
 * resolvers, the cross-tradition divergence settlement) stays in `../liturgy`;
 * this is only the thin divining-facing layer. The lections appointed for a date
 * are the day's sign-witnesses: each is concurring testimony about "what is read
 * today" (`buildLectionPanel`, where the two traditions corroborate on a shared
 * appointment and refute where their cycle letter or appointed day diverges), and
 * the core `read` settles the joined panel into one Reading of the question.
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { buildLectionPanel, readLections } from "../liturgy/reading.mjs";

/** The lectionary query: the date whose appointed lections are read. */
export interface LectionaryQuery {
  readonly iso: string;
}

/** The lectionary as a Practice: a date's appointed lections settle to one Reading. */
export const lectionary: Practice<LectionaryQuery> = registerPractice({
  name: "lectionary",
  summary: "a date's appointed lections — both traditions' concurring testimony as one panel",
  buildPanel: (query) => buildLectionPanel(query.iso),
  read: (query, question) => readLections(query.iso, question),
});
