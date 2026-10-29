// Reading: the calendar/computus settlement recast as a SignWitness panel
// flowing through the package's divining Reading core.
//
// The other calendar modules compute, in pure integer arithmetic, what a date
// IS in the liturgical/computus reckoning: where it sits in the Metonic and
// year-line cycles (cycles), whether it bears a feast (feast), and whether it
// is the Easter the computus reckons for its year (computus). This module reads
// a date the way astrology/reading.mts reads a body: it reuses exactly those
// existing date-math functions — easterDate, goldenNumber, dayOfYear, isoWeek,
// feastDate — and instead of returning their raw values, it emits one
// `SignWitness` per calendrical feature and hands the panel to the core `read`.
//
// A feature the date POSITIVELY bears (it IS Easter Sunday; it IS the feast's
// reckoned date; it sits ON the named cycle point) is a CORROBORATING witness.
// The ABSENCE of a feature is NOT a refutation — it is SILENCE: an ordinary day
// that bears no reckoned marker carries no omen, and an empty panel reads as
// `absurd` (⊥, no sign / the open day), not as a counter-indication. Refutation
// is reserved for a genuine CONFLICT between markers (a real contradiction in the
// reckoning); deterministic computus does not contradict itself, so on its own a
// date corroborates or stays silent — a richly-marked day (Easter, a feast) reads
// as an affirmed `potential`, an unremarkable day as `absurd`. (Cross-system
// conflict, as in the liturgy domain's RCL-vs-Roman divergence, is where a
// calendrical `stable` would legitimately arise.) No date math is reimplemented
// here; the witnesses are computed calendrical facts, not toy tokens.

import { easterDate } from "./computus.mjs";
import { goldenNumber, dayOfYear, isoWeek } from "./cycles.mjs";
import { feastDate, type Feast } from "./feast.mjs";
import { dayOfWeek, parseIsoDate, addDays, formatIsoDate } from "./iso-date.mjs";
import {
  corroborating,
  cut,
  read,
  divine,
  type SignWitness,
  type Reading,
  type DiviningCarrier,
  type DiviningToken,
} from "../index.mjs";

/** Admit a question that may be a raw string (a boundary token, admitted through
 * `divine`) or an already-admitted DiviningCarrier (passed through). */
function admitQuestion(question: DiviningCarrier | string): DiviningCarrier {
  if (typeof question === "string") {
    return divine("divining.admit", question as DiviningToken).carrier;
  }
  return question;
}

/** A named feast the panel will test the date against: its rule plus the witness
 * name carried into the Reading when the date bears (or fails to bear) it. */
export type NamedFeast = Readonly<{
  /** The witness key — e.g. "easter", "ash-wednesday". */
  name: string;
  feast: Feast;
}>;

/**
 * The SignWitness panel for one date: one witness per calendrical feature.
 *
 * Computus feature — "easter": the date corroborates when it IS the computus's
 * reckoned Easter Sunday for its civil year (easterDate(year) === iso), and
 * refutes when that expected marker is absent (the date is not the reckoned
 * Easter). The reckoning is easterDate's, never recomputed here.
 *
 * Cycle features — read off the same quotients cycles.mts exposes, projected to
 * the sign of "does the date sit ON this reckoned cycle point?":
 *   - "metonic-anchor": the date is the first day (Jan 1) of a year whose
 *     golden number is 1 — the head of the 19-year Metonic cycle.
 *   - "isoweek-thursday": the date is the Thursday that OWNS its ISO week (the
 *     day whose civil year names the week). Every ISO week has exactly one; the
 *     date corroborates on it and refutes off it.
 *   - "year-head": the date is day-of-year 1, the head of its year's orbit.
 *
 * Feast features — one witness per supplied NamedFeast: corroborates when the
 * date equals that feast's feastDate for its year, refutes when it is absent.
 *
 * Every test reuses an existing calendar function; none of the date math is
 * reimplemented. The witness keys are feature names, matching the template's
 * one-witness-per-(named claim) shape.
 */
export function buildDatePanel(
  iso: string,
  feasts: readonly NamedFeast[] = [],
): SignWitness[] {
  const civil = parseIsoDate(iso);
  const { year } = civil;
  const panel: SignWitness[] = [];

  // Each feature speaks only when the date POSITIVELY bears it; an absent marker is
  // silence, not a refutation (so an unmarked day yields an empty panel → `absurd`).

  // ── computus ──
  if (easterDate(year) === iso) panel.push(corroborating("easter"));

  // ── cycles ──
  if (civil.month === 1 && civil.day === 1 && goldenNumber(year) === 1) {
    panel.push(corroborating("metonic-anchor"));
  }

  // The day whose civil year owns the date's ISO week is that week's Thursday.
  const week = isoWeek(iso);
  if (dayOfWeek(iso) === "thursday" && civil.year === week.isoYear) {
    panel.push(corroborating("isoweek-thursday"));
  }

  if (dayOfYear(iso) === 1) panel.push(corroborating("year-head"));

  // ── feasts ──
  for (const { name, feast } of feasts) {
    if (feastDate(feast, year) === iso) panel.push(corroborating(name));
  }

  return panel;
}

/**
 * Read one date: admit the question, build the date's calendrical panel, and
 * read the panel through the core `read` at `cut(iso)`.
 *
 * The cut is taken at the date's own ISO label (its instant on the day line).
 * A date that truly agrees with a reckoned marker contributes a corroborating
 * witness and the Reading affirms; a date carrying a refuting witness against
 * corroborating ones holds that conflict as a `stable` diagnosis through the
 * core's knowledge-join — the same paraconsistent hold the ephemeris reading
 * gives a cross-theory disagreement.
 */
export function readDate(
  iso: string,
  question: DiviningCarrier | string,
  feasts: readonly NamedFeast[] = [],
): Reading {
  parseIsoDate(iso); // reject malformed ISO before admitting a question.
  const carrier = admitQuestion(question);
  const panel = buildDatePanel(iso, feasts);
  return read(carrier, cut(iso), panel);
}

/**
 * Read a span of dates: a Reading per day from `iso` for `days` days, each over
 * its own calendrical panel, all against the same admitted question. The cut of
 * each Reading is that day's own ISO label.
 */
export function readSpan(
  iso: string,
  days: number,
  question: DiviningCarrier | string,
  feasts: readonly NamedFeast[] = [],
): Record<string, Reading> {
  if (!Number.isInteger(days) || days < 1) {
    throw new TypeError(`days must be a positive integer: ${days}`);
  }
  parseIsoDate(iso);
  const carrier = admitQuestion(question);
  const readings: Record<string, Reading> = {};
  for (let offset = 0; offset < days; offset += 1) {
    const dayIso = formatIsoDate(parseIsoDate(addDays(iso, offset)));
    readings[dayIso] = read(carrier, cut(dayIso), buildDatePanel(dayIso, feasts));
  }
  return readings;
}
