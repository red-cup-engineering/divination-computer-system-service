import { corroborating, refuting, settleReading } from "../reading.mjs";
import { castNumogram } from "./numogram.mjs";
export const castLabel=(cast)=>`zone ${cast.zone}; gate ${cast.gate}; twin ${cast.twin}`;
export function buildPanelFromCast(cast){const panel=[corroborating("numogram",`zone-${cast.zone}`),corroborating("numogram",`gate-${cast.gate}`)]; panel.push(cast.outerCurrent?refuting("numogram",`twin-${cast.twin}`):corroborating("numogram",`twin-${cast.twin}`)); if(cast.voidWhole)panel.push(corroborating("numogram","void-whole")); return Object.freeze(panel);}
export const read=(query,question)=>{const cast=castNumogram(query);return settleReading(question,cast.query,buildPanelFromCast(cast));};
