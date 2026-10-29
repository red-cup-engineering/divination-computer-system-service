import { corroborating, refuting, settleReading, type Reading, type SignWitness } from "../reading.mts";
import { lectionFor } from "./lection.mts";
import { romanDay } from "./roman.mts";
export function buildLectionPanel(iso:string):readonly SignWitness[]{const panel:SignWitness[]=[]; const rcl=lectionFor(iso,"rcl"); const roman=lectionFor(iso,"roman"); if(rcl.outcome==="found")panel.push(corroborating("rcl",rcl.entry.name)); if(roman.outcome==="found")panel.push(corroborating("roman",roman.entry.name)); if(rcl.outcome==="found"&&roman.outcome==="found"&&rcl.entry.name!==roman.entry.name) panel.push(refuting("liturgy","cross-tradition-divergence")); const day=romanDay(iso); panel.push(corroborating("roman",day.season)); return Object.freeze(panel);}
export const readLections=(iso:string,question:string):Reading=>settleReading(question,iso,buildLectionPanel(iso));
