#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { computeDailyReadingTerm, dailyReadingType } from "./daily-reading.mjs";
export { appendDailyReadingWitness } from "./daily-reading-witness.mjs";
import { appendDailyReadingWitness } from "./daily-reading-witness.mjs";
import {
  admitJsonSemanticContent,
  EMPTY_WITNESS_ROOT,
  identifyJsonSemanticContent,
} from "@red-cup-engineering/computer-content-engineering-services-section/semantic-content-identity";
import {
  identifyNormalizedSemanticContent,
} from "@red-cup-engineering/computer-code-engineering-services-section/semiotic-expression-notation/runtime";
import { checkTerm } from "@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/typing";
import { assayWitTransition, witTransitionAgentUrl } from "@red-cup-engineering/computer-inference-engine/fabric/effect-assay";
import { ACTIVITYSTREAMS_CONTEXT } from "@red-cup-engineering/activitypub-services-section/activitystreams";

export const ACTOR = "urn:ame:divination-services-section";
export const ACCOUNT = "eip155:31337:0x4fa4554223cb86713b2d8d8f1a6d40b0b1730689";
export const CONTRACT = "ni:///sha-256;jGz3g3xPim5UlTYnC0M0y_B0zXcCvdneuJNAPCKVrd0";
export const OPERATION_TYPE = Object.freeze(["prod", ["base"], ["base"]]);
const PRECONDITION = "ni:///sha-256;ntxOpkBcnbGVC6NeD1y4X54yLK7GmBmNf2ul7IhJV2I";
const POSTCONDITION = "ni:///sha-256;am0o7fpff-A8Q_SdJFQDw0zJYBdAr8Q8EQEw4V0dWj4";
const REFUSAL = "ni:///sha-256;IebXWZ-MmX6I7pLllQ4vNRHP9SdWr32AE_pC-w15YMk";
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..");
function response(type, source, object) {
  return { "@context": ACTIVITYSTREAMS_CONTEXT, id: `urn:uuid:${randomUUID()}`, type, actor: ACTOR, target: source.actor, inReplyTo: source.id, object };
}


function document(value, name) {
  if (value?.type !== "Document" || value.mediaType !== "application/sen+cbor" || typeof value.id !== "string" || typeof value.content !== "string") {
    throw new Error(`${name} must be an ActivityStreams Document carrying application/sen+cbor bytes`);
  }
  return value;
}

function sameField(left, right, field) {
  if (left[field] !== right[field]) throw new Error(`completion changed ${field}`);
}

function persistDocument(root, doc) {
  const digest = doc.id.slice(doc.id.indexOf(";") + 1);
  const path = join(root, "objects", "sha-256", `${digest}.cbor`);
  const bytes = Buffer.from(doc.content, "base64");
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path)) {
    if (!readFileSync(path).equals(bytes)) throw new Error(`content-address collision at ${path}`);
  } else writeFileSync(path, bytes, { flag: "wx" });
}

function identifyTerm(term, expectedType, objectKind) {
  if (!checkTerm(term, expectedType)) throw new Error(`${objectKind} does not inhabit its declared SEN type`);
  const identified = identifyNormalizedSemanticContent({ objectKind, semanticType: expectedType, term, witnessRoot: EMPTY_WITNESS_ROOT });
  return { term: identified.token, normalForm: identified.envelope.settledBody, canonicalBytesBase64: Buffer.from(identified.bytes).toString("base64") };
}

