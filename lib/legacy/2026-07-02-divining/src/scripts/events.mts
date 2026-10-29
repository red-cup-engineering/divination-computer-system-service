#!/usr/bin/env node
// divination-events: ingresses, stations, and lunation quarters over a window.
//
// Vocabulary: a SkyEvent tags one of the ephemeris' event records with its
// kind; the window is a pair of ISO 8601 instants. `--body sun,moon,...`
// restricts the per-body events (ingresses, stations) to those bodies;
// lunation quarters are a property of the Sun–Moon pair and are listed
// unless a filter excludes the Moon. Events print as one line each, sorted
// by time; --json prints the records.
//
//   divination-events <ISO-start> <ISO-end> [--body sun,moon,...] [--json]

import { fileURLToPath } from "node:url";
import {
  BODIES,
  findIngresses,
  findLunationQuarters,
  findStations,
  signPlacement,
  type Body,
  type IngressEvent,
  type LunationQuarterEvent,
  type StationEvent,
} from "../astrology/index.mjs";
import { parseArguments } from "./options.mjs";

export type SkyEvent = Readonly<
  | { kind: "ingress"; time: string; event: IngressEvent }
  | { kind: "station"; time: string; event: StationEvent }
  | { kind: "lunation-quarter"; time: string; event: LunationQuarterEvent }
>;

/** Decode a `--body` value: comma-separated body names. */
export function bodyListArgument(value: string): readonly Body[] {
  const names = value.split(",").map((name) => name.trim().toLowerCase());
  for (const name of names) {
    if (!BODIES.includes(name as Body)) throw new TypeError(`not a body: ${name}`);
  }
  return Object.freeze(names as Body[]);
}

/** Every ingress, station, and lunation quarter in the window, time-sorted. */
export function eventsInWindow(
  isoStart: string,
  isoEnd: string,
  bodies?: readonly Body[],
): readonly SkyEvent[] {
  for (const instant of [isoStart, isoEnd]) {
    if (typeof instant !== "string" || Number.isNaN(Date.parse(instant))) {
      throw new TypeError(`not an ISO 8601 instant: ${instant}`);
    }
  }
  const searched = bodies ?? BODIES;
  const events: SkyEvent[] = [];
  for (const body of searched) {
    for (const event of findIngresses(body, isoStart, isoEnd)) {
      events.push(Object.freeze({ kind: "ingress" as const, time: event.time, event }));
    }
    for (const event of findStations(body, isoStart, isoEnd)) {
      events.push(Object.freeze({ kind: "station" as const, time: event.time, event }));
    }
  }
  if (bodies === undefined || bodies.includes("moon")) {
    for (const event of findLunationQuarters(isoStart, isoEnd)) {
      events.push(Object.freeze({ kind: "lunation-quarter" as const, time: event.time, event }));
    }
  }
  return Object.freeze(events.sort((a, b) => a.time.localeCompare(b.time)));
}

/** One event as the human one-liner the command prints. */
export function describeEvent(skyEvent: SkyEvent): string {
  if (skyEvent.kind === "ingress") {
    const event = skyEvent.event;
    const retrograde = event.direction === "retrograde" ? ", by retrograde motion" : "";
    return `${event.time}  ${event.body} enters ${event.signTo.name} (from ${event.signFrom.name}${retrograde})`;
  }
  if (skyEvent.kind === "station") {
    const event = skyEvent.event;
    const placement = signPlacement(event.longitude);
    return `${event.time}  ${event.body} stations ${event.stationTo} at ${placement.degreeInSign.toFixed(1)}° ${placement.sign.name}`;
  }
  return `${skyEvent.time}  ${skyEvent.event.quarter}`;
}

/** One invocation: argv → the text the command prints. */
export function runEvents(argv: readonly string[]): string {
  const { positionals, flags } = parseArguments(argv, ["body"]);
  const [isoStart, isoEnd] = positionals;
  if (positionals.length !== 2 || isoStart === undefined || isoEnd === undefined) {
    throw new TypeError("events takes exactly two instants: <ISO-start> <ISO-end>");
  }
  const bodyFlag = flags.get("body");
  const bodies = typeof bodyFlag === "string" ? bodyListArgument(bodyFlag) : undefined;
  const events = eventsInWindow(isoStart, isoEnd, bodies);
  if (flags.has("json")) return JSON.stringify(events, null, 2);
  if (events.length === 0) return `no events in ${isoStart} … ${isoEnd}`;
  return events.map(describeEvent).join("\n");
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    process.stdout.write(`${runEvents(process.argv.slice(2))}\n`);
  } catch (error) {
    process.stderr.write(`divination-events: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}
