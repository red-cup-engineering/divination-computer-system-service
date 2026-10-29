import { mark } from "@red-cup-engineering/computer-data-engine/utterance";
import {
  bottom, joinKnowledge, negate, valueOf, witnessedPotential,
  type ChargeCarrier, type ChargeValueName,
} from "@lenticule-science/metrologic/articulation/predicating/positing";

/** A practice witness carrying the house's canonical FOUR charge. */
export type SignWitness = Readonly<{ source: string; label: string; charge: ChargeCarrier }>;
export type Reading = Readonly<{
  question: string;
  cut: string;
  panel: readonly SignWitness[];
  settlement: ChargeCarrier;
  value: ChargeValueName;
}>;

export function corroborating(source: string, label: string): SignWitness {
  return Object.freeze({ source, label, charge: witnessedPotential(mark(Object.freeze({ source, label }))) });
}

export function refuting(source: string, label: string): SignWitness {
  const witness = corroborating(source, label);
  return Object.freeze({ ...witness, charge: negate(witness.charge) });
}

/** Carry a practice's already-computed FOUR charge without reducing it. */
export function signing(source: string, label: string, charge: ChargeCarrier): SignWitness {
  return Object.freeze({ source, label, charge });
}

export function settleReading(question: string, cut: string, panel: readonly SignWitness[]): Reading {
  if (question.trim() === "" || cut.trim() === "") throw new TypeError("reading requires a question and cut");
  const frozenPanel = Object.freeze([...panel]);
  const settlement = frozenPanel.reduce((charge, witness) => joinKnowledge(charge, witness.charge), bottom);
  return Object.freeze({ question, cut, panel: frozenPanel, settlement, value: valueOf(settlement).name });
}
