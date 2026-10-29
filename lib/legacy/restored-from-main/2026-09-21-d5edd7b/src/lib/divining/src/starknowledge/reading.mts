import { corroborating, settleReading, type Reading, type SignWitness } from "../reading.mts";
import { seasonalPosition } from "./starknowledge.mts";
export function buildSkyPanel(date:string):readonly SignWitness[]{const sky=seasonalPosition(date);const panel:SignWitness[]=[corroborating("starknowledge",sky.season)];if(sky.threshold)panel.push(corroborating("starknowledge",sky.threshold));if(sky.journey)panel.push(corroborating("starknowledge",sky.journey.constellation));return Object.freeze(panel);}
export const readSky=(date:string,question:string):Reading=>settleReading(question,date,buildSkyPanel(date));
