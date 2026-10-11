// Feasts as date-valued functions of the year.
//
// Vocabulary: a feast, for this package, is nothing but a rule assigning a
// date to each year — calendar mathematics, with no church content. The two
// rule shapes are a discriminated union: a FixedFeast names civil (month,
// day) coordinates repeated every year; a MovableFeast names an anchor (the
// only anchor here is Easter, the computus) and a signed offset in days.
// `feastDate` is the resolver: Feast × year → IsoDate. It is total on valid
// shapes; February 29 in a common year is a malformed request and a
// TypeError, the only throw.

import { easterDate } from "./computus.mjs";
import { addDays, civilDate, formatIsoDate } from "./iso-date.mjs";

/** Build the frozen movable-feast rule (anchored to Easter). */
export function movableFeast(offsetDays) {
  if (!Number.isInteger(offsetDays)) throw new TypeError("offsetDays must be an integer");
  return Object.freeze({ kind: "movable", anchor: "easter", offsetDays });
}

/** Build the frozen fixed-feast rule. Validated against a leap year, so 2-29 is allowed. */
export function fixedFeast(month, day) {
  civilDate(2000, month, day); // 2000 is a leap year: admits every (month, day) that any year admits.
  return Object.freeze({ kind: "fixed", month, day });
}

/** The resolver: apply the feast's rule to a year. */
export function feastDate(feast, year) {
  if (!Number.isInteger(year)) throw new TypeError("year must be an integer");
  if (feast === null || typeof feast !== "object") throw new TypeError("feast must be a Feast record");
  switch (feast.kind) {
    case "movable":
      return addDays(easterDate(year), feast.offsetDays);
    case "fixed":
      return formatIsoDate(civilDate(year, feast.month, feast.day));
    default:
      throw new TypeError(`not a feast kind: ${JSON.stringify((feast).kind)}`);
  }
}
