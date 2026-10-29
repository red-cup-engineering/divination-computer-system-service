#!/usr/bin/env node
// divination-draw: the seeded daily draw, with its provenance.
//
// The seed is `<salt>:<date>`, so the draw is reproducible by anyone
// holding the seed — the provenance (seed + method) is printed with every
// draw, which makes it a checkable claim rather than an unwitnessed
// assertion. One card is the single-card daily spread; `--count N` draws N
// cards without replacement into positions "card 1" … "card N". `--spread`
// prints the encoded spread document instead of the report.
//
//   divination-draw [YYYY-MM-DD] [--salt routine-read] [--count N] [--spread]

import { fileURLToPath } from "node:url";
import {
  dailySpread,
  drawCards,
  SEEDED_DRAW_METHOD,
  type Spread,
} from "../divination/index.mjs";
import { encodeSpreadDocument } from "../divination/codecs/index.mjs";
import { dateArgument, parseArguments } from "./options.mjs";

export const DEFAULT_SALT = "routine-read";

/** The day's seeded spread: the single-card daily spread, or N cards. */
export function drawSpread(dateIso: string, salt = DEFAULT_SALT, count = 1): Spread {
  if (typeof salt !== "string" || salt.length === 0) throw new TypeError("salt must be a non-empty string");
  if (!Number.isInteger(count) || count < 1) throw new TypeError(`count must be a positive integer: ${count}`);
  if (count === 1) return dailySpread(dateIso, salt);
  const seed = `${salt}:${dateIso}`;
  const draws = drawCards(seed, count);
  return Object.freeze({
    spread: `${count} cards`,
    date: dateIso,
    positions: Object.freeze(
      draws.map((draw, index) =>
        Object.freeze({ position: `card ${index + 1}`, card: draw.card, orientation: draw.orientation }),
      ),
    ),
    provenance: Object.freeze({ method: SEEDED_DRAW_METHOD, seed }),
  });
}

/** The human projection of a spread: positions, then seed and method. */
export function renderDrawReport(spread: Spread): string {
  return [
    `Draw — ${spread.date} (${spread.spread})`,
    "",
    ...spread.positions.map(
      (position) => `  ${position.position}: ${position.card.name}, ${position.orientation}`,
    ),
    "",
    `Seed: ${spread.provenance.seed ?? "(none: physical draw)"}`,
    `Method: ${spread.provenance.method}`,
  ].join("\n");
}

/** One invocation: argv → the text the command prints. */
export function runDraw(argv: readonly string[]): string {
  const { positionals, flags } = parseArguments(argv, ["salt", "count"]);
  if (positionals.length > 1) throw new TypeError("draw takes at most one date");
  const dateIso = dateArgument(positionals[0]);
  const salt = (flags.get("salt") as string | undefined) ?? DEFAULT_SALT;
  const countFlag = flags.get("count") as string | undefined;
  const count = countFlag === undefined ? 1 : Number(countFlag);
  const spread = drawSpread(dateIso, salt, count);
  if (flags.has("spread")) return encodeSpreadDocument({ spread, body: "" });
  return renderDrawReport(spread);
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    process.stdout.write(`${runDraw(process.argv.slice(2))}\n`);
  } catch (error) {
    process.stderr.write(`divination-draw: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
