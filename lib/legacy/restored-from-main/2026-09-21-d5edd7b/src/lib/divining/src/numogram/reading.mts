import { corroborating, refuting, settleReading, type Reading, type SignWitness } from "../reading.mts";
import { castNumogram, type NumogramCast } from "./numogram.mts";
export const castLabel=(cast:NumogramCast):string=>`zone ${cast.zone}; gate ${cast.gate}; twin ${cast.twin}`;
export function buildPanelFromCast(cast:NumogramCast):readonly SignWitness[]{const panel=[corroborating("numogram",`zone-${cast.zone}`),corroborating("numogram",`gate-${cast.gate}`)]; panel.push(cast.outerCurrent?refuting("numogram",`twin-${cast.twin}`):corroborating("numogram",`twin-${cast.twin}`)); if(cast.voidWhole)panel.push(corroborating("numogram","void-whole")); return Object.freeze(panel);}
export const read=(query:string,question:string):Reading=>{const cast=castNumogram(query);return settleReading(question,cast.query,buildPanelFromCast(cast));};
