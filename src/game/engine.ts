import { bestChoice, choosePlay, wantsKoikoi } from "./ai.ts";
import { DECK, shuffle, sortCards } from "./cards.ts";
import type { Actor, Card, GameState, RoundResult, Stats } from "./types.ts";
import { listYaku, yakuPoints } from "./yaku.ts";

export interface MatchSettings {
  target: number;
  oyaDouble: boolean;
  sound: boolean;
  stats?: Stats;
}

const EMPTY_STATS: Stats = { wins: 0, losses: 0, rounds: 0 };

function other(actor: Actor): Actor {
  return actor === "player" ? "cpu" : "player";
}

function who(actor: Actor): string {
  return actor === "player" ? "あなた" : "相手";
}

function emptyPiles(): Record<Actor, Card[]> {
  return { player: [], cpu: [] };
}

export function createMatch(settings: MatchSettings): GameState {
  return {
    phase: "title",
    actor: "player",
    oya: "player",
    nextOya: "player",
    hands: emptyPiles(),
    captured: emptyPiles(),
    field: [],
    deck: [],
    pending: null,
    pendingSource: null,
    betweenNext: null,
    optionIds: [],
    takenIds: [],
    locked: { player: 0, cpu: 0 },
    koikoi: { player: 0, cpu: 0 },
    scores: { player: 0, cpu: 0 },
    target: settings.target,
    round: 0,
    oyaDouble: settings.oyaDouble,
    sound: settings.sound,
    message: "同じ月の札を取って、役を作る。",
    result: null,
    stats: settings.stats ?? EMPTY_STATS,
    seq: 0,
  };
}

function fourOfAKind(cards: readonly Card[]): number | null {
  const counts = new Map<number, number>();
  for (const card of cards) counts.set(card.month, (counts.get(card.month) ?? 0) + 1);
  for (const [month, n] of counts) if (n >= 4) return month;
  return null;
}

interface Deal {
  player: Card[];
  cpu: Card[];
  field: Card[];
  deck: Card[];
  teshi: Actor | null;
}

function dealOnce(rng: () => number): Deal | null {
  const deck = shuffle(DECK, rng);
  const player = deck.slice(0, 8);
  const cpu = deck.slice(8, 16);
  const field = deck.slice(16, 24);
  const rest = deck.slice(24);
  if (fourOfAKind(field)) return null;
  const playerTeshi = fourOfAKind(player);
  const cpuTeshi = fourOfAKind(cpu);
  return {
    player: sortCards(player),
    cpu,
    field: sortCards(field),
    deck: rest,
    teshi: playerTeshi ? "player" : cpuTeshi ? "cpu" : null,
  };
}

function dealRound(rng: () => number): Deal {
  for (let i = 0; i < 48; i++) {
    const dealt = dealOnce(rng);
    if (dealt) return dealt;
  }
  const deck = shuffle(DECK, rng);
  const player = deck.slice(0, 8);
  const cpu = deck.slice(8, 16);
  return {
    player: sortCards(player),
    cpu,
    field: sortCards(deck.slice(16, 24)),
    deck: deck.slice(24),
    teshi: fourOfAKind(player) ? "player" : fourOfAKind(cpu) ? "cpu" : null,
  };
}

function captureLine(
  actor: Actor,
  played: Card,
  taken: readonly Card[],
  source: GameState["pendingSource"],
): string {
  const got = taken.filter((c) => c.id !== played.id);
  const subject = actor === "cpu" ? "相手が" : "";
  if (got.length === 0) {
    return source === "draw"
      ? `${subject}山の${played.short}を場に出しました`
      : `${subject}${played.short}を場に出しました`;
  }
  const names = got.map((c) => c.short).join("・");
  return source === "draw"
    ? `${subject}山の${played.short}で${names}を取りました`
    : `${subject}${names}を取りました`;
}

