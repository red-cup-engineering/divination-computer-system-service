// The daily-indicators carrier: the bundle of symbolic indicators a daily
// interpretive reading synthesizes.
//
// Vocabulary: the required indicators follow the Routine Read's canon — the
// Moon's phase and sign, one planetary aspect or ingress, one tarot card,
// the date's numerological reduction, and a lection (a cited liturgical
// reading used interpretively). Optional signals are synthesized texture
// (dream fragment, historical echo, elemental signature, metaphor object,
// color tone); each carries the provenance of its synthesizer, because a
// synthesized signal is still a claim about what was synthesized, by what.
//
// This module mounts the astrology vocabulary; it adds no astrology of its
// own.

import type {
  AspectHit,
  IngressEvent,
  Lunation,
  SignPlacement,
} from "../astrology/index.mjs";
import type { Spread } from "./tarot.mjs";
import type { DateReduction } from "./numerology.mjs";

export type Lection = Readonly<{
  /** The lectionary cycle the reading is cited from (e.g. "RCL daily, Year A"). */
  cycle: string;
  /** The citation, e.g. "Psalm 130:5". */
  reference: string;
  /** The verse text, if carried; translation named when it is. */
  text?: string;
  translation?: string;
}>;

export type SynthesizedSignal = Readonly<{
  kind: "dream" | "historical-echo" | "elemental-signature" | "metaphor-object" | "color-tone";
  text: string;
  /** Who or what synthesized the signal (model name, person, method). */
  synthesizer: string;
}>;

/** The day's featured planetary motion: an aspect within orb or an ingress. */
export type FeaturedMotion =
  | Readonly<{ kind: "aspect"; aspect: AspectHit; exactTime?: string }>
  | Readonly<{ kind: "ingress"; ingress: IngressEvent }>;

export type DailyIndicators = Readonly<{
  /** The day being read, ISO 8601 date. */
  date: string;
  /** The instant the chart was computed at, ISO 8601 UTC. */
  chartTime: string;
  moon: Readonly<{
    placement: SignPlacement;
    lunation: Lunation;
  }>;
  motion: FeaturedMotion;
  tarot: Spread;
  numerology: DateReduction;
  lection: Lection;
  signals: readonly SynthesizedSignal[];
}>;
