import { joinKnowledge, negate } from "@lenticule-science/metrologic/articulation/predicating/positing";
import { castIChing, type Cast, type CastLine } from "./iching.mts";
import { corroborating, refuting, settleReading, signing, type Reading, type SignWitness } from "../reading.mts";

function changingCharge(label: string) {
  const support = corroborating("iching", label);
  return joinKnowledge(support.charge, negate(support.charge));
}

function lineSign(line: CastLine): SignWitness {
  const label = `line${line.position}`;
  if (line.changing) return signing("iching", `${label}:changing`, changingCharge(`${label}:${line.value}`));
  return line.polarity === "yang"
    ? corroborating("iching", label)
    : refuting("iching", label);
}

/** One FOUR-valued witness for every line in an existing cast. */
export function buildCastPanel(cast: Cast): readonly SignWitness[] {
  return Object.freeze(cast.lines.map(lineSign));
}

export function buildPanel(query: string): readonly SignWitness[] {
  return buildCastPanel(castIChing(query));
}

/** Settle a deterministic I Ching cast; changing lines retain their both-sided charge. */
export function read(query: string, question: string): Reading {
  const cast = castIChing(query);
  return settleReading(question, cast.label, buildCastPanel(cast));
}

