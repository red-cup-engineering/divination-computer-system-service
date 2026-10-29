/**
 * practicing/astrology — astrology as a Practice: the sky at an instant, as a panel.
 *
 * The REFERENCE conforming module — the shape every other practice mirrors. The
 * astrology DOMAIN (ephemeris, theories, settlement) stays in `../astrology`; this
 * is only the thin divining-facing layer. The whole sky at an instant is one panel:
 * every body contributes its ephemeris-theory agreement (`buildBodyPanel`, where the
 * anchor and truncated theories corroborate within tolerance and refute beyond it),
 * and the core `read` settles the joined panel into one Reading of the question.
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { BODIES, julianDayFromIso, terrestrialJulianDay } from "../astrology/index.mjs";
import { buildBodyPanel } from "../astrology/experimental/reading.mjs";
import { cut, read, type SignWitness } from "../articulating/predicating/positing/settling/reading.mjs";
import { admitDivining, type DiviningCarrier, type DiviningToken } from "../topology/index.mjs";

/** The astrology query: the instant whose sky is read. */
export interface AstrologyQuery {
  readonly isoUtc: string;
}

const admitQuestion = (question: DiviningCarrier | string): DiviningCarrier =>
  typeof question === "string" ? admitDivining(question as DiviningToken) : question;

/** The whole sky at an instant as one panel — every body's ephemeris-theory signs. */
function skyPanel(isoUtc: string): SignWitness[] {
  const julianDayTt = terrestrialJulianDay(julianDayFromIso(isoUtc));
  return BODIES.flatMap((body) => buildBodyPanel(body, julianDayTt));
}

/** Astrology as a Practice: the sky at an instant settles to one Reading. */
export const astrology: Practice<AstrologyQuery> = registerPractice({
  name: "astrology",
  summary: "the sky at an instant — every body's ephemeris-theory agreement as one panel",
  buildPanel: (query) => skyPanel(query.isoUtc),
  read: (query, question) => read(admitQuestion(question), cut(query.isoUtc), skyPanel(query.isoUtc)),
});
