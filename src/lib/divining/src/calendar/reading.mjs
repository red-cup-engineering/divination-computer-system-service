import { corroborating, settleReading } from "../reading.mjs";
import { easterDate } from "./computus.mjs";
import { goldenNumber, dayOfYear } from "./cycles.mjs";
import { parseIsoDate } from "./iso-date.mjs";
import { feastDate } from "./feast.mjs";

export function buildDatePanel(iso, feasts = []) { const date=parseIsoDate(iso); const panel=[]; if(easterDate(date.year)===iso) panel.push(corroborating("calendar","easter")); if(dayOfYear(iso)===1) panel.push(corroborating("calendar","year-head")); if(goldenNumber(date.year)===1&&date.month===1&&date.day===1) panel.push(corroborating("calendar","metonic-anchor")); for(const {name,feast} of feasts) if(feastDate(feast,date.year)===iso) panel.push(corroborating("calendar",name)); return Object.freeze(panel); }
export const readDate=(iso,question,feasts=[])=>settleReading(question,iso,buildDatePanel(iso,feasts));
