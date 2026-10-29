/**
 * practicing/computus — the calendar/computus as a Practice: a date, as a panel.
 *
 * Mirrors the reference `practicing/astrology`. The computus DOMAIN (the Metonic
 * and year-line cycles, the feast and Easter reckoning, the integer date-math)
 * stays in `../calendar`; this is only the thin divining-facing layer. A date is
 * one panel: every calendrical feature the date positively bears contributes a
 * corroborating witness (`buildDatePanel` — is it Easter, the Metonic anchor, its
 * ISO week's Thursday, a feast?), an absent marker stays silent, and the core
 * `read` settles the joined panel into one Reading of the question — `readDate`
 * already admits the question and cuts at the date's own instant on the day line.
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { buildDatePanel, readDate } from "../calendar/reading.mjs";

/** The computus query: the ISO date whose calendrical panel is read. */
export interface ComputusQuery {
  readonly iso: string;
}

/** The calendar/computus as a Practice: a date settles to one Reading. */
export const computus: Practice<ComputusQuery> = registerPractice({
  name: "computus",
  summary: "a date in the computus — every calendrical feature it bears as one panel",
  buildPanel: (query) => buildDatePanel(query.iso),
  read: (query, question) => readDate(query.iso, question),
});
