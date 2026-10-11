/**
 * Public Opele structure only: positions and the Odu's structural parity carry
 * evidence. This module does not encode initiated Ifa corpus or interpretation.
 */
import { negate } from "@red-cup-engineering/signchain/bilattice";
import { castOpele } from "./ifa.mjs";
import { corroborating, refuting, settleReading, signing } from "../reading.mjs";

function oduEvidence(cast) {
  const label = `odu:${cast.compound}`;
  const support = corroborating("ifa", label);
  const openCount = cast.marks.reduce((total, mark) => total + mark, 0);
  return openCount % 2 === 0 ? support.evidence : negate(support.evidence);
}

/** Eight public binary marks plus the named Odu with parity-only evidence. */
export function buildPanelFromCast(cast) {
  const positions = cast.marks.map((mark, position) =>
    mark === 1
      ? corroborating("ifa", `pos${position}`)
      : refuting("ifa", `pos${position}`),
  );
  return Object.freeze([
    ...positions,
    signing("ifa", `odu:${cast.compound}`, oduEvidence(cast)),
  ]);
}

export function buildPanel(query) {
  return buildPanelFromCast(castOpele(query));
}

/** Settle a deterministic public Opele cast without assigning sacred meanings. */
export function readCast(query, question) {
  return settleReading(question, query, buildPanel(query));
}
