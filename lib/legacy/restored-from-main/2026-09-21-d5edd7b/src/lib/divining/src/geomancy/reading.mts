import { joinKnowledge, negate } from "@lenticule-science/metrologic/articulation/predicating/positing";
import { castShield, nameFigure, type Figure, type Shield, type Valence } from "./geomancy.mts";
import { corroborating, refuting, settleReading, signing, type Reading, type SignWitness } from "../reading.mts";

function bothCharge(label: string) {
  const support = corroborating("geomancy", label);
  return joinKnowledge(support.charge, negate(support.charge));
}

function signOf(figure: Figure): SignWitness {
  const named = nameFigure(figure);
  if (named.valence === "favorable") return corroborating("geomancy", named.name);
  if (named.valence === "unfavorable") return refuting("geomancy", named.name);
  return signing("geomancy", named.name, bothCharge(named.name));
}

/** The four mothers, two witnesses, and judge of one shield as settled testimony. */
export function buildShieldPanel(shield: Shield): readonly SignWitness[] {
  return Object.freeze([
    ...shield.mothers.map(signOf),
    signOf(shield.rightWitness),
    signOf(shield.leftWitness),
    signOf(shield.judge),
  ]);
}

export function buildPanel(query: string): readonly SignWitness[] {
  return buildShieldPanel(castShield(query));
}

/** Settle a deterministic geomantic shield over one question. */
export function readShield(query: string, question: string): Reading {
  return settleReading(question, query, buildPanel(query));
}

