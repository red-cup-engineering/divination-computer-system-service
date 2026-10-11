import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test, { after, before } from "node:test";
import { dataArtifactFiles } from "@red-cup-engineering/eavt-services-section/data-artifact-listing";
import { serveWitTransitionAssay } from "@red-cup-engineering/computer-inference-engine/fabric/effect-assay";
import { startWitnessJournalProviderProcess } from "@red-cup-engineering/witness-journal-document-service/test-provider";
import { ACCOUNT, ACTOR, CONTRACT, invokeDailyReading, OPERATION_TYPE } from "../src/contract-daily-reading.mjs";
import { dailyReadingType } from "../src/daily-reading.mjs";
import { termToJson } from "@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/json-codec";
import { checkTerm } from "@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/typing";
import { inferTy } from "@red-cup-engineering/computer-data-engineering-services-section/semiotic-expression-notation/typing";
import {
  admitNormalizedSemanticContent,
  identifyNormalizedSemanticContent,
} from "@red-cup-engineering/computer-code-engineering-services-section/semiotic-expression-notation/runtime";
import {
  EMPTY_WITNESS_ROOT,
  identifyJsonSemanticContent,
} from "@red-cup-engineering/computer-content-engineering-services-section/semantic-content-identity";
import { ACTIVITYSTREAMS_CONTEXT } from "@red-cup-engineering/activitypub-services-section/activitystreams";

const CALLER = "eip155:31337:0x0000000000000000000000000000000000000001";
const PRECONDITION = "ni:///sha-256;ntxOpkBcnbGVC6NeD1y4X54yLK7GmBmNf2ul7IhJV2I";
const POSTCONDITION = "ni:///sha-256;am0o7fpff-A8Q_SdJFQDw0zJYBdAr8Q8EQEw4V0dWj4";
const REFUSAL = "ni:///sha-256;IebXWZ-MmX6I7pLllQ4vNRHP9SdWr32AE_pC-w15YMk";
const AT = "2026-07-19T12:00:00.000Z";
let witnessJournalServer, witServer, witnessJournalAgentUrl, witAgentUrl;

function termIdentity(term, objectKind, declaredType) {
  const semanticType = declaredType ?? inferTy([], term);
  assert.notEqual(semanticType, null);
  return identifyNormalizedSemanticContent({ objectKind, semanticType, term, witnessRoot: EMPTY_WITNESS_ROOT });
}

before(async () => {
  witnessJournalServer = await startWitnessJournalProviderProcess();
  witnessJournalAgentUrl = witnessJournalServer.agentCardUrl;
  witServer = await serveWitTransitionAssay({ providerAccount: "eip155:31337:0x0aadad1c6a71d34f89dad0cb41a75603433a6071" });
  witAgentUrl = witServer.baseUrl;
});
after(async () => {
  const closing = [
    ...(witServer ? [witServer.close()] : []),
    ...(witnessJournalServer ? [witnessJournalServer.close()] : []),
  ];
  const results = await Promise.allSettled(closing);
  const failures = results.filter(({ status }) => status === "rejected").map(({ reason }) => reason);
  if (failures.length > 0) throw new AggregateError(failures, "contract daily-reading fixture cleanup failed");
});

function proposal(date = "2026-07-18", tradition = "rcl", mutate = (cell) => cell) {
  const operation = ["pair", ["mark", date], ["mark", tradition]];
  const cell = mutate({
    law: CONTRACT, caller: CALLER, provider: ACCOUNT,
    precondition: PRECONDITION, operation: termIdentity(operation, "divination.daily-reading-operation", OPERATION_TYPE).token, postcondition: POSTCONDITION, refusal: REFUSAL,
    evidenceRoot: termIdentity(["mark", "proposal-at-four-bottom"], "divination.daily-reading-proposal-evidence").token, outcome: { positiveEvidence: false, negativeEvidence: false },
    measures: [
      { dimension: "asset", quantity: "0", unit: "none" }, { dimension: "compute", quantity: "1", unit: "daily-reading" },
      { dimension: "erasure", quantity: "0", unit: "alternative" }, { dimension: "gas", quantity: "0", unit: "gas" },
      { dimension: "time", quantity: "0", unit: "millisecond" }, { dimension: "wit", quantity: "0", unit: "typed-four-cover" },
    ], parent: null,
  });
  const proposalIdentity = identifyJsonSemanticContent({ objectKind: "divination.daily-reading-proposal", value: { cell, operation }, witnessRoot: EMPTY_WITNESS_ROOT });
  return {
    "@context": ACTIVITYSTREAMS_CONTEXT, id: "urn:test:divination-contract", type: "Accept", actor: "urn:ame:test-caller", target: ACTOR,
    object: {
      type: "ServiceContract", contract: CONTRACT, callerAccount: CALLER,
      proposal: { type: "Document", id: proposalIdentity.token, mediaType: "application/sen+cbor", content: Buffer.from(proposalIdentity.bytes).toString("base64") },
    },
  };
}

