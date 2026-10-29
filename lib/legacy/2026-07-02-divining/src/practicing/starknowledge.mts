/**
 * practicing/starknowledge — Lakota star knowledge as a Practice: the sun's seasonal
 * position, as a panel.
 *
 * Mirrors the reference `astrology` practice — and is its kin: the star-knowledge DOMAIN
 * (in `../starknowledge`) reads the SAME ephemeris sun the astrology practice does, but
 * names what the season is FOR rather than where each body sits. "As above, so below":
 * the date's sky settles to one Reading of right relation. A calendar of when and where,
 * encoded from public sources only and attributed; the closed ceremonial interior is not
 * encoded.
 */
import { registerPractice, type Practice } from "./registry.mjs";
import { buildPanel, readSky } from "../starknowledge/index.mjs";

/** The star-knowledge query: the date whose sky is read. */
export interface StarKnowledgeQuery {
  readonly date: string;
}

/** Lakota star knowledge as a Practice: a date's seasonal sky settles to one Reading. */
export const starknowledge: Practice<StarKnowledgeQuery> = registerPractice({
  name: "starknowledge",
  summary: "Lakota star knowledge — the sun's seasonal position and the He Sápa correspondence the time is for (public sources, attributed)",
  buildPanel: (query) => buildPanel(query.date),
  read: (query, question) => readSky(query.date, question),
});
