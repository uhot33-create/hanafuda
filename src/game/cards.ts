import type { Card, Kind, Month, Tag } from "./types.ts";

export const MONTH_NAME: Record<Month, string> = {
  1: "松",
  2: "梅",
  3: "桜",
  4: "藤",
  5: "菖蒲",
  6: "牡丹",
  7: "萩",
  8: "芒",
  9: "菊",
  10: "紅葉",
  11: "柳",
  12: "桐",
};

/** One-character seal printed on every card. */
export const MONTH_SEAL: Record<Month, string> = {
  1: "松",
  2: "梅",
  3: "桜",
  4: "藤",
  5: "菖",
  6: "丹",
  7: "萩",
  8: "芒",
  9: "菊",
  10: "楓",
  11: "柳",
  12: "桐",
};

export const KIND_LABEL: Record<Kind, string> = {
  hikari: "光",
  tane: "種",
  tanzaku: "短",
  kasu: "カス",
};

const KIND_ORDER: Record<Kind, number> = {
  hikari: 0,
  tane: 1,
  tanzaku: 2,
  kasu: 3,
};

function card(
  id: string,
  month: Month,
  kind: Kind,
  name: string,
  short: string,
  tags: Tag[] = [],
): Card {
  return { id, month, kind, name, short, tags };
}

function kasu(month: Month, n: number): Card {
  return card(
    `m${month}-kasu-${n}`,
    month,
    "kasu",
    `${MONTH_NAME[month]}のカス`,
    "カス",
  );
}

function buildDeck(): Card[] {
  return [
    card("m1-crane", 1, "hikari", "松に鶴", "鶴", ["crane"]),
    card("m1-poetry", 1, "tanzaku", "松に赤短", "赤短", ["poetry"]),
    kasu(1, 1),
    kasu(1, 2),

    card("m2-warbler", 2, "tane", "梅に鶯", "鶯"),
    card("m2-poetry", 2, "tanzaku", "梅に赤短", "赤短", ["poetry"]),
    kasu(2, 1),
    kasu(2, 2),

    card("m3-curtain", 3, "hikari", "桜に幕", "幕", ["curtain"]),
    card("m3-poetry", 3, "tanzaku", "桜に赤短", "赤短", ["poetry"]),
    kasu(3, 1),
    kasu(3, 2),

    card("m4-cuckoo", 4, "tane", "藤に不如帰", "不如帰"),
    card("m4-ribbon", 4, "tanzaku", "藤に短冊", "短冊"),
    kasu(4, 1),
    kasu(4, 2),

    card("m5-bridge", 5, "tane", "菖蒲に八橋", "八橋"),
    card("m5-ribbon", 5, "tanzaku", "菖蒲に短冊", "短冊"),
    kasu(5, 1),
    kasu(5, 2),

    card("m6-butterflies", 6, "tane", "牡丹に蝶", "蝶", ["butterflies"]),
    card("m6-blue", 6, "tanzaku", "牡丹に青短", "青短", ["blue"]),
    kasu(6, 1),
    kasu(6, 2),

    card("m7-boar", 7, "tane", "萩に猪", "猪", ["boar"]),
    card("m7-ribbon", 7, "tanzaku", "萩に短冊", "短冊"),
    kasu(7, 1),
    kasu(7, 2),

    card("m8-moon", 8, "hikari", "芒に月", "月", ["moon"]),
    card("m8-geese", 8, "tane", "芒に雁", "雁"),
    kasu(8, 1),
    kasu(8, 2),

    card("m9-sake", 9, "tane", "菊に盃", "盃", ["sake"]),
    card("m9-blue", 9, "tanzaku", "菊に青短", "青短", ["blue"]),
    kasu(9, 1),
    kasu(9, 2),

    card("m10-deer", 10, "tane", "紅葉に鹿", "鹿", ["deer"]),
    card("m10-blue", 10, "tanzaku", "紅葉に青短", "青短", ["blue"]),
    kasu(10, 1),
    kasu(10, 2),

    card("m11-rain", 11, "hikari", "柳に小野道風", "雨", ["rain"]),
    card("m11-swallow", 11, "tane", "柳に燕", "燕"),
    card("m11-ribbon", 11, "tanzaku", "柳に短冊", "短冊"),
    kasu(11, 1),

    card("m12-phoenix", 12, "hikari", "桐に鳳凰", "鳳凰", ["phoenix"]),
    kasu(12, 1),
    kasu(12, 2),
    kasu(12, 3),
  ];
}

export const DECK: readonly Card[] = buildDeck();

const BY_ID = new Map(DECK.map((c) => [c.id, c]));

export function byId(id: string): Card {
  const card = BY_ID.get(id);
  if (!card) throw new Error(`unknown card ${id}`);
  return card;
}

export function sortCards(cards: readonly Card[]): Card[] {
  return [...cards].sort(
    (a, b) => a.month - b.month || KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.id.localeCompare(b.id),
  );
}

export function shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}
