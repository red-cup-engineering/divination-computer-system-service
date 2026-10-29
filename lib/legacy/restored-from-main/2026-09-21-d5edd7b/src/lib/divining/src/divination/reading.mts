import { corroborating, refuting, settleReading, type Reading, type SignWitness } from "../reading.mts";
import { reduceDate, type DateReduction } from "./numerology.mts";
import { dailySpread, type Spread } from "./tarot.mts";
export const buildSpreadPanel = (spread: Spread): readonly SignWitness[] => Object.freeze(spread.positions.map(({ card, orientation }) => orientation === "upright" ? corroborating("tarot", card.name) : refuting("tarot", card.name)));
export const buildReductionPanel = (reduction: DateReduction): readonly SignWitness[] => Object.freeze(reduction.steps.map((step) => corroborating("numerology", String(step))));
export function readSpread(input: Spread | string, question: string): Reading { const spread = typeof input === "string" ? dailySpread(input) : input; return settleReading(question, spread.date, buildSpreadPanel(spread)); }
export function readReduction(input: string | number, question: string): Reading { const reduction = reduceDate(String(input)); return settleReading(question, reduction.date, buildReductionPanel(reduction)); }
