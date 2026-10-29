/**
 * Public Opele structure only: positions and the Odu's structural parity carry
 * evidence. This module does not encode initiated Ifa corpus or interpretation.
 */
import { negate } from "@lenticule-science/metrologic/articulation/predicating/positing";
import { castOpele, type IfaCast } from "./ifa.mts";
import { corroborating, refuting, settleReading, signing, type Reading, type SignWitness } from "../reading.mts";

function oduCharge(cast: IfaCast) {
  const label = `odu:${cast.compound}`;
  const support = corroborating("ifa", label);
  const openCount = cast.marks.reduce<number>((total, mark) => total + mark, 0);
  return openCount % 2 === 0 ? support.charge : negate(support.charge);
}

/** Eight public binary marks plus the named Odu with a parity-only charge. */
export function buildPanelFromCast(cast: IfaCast): readonly SignWitness[] {
  const positions = cast.marks.map((mark, position) =>
    mark === 1
      ? corroborating("ifa", `pos${position}`)
      : refuting("ifa", `pos${position}`),
  );
  return Object.freeze([
    ...positions,
    signing("ifa", `odu:${cast.compound}`, oduCharge(cast)),
  ]);
}

export function buildPanel(query: string): readonly SignWitness[] {
  return buildPanelFromCast(castOpele(query));
}

/** Settle a deterministic public Opele cast without assigning sacred meanings. */
export function readCast(query: string, question: string): Reading {
  return settleReading(question, query, buildPanel(query));
}
