// The day-number line and the civil chart on it.
//
// Vocabulary: the carrier is Z, the integers read as days; day 0 is
// 1970-01-01 in the proleptic Gregorian calendar. A CivilDate (year, month,
// day) is the standard chart on that line — `dayNumberFromCivil` and
// `civilFromDayNumber` are mutually inverse bijections (Hinnant's civil
// algorithms, pure integer arithmetic; no Date object, no timezone). An
// IsoDate is the canonical string coordinate "YYYY-MM-DD" for a CivilDate.
//
// Morphisms: `addDays` is the Z-action by translation; `dayOfWeek` is the
// quotient Z → Z7 (equivariant: translating by 7 fixes the weekday);
// the `weekdayOnOrAfter` / `weekdayOnOrBefore` family are the nearest-point
// retractions onto a weekday's fiber, and `nthWeekdayOnOrAfter` iterates the
// translation by whole weeks from that retraction.
//
// Laws: civilFromDayNumber(dayNumberFromCivil(c)) = c for every valid civil
// triple; addDays(d, a + b) = addDays(addDays(d, a), b);
// dayOfWeek(addDays(d, 7)) = dayOfWeek(d). The only throw anywhere is
// TypeError for malformed shapes.

/** Weekdays indexed on Z7 with sunday = 0. */
export const WEEKDAYS = Object.freeze([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

  

  

const ISO_DATE_PATTERN = /^(-?\d{4,6})-(\d{2})-(\d{2})$/;

function daysInMonth(year, month) {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

function requireInteger(value, label) {
  if (!Number.isInteger(value)) throw new TypeError(`${label} must be an integer`);
}

/** Build the frozen civil record, checking that the triple names a real day. */
export function civilDate(year, month, day) {
  requireInteger(year, "year");
  requireInteger(month, "month");
  requireInteger(day, "day");
  if (month < 1 || month > 12) throw new TypeError(`month out of range: ${month}`);
  if (day < 1 || day > daysInMonth(year, month)) {
    throw new TypeError(`day out of range for ${year}-${month}: ${day}`);
  }
  return Object.freeze({ year, month, day });
}

/** Read an IsoDate string into its civil chart coordinates. */
export function parseIsoDate(iso) {
  if (typeof iso !== "string") throw new TypeError("iso date must be a string");
  const match = ISO_DATE_PATTERN.exec(iso);
  if (match === null) throw new TypeError(`not an ISO date (YYYY-MM-DD): ${JSON.stringify(iso)}`);
  return civilDate(Number(match[1]), Number(match[2]), Number(match[3]));
}

/** Write civil coordinates as the canonical IsoDate string. */
export function formatIsoDate(civil) {
  const { year, month, day } = civil;
  const y = year < 0 ? `-${String(-year).padStart(4, "0")}` : String(year).padStart(4, "0");
  return `${y}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * The chart map CivilDate → Z: days since 1970-01-01, proleptic Gregorian.
 * Hinnant's days_from_civil, exact integer arithmetic.
 */
export function dayNumberFromCivil(civil) {
  const y = civil.year - (civil.month <= 2 ? 1 : 0);
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (civil.month + (civil.month > 2 ? -3 : 9)) + 2) / 5) + civil.day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** The inverse chart map Z → CivilDate. Hinnant's civil_from_days. */
export function civilFromDayNumber(dayNumber) {
  requireInteger(dayNumber, "dayNumber");
  const z = dayNumber + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  return Object.freeze({ year: y + (month <= 2 ? 1 : 0), month, day });
}

/** The chart map composed with parsing: IsoDate → Z. */
export function dayNumber(iso) {
  return dayNumberFromCivil(parseIsoDate(iso));
}

/** Z → IsoDate, the inverse composed with formatting. */
export function isoFromDayNumber(dayNumberValue) {
  return formatIsoDate(civilFromDayNumber(dayNumberValue));
}

/** The Z-action by translation: addDays(d, a + b) = addDays(addDays(d, a), b). */
export function addDays(iso, days) {
  requireInteger(days, "days");
  return isoFromDayNumber(dayNumber(iso) + days);
}

/** Signed distance on the day line: daysBetween(a, b) = dayNumber(b) − dayNumber(a). */
export function daysBetween(fromIso, toIso) {
  return dayNumber(toIso) - dayNumber(fromIso);
}

/** The quotient Z → Z7, read as the weekday name. Day 0 (1970-01-01) is a Thursday. */
export function dayOfWeek(iso) {
  const index = (((dayNumber(iso) + 4) % 7) + 7) % 7;
  return WEEKDAYS[index];
}

function weekdayIndexOf(weekday) {
  const index = WEEKDAYS.indexOf(weekday);
  if (index === -1) throw new TypeError(`not a weekday: ${JSON.stringify(weekday)}`);
  return index;
}

/** The retraction onto the weekday's fiber from above: the soonest such day ≥ iso. */
export function weekdayOnOrAfter(iso, weekday) {
  const start = dayNumber(iso);
  const startIndex = (((start + 4) % 7) + 7) % 7;
  const gap = (weekdayIndexOf(weekday) - startIndex + 7) % 7;
  return isoFromDayNumber(start + gap);
}

/** The retraction onto the weekday's fiber from below: the latest such day ≤ iso. */
export function weekdayOnOrBefore(iso, weekday) {
  const start = dayNumber(iso);
  const startIndex = (((start + 4) % 7) + 7) % 7;
  const gap = (startIndex - weekdayIndexOf(weekday) + 7) % 7;
  return isoFromDayNumber(start - gap);
}

/** The strictly-next such weekday: weekdayOnOrAfter of the following day. */
export function weekdayAfter(iso, weekday) {
  return weekdayOnOrAfter(addDays(iso, 1), weekday);
}

/** The strictly-previous such weekday: weekdayOnOrBefore of the preceding day. */
export function weekdayBefore(iso, weekday) {
  return weekdayOnOrBefore(addDays(iso, -1), weekday);
}

/** The nth (1-based) such weekday counting from the on-or-after retraction. */
export function nthWeekdayOnOrAfter(iso, weekday, n) {
  requireInteger(n, "n");
  if (n < 1) throw new TypeError(`n must be ≥ 1: ${n}`);
  return addDays(weekdayOnOrAfter(iso, weekday), 7 * (n - 1));
}

/** The nth (1-based) such weekday counting back from the on-or-before retraction. */
export function nthWeekdayOnOrBefore(iso, weekday, n) {
  requireInteger(n, "n");
  if (n < 1) throw new TypeError(`n must be ≥ 1: ${n}`);
  return addDays(weekdayOnOrBefore(iso, weekday), -7 * (n - 1));
}