function fixture() {
  const divination = mkdtempSync(join(tmpdir(), "divination-sen-test-"));
  return { divination, env: { DIVINATION_DATA_ROOT: divination, WITNESS_JOURNAL_RDF_AGENT: witnessJournalAgentUrl, WIT_TRANSITION_ASSAY_AGENT: witAgentUrl } };
}

test("Divination settles a variable-length reading as one fully typed SEN term", async (t) => {
  const roots = fixture(); t.after(() => { rmSync(roots.divination, { recursive: true, force: true }); });
  const result = await invokeDailyReading(proposal(), { env: roots.env, now: AT });
  assert.equal(result.type, "Accept", JSON.stringify(result));
  assert.equal(result.object.type, "SenDailyReadingSettlement");
  assert.equal(result.object.disposition, "completion");
  assert.match(result.object.witness, /^ni:\/\/\/sha-256;/u);
  const reading = result.object.attachment.find(({ profile }) => profile === "org.emsenn.divination.daily-reading.v1");
  assert.ok(reading);
  const identified = admitNormalizedSemanticContent(Buffer.from(reading.content, "base64"), reading.id);
  const term = identified.envelope.settledBody;
  assert.equal(checkTerm(term, dailyReadingType(term)), true);
  assert.equal(termIdentity(term, "divination.daily-reading", dailyReadingType(term)).token, reading.id);
  assert.equal(term[0], "pair");
  const objectFiles = readdirSync(join(roots.divination, "objects/sha-256"));
  assert.equal(objectFiles.length, 2);
  const witnessJournalFiles = dataArtifactFiles(roots.divination, "log", { date: "2026-07-19", match: (filename) => filename.endsWith(".jsonl") });
  assert.equal(witnessJournalFiles.length, 1);
  const witnessJournal = readFileSync(witnessJournalFiles[0].path, "utf8");
  const witnessRows = witnessJournal.trim().split("\n").map((line) => JSON.parse(line));
  assert.equal(witnessRows.length, 5);
  assert.ok(witnessRows.every((row) => Object.keys(row).sort().join(",") === "a,e,t,v"));
  assert.match(
    termToJson(witnessRows.find(({ a }) => termToJson(a) === "daily-reading:transition-witness")?.v ?? ["star"]) ?? "",
    /^semantic-content\.transition-witness\.sha256\.[0-9a-f]{64}$/u,
  );
});

test("a valid SEN proposal with an invalid date settles by one negative-evidence WIT", async (t) => {
  const roots = fixture(); t.after(() => { rmSync(roots.divination, { recursive: true, force: true }); });
  const result = await invokeDailyReading(proposal("2026-02-30"), { env: roots.env, now: AT });
  assert.equal(result.type, "Reject");
  assert.equal(result.object.disposition, "refused");
  const refusal = result.object.attachment.find(({ profile }) => profile === "org.emsenn.divination.refusal.v1");
  assert.ok(refusal);
  const term = admitNormalizedSemanticContent(Buffer.from(refusal.content, "base64"), refusal.id).envelope.settledBody;
  assert.deepEqual(term[1], ["mark", "reading-computation-refused"]);
});

test("Divination rejects an effect whose operation commitment does not match its bundled operation", async (t) => {
  const roots = fixture(); t.after(() => { rmSync(roots.divination, { recursive: true, force: true }); });
  const source = proposal("2026-07-18", "rcl", (cell) => ({ ...cell, operation: termIdentity(["mark", "other-operation"], "divination.daily-reading-operation").token }));
  await assert.rejects(invokeDailyReading(source, { env: roots.env, now: AT }), /effect-operation-mismatch|does not identify/u);
  assert.deepEqual(OPERATION_TYPE, ["prod", ["base"], ["base"]]);
});

test("a malformed daily-reading request is refused by the same local check the reading runs", async () => {
  const { validateDailyReadingRequest } = await import("../src/contract-daily-reading.mjs");
  assert.throws(() => validateDailyReadingRequest({ date: "not-a-date", tradition: "rcl" }));
  assert.doesNotThrow(() => validateDailyReadingRequest({ date: "2026-01-01", tradition: "rcl" }));
});

test("readDailyReading contracts one reading locally and projects its witness and reading", async (t) => {
  const { readDailyReading } = await import("../src/contract-daily-reading.mjs");
  const roots = fixture(); t.after(() => { rmSync(roots.divination, { recursive: true, force: true }); });
  const result = await readDailyReading({ date: "2026-07-18", tradition: "rcl" }, roots.env);
  assert.equal(result.disposition, "completion");
  assert.equal(result.id, result.witness);
  assert.match(result.reading.id, /^ni:\/\/\/sha-256;/u);
});