function resolveAgainstField(
  state: GameState,
  actor: Actor,
  card: Card,
  choiceId?: string,
): GameState {
  const matches = state.field.filter((f) => f.month === card.month);
  let picked = choiceId;
  if (matches.length === 2 && !picked) {
    if (actor === "player") {
      return {
        ...state,
        pending: card,
        pendingSource: state.pendingSource,
        phase: state.pendingSource === "draw" ? "drawChoose" : "playerChoose",
        optionIds: matches.map((m) => m.id),
        takenIds: [],
        message: "同じ月が2枚あります。取る札を選んでください",
      };
    }
    picked = bestChoice(state.captured[actor], state.field, card, matches).id;
  }

  let field = state.field;
  let taken: Card[] = [];
  if (matches.length === 0) {
    field = [...field, card];
  } else if (matches.length === 1 || matches.length >= 3) {
    const ids = new Set(matches.map((m) => m.id));
    field = field.filter((f) => !ids.has(f.id));
    taken = [...matches, card];
  } else {
    const chosen = matches.find((m) => m.id === picked) ?? matches[0]!;
    field = field.filter((f) => f.id !== chosen.id);
    taken = [chosen, card];
  }

  const fromHand = state.pendingSource === "hand";
  return {
    ...state,
    field,
    captured: {
      ...state.captured,
      [actor]: [...state.captured[actor], ...taken],
    },
    pending: null,
    optionIds: [],
    takenIds: taken.map((c) => c.id),
    message: captureLine(actor, card, taken, state.pendingSource),
    phase: "between",
    betweenNext: fromHand ? "draw" : "yaku",
    actor,
  };
}

function openRound(base: GameState, rng: () => number): GameState {
  const dealt = dealRound(rng);
  const oya = base.nextOya;
  const next: GameState = {
    ...base,
    oya,
    actor: oya,
    hands: { player: dealt.player, cpu: dealt.cpu },
    captured: emptyPiles(),
    field: dealt.field,
    deck: dealt.deck,
    pending: null,
    pendingSource: null,
    betweenNext: null,
    optionIds: [],
    takenIds: [],
    locked: { player: 0, cpu: 0 },
    koikoi: { player: 0, cpu: 0 },
    result: null,
    round: base.round + 1,
    message:
      oya === "player"
        ? "あなたの番です。金の枠は、場と同じ月です"
        : "相手が親です。相手の番から始まります",
    phase: oya === "player" ? "playerPlay" : "cpu",
  };
  const opened = dealt.teshi
    ? finishRound(next, dealt.teshi, { reason: "手四", base: 6, yaku: [] })
    : next;
  return { ...opened, seq: base.seq + 1 };
}

export function startMatch(state: GameState, rng: () => number = Math.random): GameState {
  return openRound(
    {
      ...state,
      scores: { player: 0, cpu: 0 },
      round: 0,
      nextOya: "player",
      oya: "player",
    },
    rng,
  );
}

export function resumeMatch(
  state: GameState,
  saved: { scores: Record<Actor, number>; round: number; oya: Actor },
  rng: () => number = Math.random,
): GameState {
  return openRound(
    {
      ...state,
      scores: { ...saved.scores },
      round: Math.max(0, saved.round - 1),
      nextOya: saved.oya,
    },
    rng,
  );
}

export function nextRound(state: GameState, rng: () => number = Math.random): GameState {
  if (state.phase !== "roundEnd") return state;
  return openRound(state, rng);
}

export function updateSettings(
  state: GameState,
  patch: Partial<Pick<GameState, "target" | "oyaDouble" | "sound">>,
): GameState {
  if (state.phase !== "title") return { ...state, ...patch, seq: state.seq + 1 };
  return { ...state, ...patch, seq: state.seq + 1 };
}

