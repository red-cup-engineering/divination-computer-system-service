#!/usr/bin/env node
// divination-chart: the sky at one instant, printed as glyph lines.
//
// Every body's placement in standard glyph notation, the lunation phase
// with its illuminated fraction, and the chart's provenance (algorithm and
// accuracy claims — a chart line is a witnessed claim, not an assertion).
// --json prints the Chart record itself.
//
//   divination-chart [ISO-instant] [--json]   (default instant: now)

import { fileURLToPath } from "node:url";
import { computeChart, lunationOf, type Chart } from "../astrology/index.mjs";
import { renderChartGlyphs } from "../divination/codecs/index.mjs";
import { instantArgument, parseArguments } from "./options.mjs";

/** The human projection of a chart: glyph lines, lunation, provenance. */
export function renderChartReport(chart: Chart): string {
  const lunation = lunationOf(chart.bodies);
  return [
    `Chart — ${chart.time}`,
    "",
    renderChartGlyphs(chart.bodies),
    "",
    `Lunation: ${lunation.phase} (${Math.round(lunation.illuminatedFraction * 100)}% illuminated, ${lunation.trend})`,
    `Provenance: ${chart.provenance.algorithm}`,
    `  ${chart.provenance.accuracy}`,
  ].join("\n");
}

/** One invocation: argv → the text the command prints. */
export function runChart(argv: readonly string[]): string {
  const { positionals, flags } = parseArguments(argv);
  if (positionals.length > 1) throw new TypeError("chart takes at most one instant");
  const chart = computeChart(instantArgument(positionals[0]));
  return flags.has("json") ? JSON.stringify(chart, null, 2) : renderChartReport(chart);
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    process.stdout.write(`${runChart(process.argv.slice(2))}\n`);
  } catch (error) {
    process.stderr.write(`divination-chart: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
