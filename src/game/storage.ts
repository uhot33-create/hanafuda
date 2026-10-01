import type { Actor, Stats } from "./types.ts";

const KEY = "hanafuda-koikoi-v1";

export interface SaveData {
  version: 1;
  target: number;
  oyaDouble: boolean;
  sound: boolean;
  scores: Record<Actor, number>;
  round: number;
  oya: Actor;
  inMatch: boolean;
  stats: Stats;
}

function isActor(value: unknown): value is Actor {
  return value === "player" || value === "cpu";
}

export function loadSave(): SaveData | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Partial<SaveData>;
    if (data.version !== 1 || !data.scores || !data.stats) return null;
    if (!isActor(data.oya)) return null;
    const target = data.target === 20 || data.target === 30 || data.target === 50 ? data.target : 30;
    return {
      version: 1,
      target,
      oyaDouble: Boolean(data.oyaDouble),
      sound: data.sound !== false,
      scores: {
        player: Number(data.scores.player) || 0,
        cpu: Number(data.scores.cpu) || 0,
      },
      round: Number(data.round) || 1,
      oya: data.oya,
      inMatch: Boolean(data.inMatch),
      stats: {
        wins: Number(data.stats.wins) || 0,
        losses: Number(data.stats.losses) || 0,
        rounds: Number(data.stats.rounds) || 0,
      },
    };
  } catch {
    return null;
  }
}

export function writeSave(data: SaveData): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}
