#!/usr/bin/env node

import { createServer as createHttpServer } from "node:http";
import { randomUUID } from "node:crypto";
import { pathToFileURL } from "node:url";
import { startNativeApplication as start } from "@red-cup-engineering/computer-web-server/native-application";
import { ACTOR, invokeDailyReading } from "./contract-daily-reading.mjs";
import { ACTIVITYSTREAMS_CONTEXT } from "@red-cup-engineering/activitypub-services-section/activitystreams";

const MAX_BODY_BYTES = 2 * 1024 * 1024;

async function body(request) {
  const chunks = []; let length = 0;
  for await (const chunk of request) {
    length += chunk.length;
    if (length > MAX_BODY_BYTES) throw new Error("request body exceeds 2 MiB");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

function refusal(source, message) {
  return {
    "@context": ACTIVITYSTREAMS_CONTEXT, id: `urn:uuid:${randomUUID()}`, type: "Reject", actor: ACTOR,
    target: source?.actor ?? null, inReplyTo: source?.id ?? null,
    object: { type: "Refusal", reason: "malformed-http-request", message, customerTerritoryMutation: false },
  };
}

// Business logic unchanged: one ActivityStreams request in, one ActivityStreams response out.
async function handleDailyReadingRequest(request, response, options) {
  let source;
  try {
    if (request.method !== "POST" || request.url !== "/contracts/daily-reading") throw new Error("use POST /contracts/daily-reading");
    if (!(request.headers["content-type"] ?? "").toLowerCase().startsWith("application/activity+json")) throw new Error("Content-Type must be application/activity+json");
    source = JSON.parse(await body(request));
    const result = await invokeDailyReading(source, options);
    response.writeHead(result.type === "Accept" ? 200 : 422, { "content-type": "application/activity+json; charset=utf-8" });
    response.end(`${JSON.stringify(result)}\n`);
  } catch (error) {
    response.writeHead(400, { "content-type": "application/activity+json; charset=utf-8" });
    response.end(`${JSON.stringify(refusal(source, error.message))}\n`);
  }
}

/** Back-compat: a bare Node http.Server, unchanged shape for any direct caller/test. */
export function createDivinationServer(options = {}) {
  return createHttpServer((request, response) => { void handleDailyReadingRequest(request, response, options); });
}

/** Native web application: one resource, same handler, hosted by the shared library. */
export function divinationApp(options = {}) {
  return {
    resources: [{
      match: () => true,
      handler: (ctx) => handleDailyReadingRequest(ctx.req, ctx.res, options),
    }],
  };
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const port = Number(process.env.PORT ?? "8787"), host = process.env.HOST ?? "127.0.0.1";
  const { address } = await start(divinationApp(), { port, host });
  process.stderr.write(`Divination SEN service listening on http://${host}:${typeof address === "object" && address ? address.port : port}\n`);
}
