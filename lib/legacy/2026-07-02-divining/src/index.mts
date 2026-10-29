/**
 * @emsenn/divining — sign-reading downstream of communicating.
 *
 * The package root is the universal admission surface. It admits a boundary
 * question/context through `@emsenn/communicating`, which itself normalizes to
 * relating Mark/Utterance carriers. Astrology, tarot, numerology, calendar, and
 * liturgy live on explicit subpaths as derived reading categories and
 * representation boundaries.
 */

import {
  admitDivining,
  type DiviningCarrier,
  type DiviningClaim,
  type DiviningToken,
} from "./topology/index.mjs";

export type {
  DiviningCarrier,
  DiviningClaim,
  DiviningToken,
} from "./topology/index.mjs";

export type DiviningAction = "divining.admit";

export interface DiviningAdmission {
  readonly action: DiviningAction;
  readonly carrier: DiviningCarrier;
}

/**
 * Admit a divining act into the communicating/relating substrate.
 *
 * Domain: `divining.admit x token x claim?`, where token and claim are boundary
 * communication documents or already admitted communicating tokens.
 * Codomain: a divining carrier over a communicating carrier.
 * Law: every divining question normalizes through
 * `communicating -> Mark -> Utterance -> relating articulate`; no spread,
 * chart, calendar date, or omen is primitive at the root.
 */
export function divine(action: DiviningAction, token: DiviningToken, claim?: DiviningClaim): DiviningAdmission {
  if (action !== "divining.admit") {
    throw new TypeError(`divine: unsupported action ${JSON.stringify(action)}`);
  }
  return Object.freeze({
    action,
    carrier: admitDivining(token, claim),
  });
}

// ── the settled Reading: diagnosis/prediction as the σ-dual, gauged by D₄ ──
export {
  cut,
  corroborating,
  refuting,
  signing,
  adjudicate,
  panelConsensus,
  read,
  readingDuality,
  cognize,
  cutOf,
} from "./articulating/predicating/positing/settling/reading.mjs";
export type {
  DiviningCut,
  SignWitness,
  OrbitImage,
  Reading,
  ReadingConsensus,
  ReadingDualityJudgment,
  ReadingStanding,
  ReadingCognition,
  ReadingInteraction,
} from "./articulating/predicating/positing/settling/reading.mjs";

// ── practicing: the uniform Practice template + registry (one method per module) ──
export {
  registerPractice,
  practices,
  practiceNamed,
  astrology,
  cartomancy,
  numerology,
  computus,
  lectionary,
  numogram,
  iching,
  geomancy,
  runes,
  ifa,
  starknowledge,
} from "./practicing/index.mjs";
export type {
  Practice,
  AstrologyQuery,
  CartomancyQuery,
  NumerologyQuery,
  ComputusQuery,
  LectionaryQuery,
  NumogramQuery,
  IChingQuery,
  GeomancyQuery,
  RunesQuery,
  IfaQuery,
  StarKnowledgeQuery,
} from "./practicing/index.mjs";
