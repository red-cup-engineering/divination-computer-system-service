import { Buffer } from "node:buffer";

import { append } from "@red-cup-engineering/semiotic-eavt-services-section/store";

/** A daily-reading witness row is one line of the `daily-reading` log: `{at, e, a, v}`, each a plain string. */
const directSeavt = (entity, attribute, value, time) => ({ at: time, e: entity, a: attribute, v: value });

function niSurface(role, token) {
  const match = /^ni:\/\/\/sha-256;([A-Za-z0-9_-]{43})$/u.exec(token);
  if (match === null) throw new TypeError(`${role} must be an ni:///sha-256 semantic-content token`);
  return `semantic-content.${role}.sha256.${Buffer.from(match[1], "base64url").toString("hex")}`;
}

export function appendDailyReadingWitness(root, at, values) {
  const entity = niSurface("completion", values.completion);
  const rows = [
    directSeavt(entity, "daily-reading:proposal", niSurface("proposal", values.proposal), at),
    directSeavt(entity, "daily-reading:completion", niSurface("completion", values.completion), at),
    directSeavt(entity, "daily-reading:evidence", niSurface("evidence", values.evidence), at),
    directSeavt(entity, "daily-reading:transition-witness", niSurface("transition-witness", values.witness), at),
    directSeavt(entity, "daily-reading:disposition", `daily-reading.disposition.${values.disposition}`, at),
  ];
  for (const row of rows) append(root, "daily-reading", row);
  return rows.length;
}
