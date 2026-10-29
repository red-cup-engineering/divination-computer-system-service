import { corroborating, settleReading, type Reading, type SignWitness } from "../reading.mts";
import { aspectsInChart } from "./aspects.mts";
import type { Chart } from "@lenticule-science/astronomy-services-section";
export function buildChartPanel(chart:Chart):readonly SignWitness[]{return Object.freeze(aspectsInChart(chart.bodies).map((hit)=>corroborating("astrology",`${hit.bodyA}-${hit.aspect.name}-${hit.bodyB}`)));}
export const readChart=(chart:Chart,question:string):Reading=>settleReading(question,chart.time,buildChartPanel(chart));
