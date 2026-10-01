import { useEffect, useRef, useState } from "react";
import {
  continueBetween,
  createMatch,
  nextRound,
  playerChoose,
  playerDecide,
  playerPlay,
  resumeMatch,
  startMatch,
  stepCpu,
  updateSettings,
} from "@/game/engine";
import { playChime, playSnap, unlockAudio } from "@/game/sound";
import { loadSave, writeSave, type SaveData } from "@/game/storage";
import type { GameState } from "@/game/types";

export function useKoiKoi() {
  const [game, setGame] = useState<GameState>(() =>
    createMatch({ target: 30, oyaDouble: true, sound: true }),
  );
  const [booted, setBooted] = useState(false);
  const [offer, setOffer] = useState<SaveData | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const reducedRef = useRef(false);
  const heardRef = useRef(-1);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saved = loadSave();
    if (saved) {
      if (saved.inMatch) setOffer(saved);
      setGame((g) =>
        updateSettings({ ...g, stats: saved.stats }, {
          target: saved.target,
          oyaDouble: saved.oyaDouble,
          sound: saved.sound,
        }),
      );
    }
    setBooted(true);
    const onPointer = () => unlockAudio();
    window.addEventListener("pointerdown", onPointer, { once: true });
    return () => window.removeEventListener("pointerdown", onPointer);
  }, []);

  useEffect(() => {
    if (!booted) return;
    if (game.phase !== "cpu" && game.phase !== "between") return;
    const ms = reducedRef.current ? 140 : game.phase === "cpu" ? 760 : 680;
    const id = window.setTimeout(() => {
      setGame((g) => {
        if (g.seq !== game.seq) return g;
        if (g.phase === "between") return continueBetween(g);
        if (g.phase === "cpu") return stepCpu(g);
        return g;
      });
    }, ms);
    return () => window.clearTimeout(id);
  }, [booted, game.phase, game.seq]);

  useEffect(() => {
    if (!booted || !game.sound) return;
    if (heardRef.current === game.seq) return;
    heardRef.current = game.seq;
    if (game.phase === "between" && game.takenIds.length > 0) playSnap();
    if (game.phase === "decide") playChime();
    if ((game.phase === "roundEnd" || game.phase === "matchEnd") && game.result?.winner) playChime();
  }, [booted, game.phase, game.seq, game.sound, game.takenIds.length, game.result]);

  useEffect(() => {
    if (!booted) return;
    const playing = game.phase !== "title" && game.phase !== "matchEnd";
    const data: SaveData = {
      version: 1,
      target: game.target,
      oyaDouble: game.oyaDouble,
      sound: game.sound,
      stats: game.stats,
      scores: playing ? game.scores : offer ? offer.scores : { player: 0, cpu: 0 },
      round: playing ? (game.phase === "roundEnd" ? game.round + 1 : game.round) : (offer?.round ?? 1),
      oya: playing ? (game.phase === "roundEnd" ? game.nextOya : game.oya) : (offer?.oya ?? "player"),
      inMatch: playing ? true : game.phase === "matchEnd" ? false : Boolean(offer),
    };
    writeSave(data);
  }, [booted, game, offer]);

  return {
    game,
    offer,
    rulesOpen,
    setRulesOpen,
    confirmQuit,
    setConfirmQuit,
    play: (id: string) => setGame((g) => playerPlay(g, id)),
    choose: (id: string) => setGame((g) => playerChoose(g, id)),
    agari: () => setGame((g) => playerDecide(g, "agari")),
    koikoi: () => setGame((g) => playerDecide(g, "koikoi")),
    dealNext: () => setGame((g) => nextRound(g)),
    begin: () => {
      setOffer(null);
      unlockAudio();
      setGame((g) => startMatch(g));
    },
    resume: () => {
      if (!offer?.inMatch) return;
      const saved = offer;
      setOffer(null);
      unlockAudio();
      setGame((g) => resumeMatch(g, { scores: saved.scores, round: saved.round, oya: saved.oya }));
    },
    quit: () => {
      setOffer(null);
      setConfirmQuit(false);
      setRulesOpen(false);
      setGame((g) =>
        createMatch({
          target: g.target,
          oyaDouble: g.oyaDouble,
          sound: g.sound,
          stats: g.stats,
        }),
      );
    },
    setTarget: (target: number) => setGame((g) => updateSettings(g, { target })),
    toggleOya: () => setGame((g) => updateSettings(g, { oyaDouble: !g.oyaDouble })),
    toggleSound: () => setGame((g) => updateSettings(g, { sound: !g.sound })),
  };
}
