/**
 * @emsenn/divining/topology — divining carriers over communicating carriers.
 *
 * A divining carrier is not a tarot spread, chart, date, or generated omen.
 * Those are readings or representation witnesses. The carrier is the admitted
 * question/context as communication, already normalized through relating
 * Mark/Utterance topology.
 */

import {
  communicate,
  type CommunicatingCarrier,
  type CommunicationClaim,
  type CommunicationToken,
} from "@emsenn/communicating";

export type DiviningToken = CommunicationToken;
export type DiviningClaim = CommunicationClaim;

export interface DiviningCarrier {
  readonly kind: "divining.carrier";
  readonly communication: CommunicatingCarrier;
}

/**
 * Admit a divining question/context through communicating.
 *
 * Domain: communication token x optional communication claim.
 * Codomain: divining carrier.
 * Normalization: token/claim -> communicating carrier -> relating utterance.
 */
export function admitDivining(token: DiviningToken, claim?: DiviningClaim): DiviningCarrier {
  return Object.freeze({
    kind: "divining.carrier" as const,
    communication: communicate("communicating.admit", token, claim).carrier,
  });
}