export async function invokeDailyReading(source, { env = process.env, now = new Date().toISOString() } = {}) {
  if (source?.["@context"] !== ACTIVITYSTREAMS_CONTEXT || source.type !== "Accept" || source.target !== ACTOR || source.object?.type !== "ServiceContract" || source.object.contract !== CONTRACT) {
    throw new Error("daily reading must be an ActivityStreams Accept<ServiceContract> addressed to Divination's SEN law");
  }
  const proposalDoc = document(source.object.proposal, "proposal");
  const proposal = admitJsonSemanticContent({ bytes: Buffer.from(proposalDoc.content, "base64"), token: proposalDoc.id, objectKind: "divination.daily-reading-proposal" });
  const cell = proposal.value?.cell, operation = proposal.value?.operation;
  if (cell.law !== CONTRACT || cell.provider !== ACCOUNT) throw new Error("proposal is not addressed to Divination's law, smart account, and service scale");
  if (source.object.callerAccount !== cell.caller) throw new Error("callerAccount does not match the SEN caller");
  if (cell.outcome?.positiveEvidence !== false || cell.outcome?.negativeEvidence !== false) throw new Error("proposal must enter at FOUR-bottom");
  if (cell.precondition !== PRECONDITION || cell.postcondition !== POSTCONDITION || cell.refusal !== REFUSAL) throw new Error("proposal does not name Divination's exact precondition, postcondition, and refusal terms");
  if (operation?.[0] !== "pair" || operation[1]?.[0] !== "mark" || operation[2]?.[0] !== "mark") throw new Error("operation must carry exactly one date and one tradition mark");
  const operationIdentity = identifyTerm(operation, OPERATION_TYPE, "divination.daily-reading-operation").term;
  if (cell.operation !== operationIdentity) throw new Error("effect-operation-mismatch: the committed operation does not identify the bundled operation");
  const [date, tradition] = [operation[1][1], operation[2][1]];
  const started = performance.now();
  let disposition, evidence, evidenceDoc;
  try {
    const readingTerm = computeDailyReadingTerm(date, tradition);
    const reading = identifyTerm(readingTerm, dailyReadingType(readingTerm), "divination.daily-reading");
    disposition = "completion";
    evidence = reading.term;
    evidenceDoc = { type: "Document", id: reading.term, mediaType: "application/sen+cbor", content: reading.canonicalBytesBase64, profile: "org.emsenn.divination.daily-reading.v1", profileCommitment: "ni:///sha-256;MGYe_PrTQlwEYjTev0F1q3qVwHLgJlRVXsu_OXJ0Rjg" };
  } catch (error) {
    const refusal = identifyTerm(["pair", ["mark", "reading-computation-refused"], ["mark", error.message]], OPERATION_TYPE, "divination.daily-reading-refusal");
    disposition = "refused";
    evidence = refusal.term;
    evidenceDoc = { type: "Document", id: refusal.term, mediaType: "application/sen+cbor", content: refusal.canonicalBytesBase64, profile: "org.emsenn.divination.refusal.v1" };
  }
  const elapsed = Math.max(0, Math.round(performance.now() - started)).toString();
  const completionCell = {
    ...cell, evidenceRoot: evidence, outcome: { positiveEvidence: disposition === "completion", negativeEvidence: disposition === "refused" },
    measures: [
      ...cell.measures.filter(({ dimension }) => !["compute", "time", "wit"].includes(dimension)),
      { dimension: "compute", quantity: "1", unit: "daily-reading" },
      { dimension: "time", quantity: elapsed, unit: "millisecond" },
      { dimension: "wit", quantity: "1", unit: "typed-four-cover" },
    ],
  };
  for (const field of ["caller", "law", "operation", "parent", "postcondition", "precondition", "provider", "refusal" ]) sameField(cell, completionCell, field);
  const transition = await assayWitTransition({ agentUrl: witTransitionAgentUrl(env), proposalCell: cell, completionCell, evidence });
  const completionIdentity = identifyJsonSemanticContent({ objectKind: "divination.daily-reading-completion", value: { cell: completionCell, operation }, witnessRoot: EMPTY_WITNESS_ROOT });
  const completion = { term: completionIdentity.token, canonicalBytesBase64: Buffer.from(completionIdentity.bytes).toString("base64") };
  const completionDoc = { type: "Document", id: completion.term, mediaType: "application/sen+cbor", content: completion.canonicalBytesBase64 };
  const root = resolve(env.DIVINATION_DATA_ROOT ?? join(ROOT, "data"));
  persistDocument(root, evidenceDoc); persistDocument(root, completionDoc);
  appendDailyReadingWitness(root, now, { proposal: proposal.token, completion: completion.term, evidence, witness: transition.witness, disposition });
  return response(disposition === "completion" ? "Accept" : "Reject", source, {
    type: "SenDailyReadingSettlement", contract: CONTRACT, disposition, proposal: proposal.token,
    completion: completion.term, evidence, witness: transition.witness, readingType: "ni:///sha-256;MGYe_PrTQlwEYjTev0F1q3qVwHLgJlRVXsu_OXJ0Rjg", customerTerritoryMutation: false,
    attachment: [completionDoc, evidenceDoc],
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.stdout.write(`${JSON.stringify(await invokeDailyReading(JSON.parse(readFileSync(0, "utf8"))))}\n`); }
  catch (error) { process.stderr.write(`${error.stack ?? error.message}\n`); process.exitCode = 1; }
}

const DEFAULT_CALLER_ACCOUNT = "eip155:31337:0x4c9a7b985d461cdd341dcdbd52d76473c66f4f5d";

/** Refuse a malformed daily-reading request before any work: the reading must be computable. */
export function validateDailyReadingRequest(request) {
  computeDailyReadingTerm(request?.date, request?.tradition);
  return request;
}

/**
 * One daily reading under Divination's contract, contracted locally by
 * `env.DIVINATION_CALLER_ACCOUNT`: the proposal is formed at FOUR-bottom,
 * settled through invokeDailyReading, and projected to its witness, evidence
 * and reading carrier.
 */
export async function readDailyReading(request, env = process.env) {
  const { date, tradition } = validateDailyReadingRequest(request);
  const callerAccount = env.DIVINATION_CALLER_ACCOUNT || DEFAULT_CALLER_ACCOUNT;
  const operation = ["pair", ["mark", date], ["mark", tradition]];
  const cell = {
    law: CONTRACT, caller: callerAccount, provider: ACCOUNT,
    precondition: PRECONDITION, operation: identifyTerm(operation, OPERATION_TYPE, "divination.daily-reading-operation").term, postcondition: POSTCONDITION, refusal: REFUSAL,
    evidenceRoot: identifyTerm(["mark", "proposal-at-four-bottom"], ["base"], "divination.daily-reading-proposal-evidence").term, outcome: { positiveEvidence: false, negativeEvidence: false },
    measures: [
      { dimension: "asset", quantity: "0", unit: "none" }, { dimension: "compute", quantity: "1", unit: "daily-reading" },
      { dimension: "erasure", quantity: "0", unit: "alternative" }, { dimension: "gas", quantity: "0", unit: "gas" },
      { dimension: "time", quantity: "0", unit: "millisecond" }, { dimension: "wit", quantity: "0", unit: "typed-four-cover" },
    ], parent: null,
  };
  const { token: id, bytes } = identifyJsonSemanticContent({ objectKind: "divination.daily-reading-proposal", value: { cell, operation }, witnessRoot: EMPTY_WITNESS_ROOT });
  const result = await invokeDailyReading({
    "@context": ACTIVITYSTREAMS_CONTEXT, id: `urn:uuid:${randomUUID()}`, type: "Accept", actor: "urn:ame:divination-reader", target: ACTOR,
    object: { type: "ServiceContract", contract: CONTRACT, callerAccount, proposal: { type: "Document", id, mediaType: "application/sen+cbor", content: Buffer.from(bytes).toString("base64") } },
  }, { env });
  if (result?.type !== "Accept" || result.object?.disposition !== "completion") throw new Error(`divination-refused:${result?.object?.disposition ?? result?.object?.type ?? "unknown"}`);
  const reading = (result.object.attachment ?? []).find((entry) => entry.profile === "org.emsenn.divination.daily-reading.v1");
  if (!reading) throw new Error("divination-reading-attachment-missing");
  return {
    id: result.object.witness, date, tradition, disposition: result.object.disposition,
    evidence: result.object.evidence, witness: result.object.witness,
    reading: { id: reading.id, mediaType: reading.mediaType, contentBase64: reading.content },
  };
}
