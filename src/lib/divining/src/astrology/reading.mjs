import { corroborating, settleReading } from "../reading.mjs";
import { aspectsInChart } from "./aspects.mjs";

export function buildChartPanel(chart){return Object.freeze(aspectsInChart(chart.bodies).map((hit)=>corroborating("astrology",`${hit.bodyA}-${hit.aspect.name}-${hit.bodyB}`)));}
export const readChart=(chart,question)=>settleReading(question,chart.time,buildChartPanel(chart));
