// Tarot spread codec: the YAML record the polity's encoding-a-tarot-spread
// skill writes, as a coder/decoder pair.
//
// Vocabulary: a spread document is a `---`-fenced YAML head over an
// (optional) interpretation body. The head carries exactly the skill's
// shape — spread, date, provenance (method, optional seed), and a block
// list of positions, each a map of position/card/orientation. The card
// NAME is the wire form; this codec carries the deck's naming standard (22
// major names; "<Rank> of <Suit>" for minors) as its own table — a codec
// carries its wire format and nothing else. The covered YAML subset is
// exactly this shape; anything outside it throws TypeError, the only thing
// this codec throws.
//
// Laws: decode(encode(doc)) = doc; encode is the canonical serialization.

const MAJOR_NAMES = [
  "The Fool",
  "The Magician",
  "The High Priestess",
  "The Empress",
  "The Emperor",
  "The Hierophant",
  "The Lovers",
  "The Chariot",
  "Strength",
  "The Hermit",
  "Wheel of Fortune",
  "Justice",
  "The Hanged Man",
  "Death",
  "Temperance",
  "The Devil",
  "The Tower",
  "The Star",
  "The Moon",
  "The Sun",
  "Judgement",
  "The World",
];

const MINOR_PATTERN =
  /^(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Page|Knight|Queen|King) of (Wands|Cups|Swords|Pentacles)$/;

function cardByName(name) {
  const majorNumber = MAJOR_NAMES.indexOf(name);
  if (majorNumber !== -1) {
    return Object.freeze({ arcana: "major", number: majorNumber, name });
  }
  const match = MINOR_PATTERN.exec(name);
  if (!match) throw new TypeError(`not a tarot card: ${name}`);
  return Object.freeze({
    arcana: "minor",
    rank: (match[1]).toLowerCase(),
    suit: (match[2]).toLowerCase(),
    name,
  });
}

export function encodeSpreadDocument(document) {
  const { spread, body } = document;
  if (typeof body !== "string") throw new TypeError("spread document body must be a string");
  const lines = [
    "---",
    `spread: ${quote(spread.spread)}`,
    `date: ${quote(spread.date)}`,
    "provenance:",
    `  method: ${quote(spread.provenance.method)}`,
  ];
  if (spread.provenance.seed !== undefined) lines.push(`  seed: ${quote(spread.provenance.seed)}`);
  lines.push("positions:");
  for (const position of spread.positions) {
    lines.push(`  - position: ${quote(position.position)}`);
    lines.push(`    card: ${quote(position.card.name)}`);
    lines.push(`    orientation: ${quote(position.orientation)}`);
  }
  lines.push("---");
  return `${lines.join("\n")}\n${body}`;
}

export function decodeSpreadDocument(text) {
  if (typeof text !== "string") throw new TypeError("spread document must be a string");
  const lines = text.split("\n").map((line) => line.replace(/\r$/, ""));
  if (lines[0] !== "---") throw new TypeError("spread document must open with a `---` fence");
  const fenceClose = lines.indexOf("---", 1);
  if (fenceClose === -1) throw new TypeError("spread document has no closing `---` fence");
  const head = lines.slice(1, fenceClose);
  const body = lines.slice(fenceClose + 1).join("\n");

  let spreadName;
  let date;
  let method;
  let seed;
  const positions = [];
  let section = "top";
  let pending = null;

  const flush = () => {
    if (!pending) return;
    if (!pending.position || !pending.card || !pending.orientation) {
      throw new TypeError("each position needs position, card, and orientation");
    }
    positions.push(
      Object.freeze({
        position: pending.position,
        card: cardByName(pending.card),
        orientation: orientationOf(pending.orientation),
      }),
    );
    pending = null;
  };

  for (const line of head) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    if (line === "provenance:") {
      flush();
      section = "provenance";
      continue;
    }
    if (line === "positions:") {
      flush();
      section = "positions";
      continue;
    }
    if (!line.startsWith(" ")) {
      flush();
      section = "top";
      const [key, value] = splitEntry(line);
      if (key === "spread") spreadName = value;
      else if (key === "date") date = value;
      else throw new TypeError(`unknown spread key: ${key}`);
      continue;
    }
    if (section === "provenance") {
      const [key, value] = splitEntry(line.trim());
      if (key === "method") method = value;
      else if (key === "seed") seed = value;
      else throw new TypeError(`unknown provenance key: ${key}`);
      continue;
    }
    if (section === "positions") {
      const item = line.trim();
      const entry = item.startsWith("- ") ? item.slice(2) : item;
      if (item.startsWith("- ")) {
        flush();
        pending = {};
      }
      if (!pending) throw new TypeError("position entry outside a `- ` item");
      const [key, value] = splitEntry(entry);
      if (key === "position" || key === "card" || key === "orientation") pending[key] = value;
      else throw new TypeError(`unknown position key: ${key}`);
      continue;
    }
    throw new TypeError(`unexpected indented line outside a section: ${line}`);
  }
  flush();

  if (!spreadName || !date || !method) {
    throw new TypeError("spread document needs spread, date, and provenance.method");
  }
  if (positions.length === 0) throw new TypeError("spread document needs at least one position");
  return Object.freeze({
    spread: Object.freeze({
      spread: spreadName,
      date,
      positions: Object.freeze(positions),
      provenance: Object.freeze(seed === undefined ? { method } : { method, seed }),
    }),
    body,
  });
}

function quote(value) {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function splitEntry(line) {
  const colon = line.indexOf(":");
  if (colon === -1) throw new TypeError(`not a key: value entry: ${line}`);
  const key = line.slice(0, colon).trim();
  let value = line.slice(colon + 1).trim();
  if (value.startsWith('"') && value.endsWith('"') && value.length >= 2) {
    value = value.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return [key, value];
}

function orientationOf(value) {
  if (value !== "upright" && value !== "reversed") {
    throw new TypeError(`orientation must be upright or reversed: ${value}`);
  }
  return value;
}
