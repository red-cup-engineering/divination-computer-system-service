// Reading: Lakota star knowledge recast as a SignWitness panel flowing through the
// package's divining Reading core.
//
// The sun's seasonal position (starknowledge.mts, off the astrology ephemeris) names
// what a time is FOR. Each correspondence the date positively bears — its season, the
// ever-present circumpolar doorkeeper, the spring journey's star-region and site, a
// quarter-day threshold, the spring Sacred Hoop — is a CORROBORATING witness. Star
// knowledge is a calendar of right relation, so its witnesses CONCUR: a reading affirms
// the season's relation (an affirmed diagnosis) rather than holding a contradiction. The
// absence of a special marker is silence, never a refutation (as in the computus).
//
// Public correspondences only (Goodman; Native Skywatchers; Lakota ethnoastronomy),
// attributed; no closed ceremonial interior. Witnesses are keyed by the public name.

import {
  corroborating,
  cut,
  read,
  divine,
  type SignWitness,
  type Reading,
  type DiviningCarrier,
  type DiviningToken,
} from "../index.mjs";
import { seasonalPosition } from "./starknowledge.mjs";

/** Admit a question that may be a raw string (admitted through `divine`) or an
 * already-admitted DiviningCarrier (passed through). */
function admitQuestion(question: DiviningCarrier | string): DiviningCarrier {
  if (typeof question === "string") {
    return divine("divining.admit", question as DiviningToken).carrier;
  }
  return question;
}

/**
 * The SignWitness panel for a date's sky: one corroborating witness per active
 * correspondence.
 *
 *  • `season:…` — the Lakota season the sun's quadrant names;
 *  • `Tó Wiŋ:doorkeeper` — the circumpolar center (the Big Dipper, Tó Wiŋ, the
 *    doorkeeper between the star-world and earth) is ever-present;
 *  • `journey:…` / `site:…` — in spring, the star-region the sun is crossing and the
 *    He Sápa site the people enter with it;
 *  • `hoop:Ki Iŋyáŋka Očáŋku` — in spring, the Sacred Hoop / Racetrack ring of stars
 *    (gathering the sacred stones for the Sun Dance);
 *  • `threshold:…` — when the date sits on a solstice/equinox, the sacred quarter-day.
 *
 * No sky math is recomputed here; every fact comes from `seasonalPosition`.
 */
export function buildPanel(date: string): SignWitness[] {
  const position = seasonalPosition(date);
  const panel: SignWitness[] = [];

  panel.push(corroborating(`season:${position.season}`));
  // the circumpolar center is always overhead — the ever-present doorkeeper.
  panel.push(corroborating("Tó Wiŋ:doorkeeper"));

  if (position.journey !== undefined) {
    panel.push(corroborating(`journey:${position.journey.constellation}`));
    panel.push(corroborating(`site:${position.journey.site}`));
    // the spring Sacred Hoop / Racetrack — the ring of stars round He Sápa.
    panel.push(corroborating("hoop:Ki Iŋyáŋka Očáŋku"));
  }

  if (position.threshold !== undefined) {
    panel.push(corroborating(`threshold:${position.threshold}`));
  }

  return panel;
}

/**
 * Read a date's sky into a Reading of the question: admit the question, build the
 * season's panel, and settle it through the core `read` at `cut(date)`. The panel
 * concurs, so the diagnosis affirms what the time is in right relation to.
 */
export function readSky(date: string, question: DiviningCarrier | string): Reading {
  const carrier = admitQuestion(question);
  return read(carrier, cut(date), buildPanel(date));
}
