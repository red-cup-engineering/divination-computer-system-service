// Computus: the date of Gregorian Easter as a function of the year.
//
// Vocabulary: "computus" is the standard name for this calculation. Easter
// is the Sunday after the ecclesiastical (tabular, not astronomical) paschal
// full moon; the Anonymous Gregorian algorithm (as given in Meeus,
// Astronomical Algorithms, ch. 8, often cited as Meeus–Jones–Butcher)
// computes it in pure integer arithmetic, valid for every year of the
// Gregorian calendar. The result is total on integer years: there are no
// branch years, no tables, no lookups.
//
// Law: the date always falls between March 22 and April 25 inclusive — the
// classical bounds of Gregorian Easter — and is always a Sunday.

import { civilDate, formatIsoDate } from "./iso-date.mjs";

/** Easter Sunday of the given Gregorian year, as civil coordinates. */
export function easterCivil(year) {
  if (!Number.isInteger(year)) throw new TypeError("year must be an integer");
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return civilDate(year, month, day);
}

/** Easter Sunday of the given Gregorian year, as an IsoDate string. */
export function easterDate(year) {
  return formatIsoDate(easterCivil(year));
}
