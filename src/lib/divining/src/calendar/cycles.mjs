// Calendrical cycles: residues and orbits of the day line and the year line.
//
// Vocabulary: each cycle here is a quotient in the literal sense. The golden
// number is the year's residue in the 19-year Metonic cycle, shifted to the
// traditional 1-based form (year mod 19 + 1). The day of year is the offset
// of a date in its year's orbit, 1-based as convention demands. The ISO week
// (ISO 8601) partitions the day line into Monday-started weeks and names each
// week by the year that owns its Thursday; an IsoWeek is the (isoYear, week)
// coordinate of that partition — note the isoYear is the week-owning year,
// which near January 1 may differ from the civil year.

import {
  addDays,
  dayNumber,
  dayOfWeek,
  formatIsoDate,
  parseIsoDate,
  WEEKDAYS,
} from "./iso-date.mjs";

/** The 1-based residue of the year in the 19-year Metonic cycle. */
export function goldenNumber(year) {
  if (!Number.isInteger(year)) throw new TypeError("year must be an integer");
  return ((year % 19) + 19) % 19 + 1;
}

/** The 1-based offset of the date within its civil year (Jan 1 → 1). */
export function dayOfYear(iso) {
  const civil = parseIsoDate(iso);
  const janFirst = formatIsoDate({ year: civil.year, month: 1, day: 1 });
  return dayNumber(iso) - dayNumber(janFirst) + 1;
}

   

/** The ISO 8601 week coordinate of a date. */
export function isoWeek(iso) {
  // ISO weeks run Monday–Sunday; a week belongs to the year of its Thursday.
  const weekdayIndex = WEEKDAYS.indexOf(dayOfWeek(iso));
  const mondayBasedIndex = (weekdayIndex + 6) % 7; // monday = 0 … sunday = 6
  const thursday = addDays(iso, 3 - mondayBasedIndex);
  const isoYear = parseIsoDate(thursday).year;
  const week = Math.floor((dayOfYear(thursday) - 1) / 7) + 1;
  return Object.freeze({ isoYear, week });
}
