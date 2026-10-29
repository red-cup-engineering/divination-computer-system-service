// Lection lookup: date × tradition → a witnessed entry or a typed absence.
//
// Vocabulary: `lectionFor` is a partial function made total by a
// discriminated outcome record. "Found" carries the entry; "no entry
// recorded" is a statement about THIS package's tables, not about the
// lectionary — the RCL appoints readings for every day, but we only record
// what we could source, and absence is reported honestly with a note.
// The only throw is TypeError for malformed inputs (a non-date string, an
// unknown tradition); a well-formed date outside the recorded window is not
// an error, it is the second outcome.

import { parseIsoDate } from "../calendar/index.mjs";

import { RCL_LECTIONARY_ENTRIES, type LectionaryEntry } from "./lectionary-data.mjs";

export type LectionaryTradition = "rcl" | "roman";

export type LectionOutcome =
  | Readonly<{ outcome: "found"; entry: LectionaryEntry }>
  | Readonly<{
      outcome: "no-entry-recorded";
      date: string;
      tradition: LectionaryTradition;
      note: string;
    }>;

const TRADITIONS: readonly LectionaryTradition[] = Object.freeze(["rcl", "roman"]);

const RCL_BY_DATE: ReadonlyMap<string, LectionaryEntry> = new Map(
  RCL_LECTIONARY_ENTRIES.map((entry) => [entry.date, entry]),
);

/** Look up the recorded lection for a date under a tradition. */
export function lectionFor(iso: string, tradition: LectionaryTradition): LectionOutcome {
  parseIsoDate(iso); // TypeError on malformed dates.
  if (!TRADITIONS.includes(tradition)) {
    throw new TypeError(`not a lectionary tradition: ${JSON.stringify(tradition)}`);
  }
  if (tradition === "roman") {
    return Object.freeze({
      outcome: "no-entry-recorded",
      date: iso,
      tradition,
      note: "No Roman lectionary tables are recorded in this package; only the calendar structure (romanDay) is computed.",
    });
  }
  const entry = RCL_BY_DATE.get(iso);
  if (entry !== undefined) return Object.freeze({ outcome: "found", entry });
  return Object.freeze({
    outcome: "no-entry-recorded",
    date: iso,
    tradition,
    note: "Recorded RCL tables cover Year A Sunday propers for June–July 2026 and daily readings for June 2026 (Vanderbilt Divinity Library); this date falls outside that window.",
  });
}
