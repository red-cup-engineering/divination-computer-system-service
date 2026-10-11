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

import { dayOfWeek, parseIsoDate } from "../calendar/iso-date.mjs";

import { RCL_LECTIONARY_ENTRIES } from "./lectionary-data.mjs";

const MONTH_NAMES = Object.freeze([
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
]);

/**
 * The real Vanderbilt Divinity Library page for one date's daily reading —
 * computed from the URL pattern its own site uses
 * (".../YYYY/MM/daily-readings-for-{weekday}-{month}-{DD}-YYYY/"), not
 * fetched. Vanderbilt blocks automated fetches from this package's tooling,
 * so a no-entry-recorded outcome links a human reader to the real page
 * rather than this package silently stopping at "no entry" — a coverage
 * gap in this package's own hand-transcribed table is not the same claim
 * as an absence in the lectionary itself, and the RCL assigns a reading to
 * every day, including ones this table hasn't caught up to yet.
 */
function vanderbiltDailyReadingsUrl(iso) {
  const civil = parseIsoDate(iso);
  const weekday = dayOfWeek(iso);
  const month = MONTH_NAMES[civil.month - 1];
  const mm = String(civil.month).padStart(2, "0");
  const dd = String(civil.day).padStart(2, "0");
  return `https://lectionary.library.vanderbilt.edu/${civil.year}/${mm}/daily-readings-for-${weekday}-${month}-${dd}-${civil.year}/`;
}

const TRADITIONS = Object.freeze(["rcl", "roman"]);

const RCL_BY_DATE = new Map(
  RCL_LECTIONARY_ENTRIES.map((entry) => [entry.date, entry]),
);

/** Look up the recorded lection for a date under a tradition. */
export function lectionFor(iso, tradition) {
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
    note:
      "This is a gap in this package's own hand-transcribed RCL tables (Sunday propers recorded for June–July 2026, daily readings for June 2026 only, from the Vanderbilt Divinity Library) -- not a claim that the lectionary itself has no reading for this date. The RCL daily cycle assigns a reading to every day, including this one; see it directly at " +
      vanderbiltDailyReadingsUrl(iso) +
      " (this package could not fetch that page automatically -- Vanderbilt's site blocks automated requests from its tooling).",
  });
}
