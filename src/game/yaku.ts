import type { Card, Yaku } from "./types.ts";

function hasTag(cards: readonly Card[], tag: Card["tags"][number]): boolean {
  return cards.some((c) => c.tags.includes(tag));
}

/** Highest bright-card yaku only. Rain does not count toward 三光. */
function brightYaku(cards: readonly Card[]): Yaku | null {
  const hikari = cards.filter((c) => c.kind === "hikari");
  const rain = hikari.some((c) => c.tags.includes("rain"));
  const plain = hikari.length - (rain ? 1 : 0);
  if (hikari.length === 5) return { id: "goko", name: "五光", points: 10, detail: "光札が5枚" };
  if (hikari.length === 4 && !rain) return { id: "shiko", name: "四光", points: 8, detail: "雨以外の光札が4枚" };
  if (hikari.length === 4 && rain) return { id: "ameshiko", name: "雨四光", points: 7, detail: "雨を含む光札が4枚" };
  if (plain >= 3) return { id: "sanko", name: "三光", points: 5, detail: "雨以外の光札が3枚" };
  return null;
}

export function listYaku(cards: readonly Card[]): Yaku[] {
  const out: Yaku[] = [];
  const bright = brightYaku(cards);
  if (bright) out.push(bright);

  const tane = cards.filter((c) => c.kind === "tane");
  if (hasTag(cards, "boar") && hasTag(cards, "deer") && hasTag(cards, "butterflies")) {
    out.push({ id: "inoshikacho", name: "猪鹿蝶", points: 5, detail: "猪・鹿・蝶" });
  }
  if (tane.length >= 5) {
    out.push({
      id: "tane",
      name: "たね",
      points: tane.length - 4,
      detail: `種が${tane.length}枚`,
    });
  }

  const ribbons = cards.filter((c) => c.kind === "tanzaku");
  const poetry = cards.filter((c) => c.tags.includes("poetry")).length;
  const blue = cards.filter((c) => c.tags.includes("blue")).length;
  if (poetry >= 3) out.push({ id: "akatan", name: "赤短", points: 5, detail: "松・梅・桜の赤短" });
  if (blue >= 3) out.push({ id: "aotan", name: "青短", points: 5, detail: "牡丹・菊・紅葉の青短" });
  if (ribbons.length >= 5) {
    out.push({
      id: "tanzaku",
      name: "短冊",
      points: ribbons.length - 4,
      detail: `短冊が${ribbons.length}枚`,
    });
  }

  const kasuCards = cards.filter((c) => c.kind === "kasu").length;
  const kasu = kasuCards + (hasTag(cards, "sake") ? 1 : 0);
  if (kasu >= 10) {
    out.push({
      id: "kasu",
      name: "カス",
      points: kasu - 9,
      detail: `カス${kasu}枚（盃はカスに数える）`,
    });
  }

  if (hasTag(cards, "sake") && hasTag(cards, "curtain")) {
    out.push({ id: "hanami", name: "花見酒", points: 5, detail: "桜の幕と菊の盃" });
  }
  if (hasTag(cards, "sake") && hasTag(cards, "moon")) {
    out.push({ id: "tsukimi", name: "月見酒", points: 5, detail: "芒の月と菊の盃" });
  }
  return out;
}

export function yakuPoints(cards: readonly Card[]): number {
  return listYaku(cards).reduce((sum, y) => sum + y.points, 0);
}

export interface YakuRow {
  id: string;
  name: string;
  points: string;
  detail: string;
  have: number;
  need: number;
  met: boolean;
}

export function yakuBoard(cards: readonly Card[]): YakuRow[] {
  const hikari = cards.filter((c) => c.kind === "hikari");
  const rain = hikari.some((c) => c.tags.includes("rain"));
  const plain = hikari.length - (rain ? 1 : 0);
  const tane = cards.filter((c) => c.kind === "tane");
  const ribbons = cards.filter((c) => c.kind === "tanzaku");
  const poetry = cards.filter((c) => c.tags.includes("poetry")).length;
  const blue = cards.filter((c) => c.tags.includes("blue")).length;
  const animals = ["boar", "deer", "butterflies"].filter((tag) =>
    cards.some((c) => c.tags.includes(tag as Card["tags"][number])),
  ).length;
  const kasu = cards.filter((c) => c.kind === "kasu").length + (hasTag(cards, "sake") ? 1 : 0);
  const hanami = (hasTag(cards, "curtain") ? 1 : 0) + (hasTag(cards, "sake") ? 1 : 0);
  const tsukimi = (hasTag(cards, "moon") ? 1 : 0) + (hasTag(cards, "sake") ? 1 : 0);
  const achieved = new Set(listYaku(cards).map((y) => y.id));

  const brightHave = hikari.length === 5 ? 5 : plain >= 3 && !rain ? plain : hikari.length;
  const brightNeed = achieved.has("goko") ? 5 : achieved.has("shiko") || achieved.has("ameshiko") ? 4 : 3;

  return [
    {
      id: "bright",
      name: "光",
      points: "5〜10",
      detail: rain ? `光${hikari.length}（雨あり）` : `光${plain}（雨なし）`,
      have: Math.min(brightHave, brightNeed),
      need: brightNeed,
      met: achieved.has("goko") || achieved.has("shiko") || achieved.has("ameshiko") || achieved.has("sanko"),
    },
    {
      id: "inoshikacho",
      name: "猪鹿蝶",
      points: "5",
      detail: "猪・鹿・蝶",
      have: animals,
      need: 3,
      met: achieved.has("inoshikacho"),
    },
    {
      id: "tane",
      name: "たね",
      points: "1〜",
      detail: "種5枚から",
      have: Math.min(tane.length, 5),
      need: 5,
      met: achieved.has("tane"),
    },
    {
      id: "akatan",
      name: "赤短",
      points: "5",
      detail: "松・梅・桜",
      have: Math.min(poetry, 3),
      need: 3,
      met: achieved.has("akatan"),
    },
    {
      id: "aotan",
      name: "青短",
      points: "5",
      detail: "牡丹・菊・紅葉",
      have: Math.min(blue, 3),
      need: 3,
      met: achieved.has("aotan"),
    },
    {
      id: "tanzaku",
      name: "短冊",
      points: "1〜",
      detail: "短冊5枚から",
      have: Math.min(ribbons.length, 5),
      need: 5,
      met: achieved.has("tanzaku"),
    },
    {
      id: "kasu",
      name: "カス",
      points: "1〜",
      detail: "10枚から。盃も数える",
      have: Math.min(kasu, 10),
      need: 10,
      met: achieved.has("kasu"),
    },
    {
      id: "hanami",
      name: "花見酒",
      points: "5",
      detail: "幕と盃",
      have: hanami,
      need: 2,
      met: achieved.has("hanami"),
    },
    {
      id: "tsukimi",
      name: "月見酒",
      points: "5",
      detail: "月と盃",
      have: tsukimi,
      need: 2,
      met: achieved.has("tsukimi"),
    },
  ];
}
