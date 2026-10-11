import { castRunes } from "./runes.mjs";
import { corroborating, refuting, settleReading } from "../reading.mjs";

function runeSign(name, orientation) {
  return orientation === "upright"
    ? corroborating("runes", name)
    : refuting("runes", name);
}

/** Project an existing rune cast to its orientation-valued witnesses. */
export function buildCastPanel(cast) {
  return Object.freeze(cast.drawn.map(({ rune, orientation }) => runeSign(rune, orientation)));
}

export function buildPanel(query, count) {
  return buildCastPanel(castRunes(query, count));
}

/** Settle an existing or deterministic rune cast; non-invertible runes remain upright by domain law. */
export function readCast(query, question, count) {
  const cast = typeof query === "string" ? castRunes(query, count) : query;
  return settleReading(question, cast.date, buildCastPanel(cast));
}

