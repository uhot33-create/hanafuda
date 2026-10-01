import { DECK, byId } from "./cards.ts";
import { autoStep, collectIds, createMatch, playerPlay, startMatch } from "./engine.ts";
import type { Card } from "./types.ts";
import { listYaku, yakuPoints } from "./yaku.ts";

function assert(cond: boolean, message: string): void {
  if (!cond) throw new Error(message);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function names(cards: Card[]): string[] {
  return listYaku(cards).map((y) => `${y.name}:${y.points}`);
}

function take(...ids: string[]): Card[] {
  return ids.map((id) => byId(id));
}

function testDeck(): void {
  assert(DECK.length === 48, `deck ${DECK.length}`);
  assert(new Set(DECK.map((c) => c.id)).size === 48, "ids");
  for (let month = 1; month <= 12; month++) {
    assert(DECK.filter((c) => c.month === month).length === 4, `month ${month}`);
  }
  assert(DECK.filter((c) => c.kind === "hikari").length === 5, "hikari");
  assert(DECK.filter((c) => c.kind === "tane").length === 9, "tane");
  assert(DECK.filter((c) => c.kind === "tanzaku").length === 10, "tanzaku");
  assert(DECK.filter((c) => c.kind === "kasu").length === 24, "kasu");
}

function testYaku(): void {
  const bright = ["m1-crane", "m3-curtain", "m8-moon", "m12-phoenix", "m11-rain"];
  assert(names(take(...bright)).join(",") === "五光:10", `goko ${names(take(...bright))}`);
  assert(names(take("m1-crane", "m3-curtain", "m8-moon", "m12-phoenix")).join(",") === "四光:8", "shiko");
  assert(names(take("m1-crane", "m3-curtain", "m8-moon", "m11-rain")).join(",") === "雨四光:7", "ame");
  assert(names(take("m1-crane", "m3-curtain", "m8-moon")).join(",") === "三光:5", "sanko");
  assert(names(take("m1-crane", "m8-moon", "m11-rain")).length === 0, "rain blocks sanko");

  assert(names(take("m7-boar", "m10-deer", "m6-butterflies")).join(",") === "猪鹿蝶:5", "ino");

  const kasu = DECK.filter((c) => c.kind === "kasu").slice(0, 10);
  assert(yakuPoints(kasu) === 1, `kasu 10 -> ${yakuPoints(kasu)}`);
  const nine = DECK.filter((c) => c.kind === "kasu").slice(0, 9);
  assert(yakuPoints([...nine, byId("m9-sake")]) === 1, "sake counts as kasu");
  assert(yakuPoints([...kasu, byId("m9-sake")]) === 2, "11 kasu with sake");

  assert(names(take("m3-curtain", "m9-sake")).includes("花見酒:5"), "hanami");
  assert(names(take("m8-moon", "m9-sake")).includes("月見酒:5"), "tsukimi");
  assert(names(take("m1-poetry", "m2-poetry", "m3-poetry")).join(",") === "赤短:5", "akatan");
  assert(names(take("m6-blue", "m9-blue", "m10-blue")).join(",") === "青短:5", "aotan");

  const fiveTane = take("m2-warbler", "m4-cuckoo", "m5-bridge", "m8-geese", "m11-swallow");
  assert(names(fiveTane).join(",") === "たね:1", "tane");
  const ribbons = take("m1-poetry", "m2-poetry", "m3-poetry", "m6-blue", "m9-blue", "m4-ribbon");
  const ribbonNames = names(ribbons);
  assert(ribbonNames.includes("赤短:5"), "stack aka");
  assert(ribbonNames.includes("短冊:2"), `stack tan ${ribbonNames}`);
}

function testConservation(): void {
  const rng = mulberry32(7);
  let state = startMatch(createMatch({ target: 20, oyaDouble: true, sound: false }), rng);
  let guard = 0;
  while (state.phase !== "matchEnd" && guard++ < 8000) {
    const ids = collectIds(state);
    assert(ids.length === 48, `count ${ids.length} at ${state.phase} r${state.round}`);
    assert(new Set(ids).size === 48, `dup at ${state.phase} r${state.round}`);
    const prev = state.seq;
    state = autoStep(state, rng);
    assert(state.seq !== prev, `seq stuck at ${state.phase} r${state.round} step ${guard}`);
  }
  assert(
    state.phase === "matchEnd",
    `did not finish: ${state.phase} r${state.round} ${state.scores.player}-${state.scores.cpu}`,
  );
  const winner = state.result?.winner;
  if (winner !== "player" && winner !== "cpu") throw new Error("winner");
  assert(state.scores[winner] >= state.target, `score ${state.scores[winner]}`);
}

function testScriptedCapture(): void {
  const rng = mulberry32(3);
  let state = startMatch(createMatch({ target: 30, oyaDouble: false, sound: false }), rng);
  if (state.phase !== "playerPlay") return;
  const match = state.hands.player.find((card) => state.field.some((f) => f.month === card.month));
  const card = match ?? state.hands.player[0];
  assert(Boolean(card), "hand");
  state = playerPlay(state, card!.id);
  const after = collectIds(state);
  assert(after.length === 48 && new Set(after).size === 48, "play conserved");
}

testDeck();
testYaku();
testScriptedCapture();
testConservation();
console.log("hanafuda selftest ok");
