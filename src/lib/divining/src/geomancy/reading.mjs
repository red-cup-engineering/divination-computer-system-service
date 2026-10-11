import { knowledgeJoin, negate } from "@red-cup-engineering/signchain/bilattice";
import { castShield, nameFigure } from "./geomancy.mjs";
import { corroborating, refuting, settleReading, signing } from "../reading.mjs";

function bothEvidence(label) {
  const support = corroborating("geomancy", label);
  return knowledgeJoin(support.evidence, negate(support.evidence));
}

function signOf(figure) {
  const named = nameFigure(figure);
  if (named.valence === "favorable") return corroborating("geomancy", named.name);
  if (named.valence === "unfavorable") return refuting("geomancy", named.name);
  return signing("geomancy", named.name, bothEvidence(named.name));
}

/** The four mothers, two witnesses, and judge of one shield as settled testimony. */
export function buildShieldPanel(shield) {
  return Object.freeze([
    ...shield.mothers.map(signOf),
    signOf(shield.rightWitness),
    signOf(shield.leftWitness),
    signOf(shield.judge),
  ]);
}

export function buildPanel(query) {
  return buildShieldPanel(castShield(query));
}

/** Settle a deterministic geomantic shield over one question. */
export function readShield(query, question) {
  return settleReading(question, query, buildPanel(query));
}

