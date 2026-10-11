import { knowledgeJoin, negate } from "@red-cup-engineering/signchain/bilattice";
import { castIChing } from "./iching.mjs";
import { corroborating, refuting, settleReading, signing } from "../reading.mjs";

function changingEvidence(label) {
  const support = corroborating("iching", label);
  return knowledgeJoin(support.evidence, negate(support.evidence));
}

function lineSign(line) {
  const label = `line${line.position}`;
  if (line.changing) return signing("iching", `${label}:changing`, changingEvidence(`${label}:${line.value}`));
  return line.polarity === "yang"
    ? corroborating("iching", label)
    : refuting("iching", label);
}

/** One FOUR-valued witness for every line in an existing cast. */
export function buildCastPanel(cast) {
  return Object.freeze(cast.lines.map(lineSign));
}

export function buildPanel(query) {
  return buildCastPanel(castIChing(query));
}

/** Settle a deterministic I Ching cast; changing lines retain their both-sided evidence. */
export function read(query, question) {
  const cast = castIChing(query);
  return settleReading(question, cast.label, buildCastPanel(cast));
}

