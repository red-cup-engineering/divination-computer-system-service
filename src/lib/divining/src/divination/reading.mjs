import { corroborating, refuting, settleReading } from "../reading.mjs";
import { reduceDate } from "./numerology.mjs";
import { dailySpread } from "./tarot.mjs";
export const buildSpreadPanel = (spread) => Object.freeze(spread.positions.map(({ card, orientation }) => orientation === "upright" ? corroborating("tarot", card.name) : refuting("tarot", card.name)));
export const buildReductionPanel = (reduction) => Object.freeze(reduction.steps.map((step) => corroborating("numerology", String(step))));
export function readSpread(input, question) { const spread = typeof input === "string" ? dailySpread(input) : input; return settleReading(question, spread.date, buildSpreadPanel(spread)); }
export function readReduction(input, question) { const reduction = reduceDate(String(input)); return settleReading(question, reduction.date, buildReductionPanel(reduction)); }
