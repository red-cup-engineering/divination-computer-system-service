// The Revised Common Lectionary's cycle structure.
//
// Vocabulary: the RCL (Consultation on Common Texts, 1992 — the Sunday
// lectionary of the American mainline-Protestant churches) reads Sundays on
// a three-year cycle named A, B, C. A lectionary year is the liturgical year
// (Advent through the eve of Advent), and the cycle letter is determined by
// the calendar year in which that Advent falls:
//
//   advent year ≡ 0 (mod 3) → Year A
//   advent year ≡ 1 (mod 3) → Year B
//   advent year ≡ 2 (mod 3) → Year C
//
// Anchor evidence: Advent 2016 began Year A (2016 ≡ 0), and the Vanderbilt
// Divinity Library lectionary site labels 2025–26 as Year A, 2026–27 as
// Year B, 2027–28 as Year C (2025 ≡ 0) — both agree with the rule.
// Equivalently: Year A liturgical years END in a calendar year ≡ 1 (mod 3).
//
// Ordinary Time Sundays after Pentecost carry Proper numbers tied to civil
// date windows, seven days wide: Proper 4 is the Sunday between May 29 and
// June 4 inclusive, and window N is that window translated by 7(N − 4) days.
// Proper N readings coincide with the (N + 5)th Sunday in (Roman) Ordinary
// Time, which is why Vanderbilt prints "Proper 5 (10)". The last is
// Proper 29 (Reign of Christ), the Sunday between Nov 20 and 26.
//
// The daily lectionary (CCT, 2005) is structured around the Sundays: the
// readings for Thursday–Saturday prepare the coming Sunday, and those for
// Monday–Wednesday reflect on the previous one. `dailyRelation` is that
// reading of the week; the tables themselves live in lectionary-data.mts.

import { civilDate, dayNumber, dayOfWeek, daysBetween, formatIsoDate, parseIsoDate, weekdayOnOrAfter, weekdayOnOrBefore } from "../calendar/iso-date.mjs";
import { easterDate } from "../calendar/computus.mjs";

import { adventStart, liturgicalYearOf, sundayCycleOf } from "./roman.mjs";

/** The RCL cycle letter of the lectionary year containing the date. */
export function rclYear(iso) {
  return sundayCycleOf(liturgicalYearOf(iso));
}

/**
 * The Proper number of an Ordinary Time Sunday after Pentecost, read off the
 * civil date windows. Propers begin with the Sunday after Trinity Sunday
 * (Easter + 63) and end with Reign of Christ, the Sunday before Advent.
 */
export function properOfSunday(iso) {
  const weekday = dayOfWeek(iso);
  if (weekday !== "sunday") return Object.freeze({ kind: "not-a-sunday", weekday });
  const year = parseIsoDate(iso).year;
  const d = dayNumber(iso);
  const firstProperSunday = dayNumber(easterDate(year)) + 63;
  if (d < firstProperSunday) {
    return Object.freeze({ kind: "outside-proper-season", position: "before-first-proper-sunday" });
  }
  const reignOfChrist = dayNumber(adventStart(year)) - 7;
  if (d > reignOfChrist) {
    return Object.freeze({ kind: "outside-proper-season", position: "after-reign-of-christ" });
  }
  const anchor = formatIsoDate(civilDate(year, 5, 29)); // Proper 4 window opens May 29.
  const proper = 4 + Math.floor(daysBetween(anchor, iso) / 7);
  return Object.freeze({ kind: "proper", proper, ordinaryTimeSunday: proper + 5 });
}

/**
 * The daily lectionary's reading of a weekday: Monday–Wednesday reflect on
 * the previous Sunday; Thursday–Saturday prepare the coming Sunday.
 */
export function dailyRelation(iso) {
  switch (dayOfWeek(iso)) {
    case "sunday":
      return Object.freeze({ relation: "sunday", sunday: iso });
    case "monday":
    case "tuesday":
    case "wednesday":
      return Object.freeze({ relation: "reflection", sunday: weekdayOnOrBefore(iso, "sunday") });
    default:
      return Object.freeze({ relation: "preparation", sunday: weekdayOnOrAfter(iso, "sunday") });
  }
}
