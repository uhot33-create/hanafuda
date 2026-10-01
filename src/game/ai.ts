import type { Actor, Card, GameState } from "./types.ts";
import { yakuPoints } from "./yaku.ts";

const KIND_W: Record<Card["kind"], number> = {
  hikari: 9,
  tane: 4,
  tanzaku: 2.4,
  kasu: 1,
};

function valueOf(card: Card): number {
  let v = KIND_W[card.kind];
  if (
    card.tags.includes("sake") ||
    card.tags.includes("boar") ||
    card.tags.includes("deer") ||
    card.tags.includes("butterflies")
  ) {
    v += 2.2;
  }
  if (card.tags.includes("poetry") || card.tags.includes("blue")) v += 1.4;
  if (card.tags.includes("rain")) v -= 1.5;
  return v;
}

function other(actor: Actor): Actor {
  return actor === "player" ? "cpu" : "player";
}

export function scoreDrop(
  captured: readonly Card[],
  field: readonly Card[],
  hand: readonly Card[],
  card: Card,
  choiceId?: string,
): number {
  const matches = field.filter((f) => f.month === card.month);
  if (matches.length === 0) {
    let score = -valueOf(card) * 0.55;
    const sibling = hand.some((h) => h.id !== card.id && h.month === card.month);
    if (sibling) score -= 1.4;
    return score;
  }

  let taken: Card[];
  if (matches.length === 2) {
    const chosen = matches.find((m) => m.id === choiceId) ?? matches[0]!;
    taken = [chosen, card];
  } else {
    taken = [...matches, card];
  }
  const next = [...captured, ...taken];
  const delta = yakuPoints(next) - yakuPoints(captured);
  return delta * 9 + taken.reduce((sum, c) => sum + valueOf(c), 0);
}

export function bestChoice(captured: readonly Card[], field: readonly Card[], card: Card, options: readonly Card[]): Card {
  let best = options[0]!;
  let bestScore = -Infinity;
  for (const opt of options) {
    const score = scoreDrop(captured, field, [], card, opt.id);
    if (score > bestScore) {
      bestScore = score;
      best = opt;
    }
  }
  return best;
}

export interface PlayChoice {
  cardId: string;
  choiceId?: string;
}

export function choosePlay(state: GameState, actor: Actor, rng: () => number = Math.random): PlayChoice {
  const hand = state.hands[actor];
  const field = state.field;
  const captured = state.captured[actor];
  let best: PlayChoice = { cardId: hand[0]!.id };
  let bestScore = -Infinity;
  for (const card of hand) {
    const matches = field.filter((f) => f.month === card.month);
    if (matches.length === 2) {
      for (const opt of matches) {
        const score = scoreDrop(captured, field, hand, card, opt.id) + rng() * 0.35;
        if (score > bestScore) {
          bestScore = score;
          best = { cardId: card.id, choiceId: opt.id };
        }
      }
    } else {
      const score = scoreDrop(captured, field, hand, card) + rng() * 0.35;
      if (score > bestScore) {
        bestScore = score;
        best = { cardId: card.id };
      }
    }
  }
  return best;
}

/** Whether the actor should continue instead of taking the points. */
export function wantsKoikoi(state: GameState, actor: Actor, rng: () => number = Math.random): boolean {
  const opp = other(actor);
  if (state.hands[actor].length + state.hands[opp].length === 0) return false;
  const mine = yakuPoints(state.captured[actor]);
  const oppPts = yakuPoints(state.captured[opp]);
  const oppBright = state.captured[opp].filter((c) => c.kind === "hikari").length;
  if (mine >= 7) return false;
  if (oppBright >= 3 || oppPts >= 5) return false;
  if (state.hands[opp].length === 0) return false;
  if (mine <= 3 && oppBright <= 1 && oppPts === 0) return true;
  if (mine <= 5 && oppPts <= 1 && oppBright <= 1) return rng() < 0.62;
  return rng() < 0.2;
}
