// Reading: the lectionary settlement recast as a SignWitness panel flowing
// through the package's divining Reading core.
//
// This domain resolves the lections appointed for a date under the Revised
// Common Lectionary and the General Roman Calendar. Those appointed lections
// are the day's sign-witnesses: each is a piece of concurring testimony about
// "what is read today". Instead of folding them in-package, this module emits
// one `SignWitness` per appointed lection and hands the panel to the core
// `read` (the same knowledge-join adjudication astrology's `reading` consumes).
//
// Concurrence vs divergence. A lection the two traditions agree on
// CORROBORATES; where the RCL and the Roman calendar DISAGREE on what a date
// appoints — its Sunday cycle letter, or its appointed day/observance — the
// divergent testimony is REFUTING, so a genuine cross-lectionary divergence
// reads as a `stable` diagnosis (⊤, "told both"): the conflict is held local
// to the question-cell, not exploded. When the two agree (the common case,
// since the RCL's cycle is computed off the same Roman advent-year structure),
// the panel glues and the diagnosis is a plain affirmation.
//
// Every witness is keyed by a real lectionary reference/pericope or observance
// name produced by this domain's own functions (lectionFor, romanDay,
// properOfSunday, dailyRelation, rclYear) — never reimplemented here.

import {
  corroborating,
  refuting,
  cut,
  read,
  divine,
  type SignWitness,
  type Reading,
  type DiviningCarrier,
  type DiviningToken,
} from "../index.mjs";

import { lectionFor } from "./lection.mjs";
import { properOfSunday, dailyRelation, rclYear } from "./rcl.mjs";
import { romanDay } from "./roman.mjs";

/** Admit a question that may be a raw string (a boundary token, admitted through
 * `divine`) or an already-admitted DiviningCarrier (passed through). */
function admitQuestion(question: DiviningCarrier | string): DiviningCarrier {
  if (typeof question === "string") {
    return divine("divining.admit", question as DiviningToken).carrier;
  }
  return question;
}

/** Key a single appointed RCL reading by its role, track (where the lectionary
 * forks), and citation — the pericope reference is the witness name. */
function readingWitnessKey(
  role: string,
  citation: string,
  track: string | undefined,
): string {
  const trackPart = track === undefined ? "" : `/${track}`;
  return `rcl:${role}${trackPart}:${citation}`;
}

/**
 * The SignWitness panel for one date: one witness per appointed lection across
 * both traditions, with cross-lectionary divergences emitted as refuting.
 *
 *  • Each RCL reading appointed for the date (its pericope, by role and track)
 *    is one CORROBORATING witness — the day's concurring textual testimony,
 *    taken straight from `lectionFor(iso, "rcl")`.
 *  • The Roman calendar's appointed day is read from `romanDay(iso)`: each
 *    observance (the solemnity/feast/Sunday/weekday the date carries) is one
 *    CORROBORATING witness. The Roman lectionary's reading tables are not
 *    recorded in this package, so its testimony is the appointed observance, not
 *    a pericope — `lectionFor(iso, "roman")` reports that absence honestly.
 *  • The two traditions are then compared where they BOTH speak: the Sunday
 *    cycle letter (RCL `rclYear` vs Roman `romanDay().cycles.sunday`) and, on a
 *    Sunday, the appointed proper/observance name. Where they DIVERGE, a
 *    REFUTING witness is emitted so the panel holds the conflict at `stable`.
 *
 * No lectionary logic is computed here; every fact comes from this domain's
 * existing functions.
 */
export function buildLectionPanel(iso: string): SignWitness[] {
  const panel: SignWitness[] = [];

  // ── RCL: one corroborating witness per appointed reading (its pericope). ──
  const rcl = lectionFor(iso, "rcl");
  if (rcl.outcome === "found") {
    for (const r of rcl.entry.readings) {
      panel.push(corroborating(readingWitnessKey(r.role, r.citation, r.track)));
    }
  }

  // ── Roman: the appointed day's observances are its (calendar) testimony. ──
  const roman = romanDay(iso);
  for (const obs of roman.observances) {
    panel.push(corroborating(`roman:${obs.rank}:${obs.name}`));
  }

  // ── Cross-lectionary divergence: where the two traditions BOTH speak. ──
  // Sunday cycle letter. The RCL computes its cycle off the same Roman
  // advent-year structure, so these normally agree (a concurring witness); a
  // genuine divergence would refute and hold the panel at `stable`.
  const rclCycle = rclYear(iso);
  const romanCycle = roman.cycles.sunday;
  if (rclCycle === romanCycle) {
    panel.push(corroborating(`cycle:agree:${rclCycle}`));
  } else {
    panel.push(refuting(`cycle:diverge:rcl=${rclCycle}|roman=${romanCycle}`));
  }

  // Appointed day. On a Sunday the RCL names a Proper while the Roman calendar
  // names the day's observance(s); where the RCL records a proper for the date
  // but the Roman appointment is an ordinary Sunday with no matching solemnity,
  // the two diverge on what the day IS — a refuting witness.
  const proper = properOfSunday(iso);
  if (proper.kind === "proper") {
    const romanNamesProper = roman.observances.some(
      (obs) => obs.rank === "solemnity" || obs.rank === "feast",
    );
    const rclEntryName = rcl.outcome === "found" ? rcl.entry.name : undefined;
    if (rclEntryName !== undefined && !romanNamesProper) {
      // RCL appoints Proper N (Ordinary-Time Sunday); Roman carries no
      // solemnity/feast displacing it — the appointed days concur.
      panel.push(corroborating(`day:agree:${rclEntryName}`));
    } else if (rclEntryName !== undefined && romanNamesProper) {
      // RCL still reads the Proper, but the Roman calendar's solemnity/feast
      // DISPLACES the Sunday proper — the two appoint different days.
      const romanDayName = roman.observances[0]?.name ?? "(observance)";
      panel.push(refuting(`day:diverge:rcl=${rclEntryName}|roman=${romanDayName}`));
    }
  } else {
    // Not a proper Sunday: the daily lectionary's relation to its Sunday is the
    // RCL's structural testimony for the date — a concurring witness.
    const relation = dailyRelation(iso);
    panel.push(corroborating(`daily:${relation.relation}:${relation.sunday}`));
  }

  return panel;
}

/**
 * Read the lections appointed for a date into a Reading of the question.
 *
 * Admit the question (a raw string through `divine`, or an already-admitted
 * carrier passed through), build the date's lection panel by reusing this
 * domain's resolvers, and read it through the core `read` at `cut(iso)`.
 *
 * A date the two lectionaries agree on glues into one common section and reads
 * as a plain affirmation; a genuine cross-lectionary divergence (a clashing
 * cycle letter, or a Roman solemnity displacing the RCL proper) puts a refuting
 * witness against the corroborating ones, and the core's knowledge-join holds
 * that as a `stable` diagnosis (holdsContradiction === true) — a stable
 * diagnosis of standing disagreement, not an explosion.
 */
export function readLections(iso: string, question: DiviningCarrier | string): Reading {
  const carrier = admitQuestion(question);
  return read(carrier, cut(iso), buildLectionPanel(iso));
}
