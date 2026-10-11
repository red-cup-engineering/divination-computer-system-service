import { knowledgeReading } from "@red-cup-engineering/signcell/cell";
import { knowledgeJoin, negate, noEvidence, witnessedFor } from "@red-cup-engineering/signchain/bilattice";

/** A practice witness carrying its told evidence. */

export function corroborating(source, label) {
  return Object.freeze({ source, label, evidence: witnessedFor(Object.freeze({ source, label })) });
}

export function refuting(source, label) {
  const witness = corroborating(source, label);
  return Object.freeze({ ...witness, evidence: negate(witness.evidence) });
}

/** Carry a practice's already-computed evidence without reducing it. */
export function signing(source, label, evidence) {
  return Object.freeze({ source, label, evidence });
}

export function settleReading(question, cut, panel) {
  if (question.trim() === "" || cut.trim() === "") throw new TypeError("reading requires a question and cut");
  const frozenPanel = Object.freeze([...panel]);
  const settlement = frozenPanel.reduce((told, witness) => knowledgeJoin(told, witness.evidence), noEvidence);
  return Object.freeze({ question, cut, panel: frozenPanel, settlement, reading: knowledgeReading(settlement) });
}