export function playerPlay(state: GameState, cardId: string): GameState {
  if (state.phase !== "playerPlay") return state;
  const card = state.hands.player.find((c) => c.id === cardId);
  if (!card) return state;
  const next = resolveAgainstField(
    {
      ...state,
      hands: { ...state.hands, player: state.hands.player.filter((c) => c.id !== cardId) },
      pendingSource: "hand",
    },
    "player",
    card,
  );
  return { ...next, seq: state.seq + 1 };
}

export function playerChoose(state: GameState, fieldId: string): GameState {
  if (state.phase !== "playerChoose" && state.phase !== "drawChoose") return state;
  if (!state.pending) return state;
  if (!state.optionIds.includes(fieldId)) return state;
  const next = resolveAgainstField(state, state.actor, state.pending, fieldId);
  return { ...next, seq: state.seq + 1 };
}

function doDraw(state: GameState): GameState {
  if (state.deck.length === 0) return checkYaku({ ...state, pendingSource: null, pending: null });
  const card = state.deck[state.deck.length - 1]!;
  const deck = state.deck.slice(0, -1);
  const matches = state.field.filter((f) => f.month === card.month);
  let choiceId: string | undefined;
  if (state.actor === "cpu" && matches.length === 2) {
    choiceId = bestChoice(state.captured.cpu, state.field, card, matches).id;
  }
  return resolveAgainstField(
    { ...state, deck, pending: card, pendingSource: "draw" },
    state.actor,
    card,
    choiceId,
  );
}

function canContinue(state: GameState): boolean {
  return state.hands.player.length + state.hands.cpu.length > 0;
}

function beginOpponent(state: GameState): GameState {
  const opp = other(state.actor);
  if (state.hands[opp].length === 0) return finishRound(state, null);
  return {
    ...state,
    actor: opp,
    phase: opp === "cpu" ? "cpu" : "playerPlay",
    betweenNext: null,
    pending: null,
    pendingSource: null,
    optionIds: [],
    takenIds: [],
    message: opp === "player" ? "手札を出してください" : "相手の番です",
  };
}

function applyKoikoi(state: GameState): GameState {
  const actor = state.actor;
  const pts = yakuPoints(state.captured[actor]);
  const continued = beginOpponent({
    ...state,
    koikoi: { ...state.koikoi, [actor]: state.koikoi[actor] + 1 },
    locked: { ...state.locked, [actor]: pts },
  });
  const lead = `${who(actor)}がこいこい！`;
  return {
    ...continued,
    message: `${lead} ${continued.actor === "player" ? "手札を出してください" : "相手の番です"}`,
  };
}

function finishRound(
  state: GameState,
  winner: Actor | null,
  special?: { reason: string; base: number; yaku: RoundResult["yaku"] },
): GameState {
  const calls = state.koikoi.player + state.koikoi.cpu;
  let base = 0;
  let yaku = special?.yaku ?? [];
  let reason = special?.reason ?? "流局";
  if (winner && !special) {
    yaku = listYaku(state.captured[winner]);
    base = yaku.reduce((sum, y) => sum + y.points, 0);
    reason = "あがり";
  } else if (winner && special) {
    base = special.base;
    reason = special.reason;
  }
  const oyaBonus = Boolean(winner && state.oyaDouble && winner === state.oya);
  let mult = 1;
  if (!special && calls > 0) mult *= 2 ** calls;
  if (oyaBonus) mult *= 2;
  const points = winner ? base * mult : 0;
  const scores = winner ? { ...state.scores, [winner]: state.scores[winner] + points } : state.scores;
  const nextOya = winner === null ? other(state.oya) : winner === state.oya ? state.oya : other(state.oya);
  const reached = winner !== null && scores[winner] >= state.target;
  const stats: Stats = {
    wins: state.stats.wins + (reached && winner === "player" ? 1 : 0),
    losses: state.stats.losses + (reached && winner === "cpu" ? 1 : 0),
    rounds: state.stats.rounds + 1,
  };

  const result: RoundResult = {
    winner,
    base,
    mult,
    points,
    yaku,
    calls: special ? 0 : calls,
    oyaBonus,
    reason,
  };
  return {
    ...state,
    scores,
    nextOya,
    stats,
    result,
    phase: reached ? "matchEnd" : "roundEnd",
    betweenNext: null,
    pending: null,
    optionIds: [],
    message: reached
      ? winner === "player"
        ? "勝負あり。あなたの勝ちです"
        : "勝負あり。相手の勝ちです"
      : winner
        ? `${who(winner)}の${reason}です`
        : "流局。親が交代します",
  };
}

