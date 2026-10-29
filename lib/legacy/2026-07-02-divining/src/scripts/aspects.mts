#!/usr/bin/env node
// divination-aspects: the aspect hits in the chart at one instant.
//
// Each hit is a witnessed angular relation: the pair, the aspect (glyph and
// name), the signed offset from exact, and whether the pair is applying or
// separating — read off the relative speed. Major aspects within their
// default orbs. --json prints the AspectHit records.
//
//   divination-aspects [ISO-instant] [--json]   (default instant: now)

import { fileURLToPath } from "node:url";
import {
  aspectsInChart,
  BODY_GLYPHS,
  computeChart,
  type AspectHit,
} from "../astrology/index.mjs";
import { instantArgument, parseArguments } from "./options.mjs";

function signedDegrees(value: number): string {
  return `${value < 0 ? "−" : "+"}${Math.abs(value).toFixed(2)}°`;
}

/** One hit as the human one-liner the command prints. */
export function describeAspectHit(hit: AspectHit): string {
  const glyphs = `${BODY_GLYPHS[hit.bodyA]} ${hit.aspect.glyph} ${BODY_GLYPHS[hit.bodyB]}`;
  return `${glyphs}  ${hit.bodyA} ${hit.aspect.name} ${hit.bodyB} — offset ${signedDegrees(hit.offset)}, ${hit.phase}`;
}

/** The aspect hits at an instant, tightest (smallest |offset|) first. */
export function aspectHitsAt(instant: string): readonly AspectHit[] {
  const chart = computeChart(instant);
  return Object.freeze(
    [...aspectsInChart(chart.bodies)].sort((a, b) => Math.abs(a.offset) - Math.abs(b.offset)),
  );
}

/** One invocation: argv → the text the command prints. */
export function runAspects(argv: readonly string[]): string {
  const { positionals, flags } = parseArguments(argv);
  if (positionals.length > 1) throw new TypeError("aspects takes at most one instant");
  const instant = instantArgument(positionals[0]);
  const hits = aspectHitsAt(instant);
  if (flags.has("json")) return JSON.stringify(hits, null, 2);
  if (hits.length === 0) return `Aspects — ${instant}\n\nno aspects in orb`;
  return [`Aspects — ${instant}`, "", ...hits.map(describeAspectHit)].join("\n");
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    process.stdout.write(`${runAspects(process.argv.slice(2))}\n`);
  } catch (error) {
    process.stderr.write(`divination-aspects: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
