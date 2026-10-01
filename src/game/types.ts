export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Kind = "hikari" | "tane" | "tanzaku" | "kasu";

export type Tag =
  | "rain"
  | "crane"
  | "curtain"
  | "moon"
  | "phoenix"
  | "sake"
  | "boar"
  | "deer"
  | "butterflies"
  | "poetry"
  | "blue";

export interface Card {
  id: string;
  month: Month;
  kind: Kind;
  name: string;
  short: string;
  tags: Tag[];
}

export type Actor = "player" | "cpu";

export type Phase =
  | "title"
  | "playerPlay"
  | "playerChoose"
  | "drawChoose"
  | "decide"
  | "cpu"
  | "between"
  | "roundEnd"
  | "matchEnd";

export interface Yaku {
  id: string;
  name: string;
  points: number;
  detail: string;
}

export interface RoundResult {
  winner: Actor | null;
  base: number;
  mult: number;
  points: number;
  yaku: Yaku[];
  calls: number;
  oyaBonus: boolean;
  reason: string;
}

export interface Stats {
  wins: number;
  losses: number;
  rounds: number;
}

export interface GameState {
  phase: Phase;
  /** Whose turn is being resolved. */
  actor: Actor;
  oya: Actor;
  nextOya: Actor;
  hands: Record<Actor, Card[]>;
  captured: Record<Actor, Card[]>;
  field: Card[];
  deck: Card[];
  pending: Card | null;
  pendingSource: "hand" | "draw" | null;
  /** After a pause, what between-phase should do. */
  betweenNext: "draw" | "yaku" | "opponent" | null;
  optionIds: string[];
  takenIds: string[];
  /** Yaku points already banked by a koi-koi call this round. */
  locked: Record<Actor, number>;
  koikoi: Record<Actor, number>;
  scores: Record<Actor, number>;
  target: number;
  round: number;
  oyaDouble: boolean;
  sound: boolean;
  message: string;
  result: RoundResult | null;
  stats: Stats;
  seq: number;
}
