#!/usr/bin/env node
// divination-reduce: the date's numerological reduction, with its orbit.
//
// The reduction is the orbit of the digit-sum map until it lands in the
// terminal set {1..9} ∪ {11, 22, 33}; the whole orbit is part of the
// reading, so the report prints every step, not just the terminal.
//
//   divination-reduce [YYYY-MM-DD]   (default date: today, UTC)

import { fileURLToPath } from "node:url";
import { reduceDate, type DateReduction } from "../divination/index.mjs";
import { dateArgument, parseArguments } from "./options.mjs";

/** The human projection of a reduction: the orbit, then the terminal. */
export function renderReductionReport(reduction: DateReduction): string {
  const terminal =
    reduction.kind === "master" ? `master number ${reduction.value}` : `a simple ${reduction.value}`;
  return [
    `Reduction — ${reduction.date}`,
    "",
    `The date reduces ${reduction.steps.join(" → ")}: ${terminal}.`,
  ].join("\n");
}

/** One invocation: argv → the text the command prints. */
export function runReduce(argv: readonly string[]): string {
  const { positionals } = parseArguments(argv);
  if (positionals.length > 1) throw new TypeError("reduce takes at most one date");
  return renderReductionReport(reduceDate(dateArgument(positionals[0])));
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    process.stdout.write(`${runReduce(process.argv.slice(2))}\n`);
  } catch (error) {
    process.stderr.write(`divination-reduce: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
