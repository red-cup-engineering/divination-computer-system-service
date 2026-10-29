import { corroborating, settleReading, type Reading, type SignWitness } from "../reading.mts";
import { easterDate } from "./computus.mts";
import { goldenNumber, dayOfYear } from "./cycles.mts";
import { parseIsoDate } from "./iso-date.mts";
import { feastDate, type Feast } from "./feast.mts";
export type NamedFeast = Readonly<{ name: string; feast: Feast }>;
export function buildDatePanel(iso: string, feasts: readonly NamedFeast[] = []): readonly SignWitness[] { const date=parseIsoDate(iso); const panel: SignWitness[]=[]; if(easterDate(date.year)===iso) panel.push(corroborating("calendar","easter")); if(dayOfYear(iso)===1) panel.push(corroborating("calendar","year-head")); if(goldenNumber(date.year)===1&&date.month===1&&date.day===1) panel.push(corroborating("calendar","metonic-anchor")); for(const {name,feast} of feasts) if(feastDate(feast,date.year)===iso) panel.push(corroborating("calendar",name)); return Object.freeze(panel); }
export const readDate=(iso:string,question:string,feasts:readonly NamedFeast[]=[]):Reading=>settleReading(question,iso,buildDatePanel(iso,feasts));
