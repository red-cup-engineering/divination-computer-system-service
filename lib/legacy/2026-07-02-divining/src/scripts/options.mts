// Invocation options shared by the divination astrology commands.
//
// Vocabulary: an invocation's argv splits into positionals and flags. A
// flag is `--name`; a valued flag consumes the next token. A leading bare
// `--` is pnpm's forwarded separator and is dropped; a later one ends
// flag parsing. An instant is an ISO 8601 UTC timestamp. Malformed input
// throws TypeError — the only thing this module throws.

export type ParsedArguments = Readonly<{
  positionals: readonly string[];
  flags: ReadonlyMap<string, string | true>;
}>;

/** Split argv into positionals and flags; `valued` names the flags that take a value. */
export function parseArguments(
  argv: readonly string[],
  valued: readonly string[] = [],
): ParsedArguments {
  const positionals: string[] = [];
  const flags = new Map<string, string | true>();
  let flagsEnded = false;
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index] as string;
    if (token === "--") {
      // pnpm forwards its own separator as the leading token: drop it.
      // A later bare `--` is the command's own: flags end there.
      if (index > 0) flagsEnded = true;
      continue;
    }
    if (flagsEnded || !token.startsWith("--")) {
      positionals.push(token);
      continue;
    }
    const name = token.slice(2);
    if (valued.includes(name)) {
      const value = argv[index + 1];
      if (value === undefined || value.startsWith("--")) throw new TypeError(`--${name} takes a value`);
      flags.set(name, value);
      index += 1;
    } else {
      flags.set(name, true);
    }
  }
  return Object.freeze({ positionals: Object.freeze(positionals), flags });
}

/** The instant an invocation names: the given ISO 8601 timestamp, or now. */
export function instantArgument(value: string | undefined): string {
  if (value === undefined) return new Date().toISOString() // law-allow: wall-clock-as-data — "now" is the invocation's input default, not an ordering
    .replace(/\.\d{3}Z$/, "Z");
  if (Number.isNaN(Date.parse(value))) throw new TypeError(`not an ISO 8601 instant: ${value}`);
  return value;
}

/** The date an invocation names: the given YYYY-MM-DD, or today (UTC). */
export function dateArgument(value: string | undefined): string {
  if (value === undefined) return new Date().toISOString() // law-allow: wall-clock-as-data — "now" is the invocation's input default, not an ordering
    .slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new TypeError(`not an ISO 8601 date (YYYY-MM-DD): ${value}`);
  }
  return value;
}