function checkYaku(state: GameState): GameState {
  const actor = state.actor;
  const pts = yakuPoints(state.captured[actor]);
  if (pts > state.locked[actor]) {
    if (!canContinue(state)) return finishRound(state, actor);
    if (actor === "cpu") {
      return wantsKoikoi(state, "cpu") ? applyKoikoi(state) : finishRound(state, "cpu");
    }
    const yaku = listYaku(state.captured.player);
    return {
      ...state,
      phase: "decide",
      betweenNext: null,
      pending: null,
      optionIds: [],
      message: `${yaku.map((y) => y.name).join("・")}。あがりか、こいこいか`,
    };
  }
  return beginOpponent(state);
}

export function continueBetween(state: GameState): GameState {
  if (state.phase !== "between" || !state.betweenNext) return state;
  const next =
    state.betweenNext === "draw"
      ? doDraw(state)
      : state.betweenNext === "yaku"
        ? checkYaku(state)
        : beginOpponent(state);
  return { ...next, seq: state.seq + 1 };
}

export function stepCpu(state: GameState, rng: () => number = Math.random): GameState {
  if (state.phase !== "cpu") return state;
  if (state.hands.cpu.length === 0) {
    return { ...finishRound(state, null), seq: state.seq + 1 };
  }
  const choice = choosePlay(state, "cpu", rng);
  const card = state.hands.cpu.find((c) => c.id === choice.cardId);
  if (!card) return state;
  const next = resolveAgainstField(
    {
      ...state,
      hands: { ...state.hands, cpu: state.hands.cpu.filter((c) => c.id !== card.id) },
      pendingSource: "hand",
    },
    "cpu",
    card,
    choice.choiceId,
  );
  return { ...next, seq: state.seq + 1 };
}

export function playerDecide(state: GameState, call: "agari" | "koikoi"): GameState {
  if (state.phase !== "decide" || state.actor !== "player") return state;
  const next = call === "agari" || !canContinue(state) ? finishRound(state, "player") : applyKoikoi(state);
  return { ...next, seq: state.seq + 1 };
}

export function collectIds(state: GameState): string[] {
  const cards = [
    ...state.hands.player,
    ...state.hands.cpu,
    ...state.field,
    ...state.deck,
    ...state.captured.player,
    ...state.captured.cpu,
  ];
  if (state.pending) cards.push(state.pending);
  return cards.map((c) => c.id);
}

export function autoStep(state: GameState, rng: () => number = Math.random): GameState {
  if (state.phase === "title") return startMatch(state, rng);
  if (state.phase === "between") return continueBetween(state);
  if (state.phase === "cpu") return stepCpu(state, rng);
  if (state.phase === "playerPlay") {
    const choice = choosePlay(state, "player", rng);
    return playerPlay(state, choice.cardId);
  }
  if (state.phase === "playerChoose" || state.phase === "drawChoose") {
    const pending = state.pending;
    const options = state.field.filter((c) => state.optionIds.includes(c.id));
    if (!pending || options.length === 0) return state;
    const pick = bestChoice(state.captured[state.actor], state.field, pending, options);
    return playerChoose(state, pick.id);
  }
  if (state.phase === "decide") {
    return playerDecide(state, wantsKoikoi(state, "player", rng) ? "koikoi" : "agari");
  }
  if (state.phase === "roundEnd") return nextRound(state, rng);
  return state;
}
