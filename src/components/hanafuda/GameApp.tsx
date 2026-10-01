import { Crown, ScrollText, Volume2, VolumeX, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { byId, sortCards } from "@/game/cards";
import type { Card, GameState, RoundResult } from "@/game/types";
import { listYaku, yakuBoard, yakuPoints } from "@/game/yaku";
import { CardView } from "./CardView";
import { useKoiKoi } from "./useKoiKoi";

const HERO = ["m1-crane", "m3-curtain", "m8-moon"].map((id) => byId(id));

function agariPoints(game: GameState): number {
  const base = yakuPoints(game.captured.player);
  let mult = 1;
  const calls = game.koikoi.player + game.koikoi.cpu;
  if (calls > 0) mult *= 2 ** calls;
  if (game.oyaDouble && game.oya === "player") mult *= 2;
  return base * mult;
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="inline-flex size-11 items-center justify-center rounded-full text-gold-soft"
    >
      {children}
    </button>
  );
}

function ScoreBlock({
  label,
  score,
  target,
  oya,
  yaku,
  align,
}: {
  label: string;
  score: number;
  target: number;
  oya: boolean;
  yaku: string;
  align: "start" | "end";
}) {
  return (
    <div className={align === "end" ? "text-right" : "text-left"}>
      <p className="flex items-center gap-1 text-xs text-haze">
        {align === "end" ? null : oya ? <Crown className="size-3 text-gold" aria-hidden="true" /> : null}
        <span>{label}</span>
        {align === "end" && oya ? <Crown className="size-3 text-gold" aria-hidden="true" /> : null}
      </p>
      <p className="font-display text-2xl leading-none tabular-nums">
        {score}
        <span className="text-xs text-haze">/{target}</span>
      </p>
      <p className="mt-1 max-w-28 truncate text-xs text-gold">{yaku}</p>
    </div>
  );
}

function CaptureRow({
  cards,
  takenIds,
  empty,
}: {
  cards: Card[];
  takenIds: string[];
  empty: string;
}) {
  if (cards.length === 0) {
    return <p className="py-2 text-xs text-haze">{empty}</p>;
  }
  return (
    <div className="flex gap-2 overflow-x-auto px-1 py-1">
      {sortCards(cards).map((card) => (
        <CardView key={card.id} card={card} mini taken={takenIds.includes(card.id)} />
      ))}
    </div>
  );
}

function RulesSheet({
  cards,
  onClose,
}: {
  cards: Card[];
  onClose: () => void;
}) {
  const rows = yakuBoard(cards);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/70 p-3 sm:items-center" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-title"
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-paper p-5 text-ink"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="rules-title" className="font-display text-2xl text-balance">
            遊び方
          </h2>
          <button type="button" aria-label="閉じる" onClick={onClose} className="inline-flex size-11 items-center justify-center">
            <X className="size-5" />
          </button>
        </div>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm leading-relaxed">
          <li>手札を1枚出す。場に同じ月があれば取る。2枚ならどちらか、3枚なら全部。</li>
          <li>山札を1枚めくり、同じように取るか場に置く。</li>
          <li>役ができたらいい。あがりで点を確定し、こいこいすると最終的な点が倍になる。</li>
        </ol>
        <p className="mt-3 text-sm leading-relaxed text-pretty">
          親が勝つと点は2倍（切れる）。親が勝つと親続行、子の勝ちと流局は親交代。手四は6点。盃はカスに数える。雨は三光に入らない。
        </p>
        <h3 className="mt-5 font-display text-lg">いまの役</h3>
        <ul className="mt-2 divide-y divide-ink/10">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center gap-3 py-2 text-sm">
              <span className="w-16 shrink-0 font-display">{row.name}</span>
              <span className="w-10 shrink-0 tabular-nums text-haze">
                {row.have}/{row.need}
              </span>
              <span className="min-w-0 flex-1 truncate text-haze">{row.detail}</span>
              <span className="shrink-0 tabular-nums">{row.met ? "成立" : `${row.points}点`}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function ResultSheet({
  game,
  onNext,
  onAgain,
  onTitle,
}: {
  game: GameState;
  onNext: () => void;
  onAgain: () => void;
  onTitle: () => void;
}) {
  const result = game.result as RoundResult;
  const match = game.phase === "matchEnd";
  const callsMult = result.calls > 0 ? 2 ** result.calls : 1;
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/70 p-3 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-paper p-5 text-ink" role="dialog" aria-modal="true" aria-labelledby="result-title">
        <p className="text-xs tracking-widest text-haze">{match ? "勝負あり" : `第${game.round}局`}</p>
        <h2 id="result-title" className="mt-1 font-display text-4xl text-balance">
          {match ? (result.winner === "player" ? "あなたの勝ち" : "相手の勝ち") : result.reason}
        </h2>
        {result.winner ? (
          <>
            <p className="mt-2 text-sm">
              {result.winner === "player" ? "あなた" : "相手"}
              {result.yaku.length > 0 ? ` · ${result.yaku.map((y) => `${y.name}${y.points}`).join("、")}` : ""}
            </p>
            <p className="mt-4 font-display text-5xl tabular-nums leading-none">{result.points}</p>
            <p className="mt-2 text-sm text-haze">
              基本 {result.base}
              {result.calls > 0 ? ` × こいこい${callsMult}` : ""}
              {result.oyaBonus ? " × 親2" : ""}
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm leading-relaxed">誰もあがりませんでした。親が交代して次の局です。</p>
        )}
        <div className="mt-5 flex items-center justify-between text-sm tabular-nums">
          <span>あなた {game.scores.player}</span>
          <span>相手 {game.scores.cpu}</span>
        </div>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          {match ? (
            <button type="button" onClick={onAgain} className="h-12 flex-1 rounded-xl bg-lacquer px-4 text-cream">
              もう一局
            </button>
          ) : (
            <button type="button" onClick={onNext} className="h-12 flex-1 rounded-xl bg-lacquer px-4 text-cream">
              次の局へ
            </button>
          )}
          <button type="button" onClick={onTitle} className="h-12 flex-1 rounded-xl border border-ink/20 px-4">
            タイトルへ
          </button>
        </div>
      </div>
    </div>
  );
}

function TitleScreen({
  api,
}: {
  api: ReturnType<typeof useKoiKoi>;
}) {
  const { game, offer } = api;
  return (
    <main className="table-bg h-dvh overflow-y-auto">
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center gap-8 px-5 py-8 md:flex-row md:items-center">
        <div className="fan md:order-2 md:flex-1" aria-hidden="true">
          {HERO.map((card) => (
            <CardView key={card.id} card={card} hero />
          ))}
        </div>
        <div className="md:flex-1">
          <p className="text-sm tracking-widest text-gold">花札</p>
          <h1 className="mt-1 font-display text-5xl text-balance text-cream">こいこい</h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-pretty text-gold-soft">
            場に同じ月があれば取る。役ができたら、点数を確定してあがるか、こいこいで倍を狙う。
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-gold/40 p-1" role="group" aria-label="先取点">
              {[20, 30, 50].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => api.setTarget(n)}
                  className={
                    game.target === n
                      ? "h-11 rounded-lg bg-lacquer px-3 text-sm text-cream"
                      : "h-11 rounded-lg px-3 text-sm text-haze"
                  }
                  aria-pressed={game.target === n}
                >
                  {n}点
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={api.toggleOya}
              aria-pressed={game.oyaDouble}
              className="h-11 rounded-xl border border-gold/40 px-3 text-sm text-gold-soft"
            >
              親の勝ちは2倍 {game.oyaDouble ? "オン" : "オフ"}
            </button>
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={api.begin} className="h-12 rounded-xl bg-lacquer px-6 text-cream">
              対局を始める
            </button>
            {offer?.inMatch ? (
              <button type="button" onClick={api.resume} className="h-12 rounded-xl border border-gold px-4 text-gold-soft">
                続きから {offer.scores.player}-{offer.scores.cpu}
              </button>
            ) : null}
          </div>
          <p className="mt-4 text-xs text-haze tabular-nums">
            勝ち {game.stats.wins} · 負け {game.stats.losses} · {game.stats.rounds}局
          </p>
          <button type="button" onClick={() => api.setRulesOpen(true)} className="mt-2 inline-flex h-11 items-center text-sm text-gold-soft">
            遊び方と役
          </button>
        </div>
      </div>
      {api.rulesOpen ? <RulesSheet cards={[]} onClose={() => api.setRulesOpen(false)} /> : null}
    </main>
  );
}

function yakuLabel(cards: Card[]): string {
  const list = listYaku(cards);
  if (list.length === 0) return "";
  return list.map((y) => y.name).join("・");
}

function Board({ api }: { api: ReturnType<typeof useKoiKoi> }) {
  const { game } = api;
  const choosing = game.phase === "playerChoose" || game.phase === "drawChoose";
  const yourTurn = game.phase === "playerPlay";
  const [hoverMonth, setHoverMonth] = useState<number | null>(null);
  const playerYaku = yakuLabel(game.captured.player);
  const cpuYaku = yakuLabel(game.captured.cpu);
  const backs = Math.min(game.hands.cpu.length, 5);
  const monthOnField = (month: number) => game.field.some((card) => card.month === month);
  const blinks = (month: number) => {
    if (hoverMonth !== month) return false;
    if (choosing) return game.pending?.month === month;
    return yourTurn && monthOnField(month);
  };

  return (
    <main className="table-bg flex h-dvh min-h-0 flex-col">
      <header className="px-3 pt-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-xl leading-none">
              花札<span className="text-gold">こいこい</span>
            </h1>
            <p className="mt-1 text-xs text-haze">
              第{game.round}局 · {game.target}点先取
              {game.oya === "player" ? " · あなたが親" : " · 相手が親"}
            </p>
          </div>
          <div className="flex">
            <IconButton label="遊び方" onClick={() => api.setRulesOpen(true)}>
              <ScrollText className="size-5" />
            </IconButton>
            <IconButton label={game.sound ? "音を消す" : "音を出す"} onClick={api.toggleSound}>
              {game.sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            </IconButton>
            <IconButton label="対局をやめる" onClick={() => api.setConfirmQuit(true)}>
              <X className="size-5" />
            </IconButton>
          </div>
        </div>
        <div className="mt-2 flex items-end gap-3">
          <ScoreBlock
            label="あなた"
            score={game.scores.player}
            target={game.target}
            oya={game.oya === "player"}
            yaku={playerYaku}
            align="start"
          />
          <div className="mb-5 h-1.5 min-w-8 flex-1 overflow-hidden rounded-full bg-ink-soft" aria-hidden="true">
            <div
              className="h-full bg-lacquer"
              style={{ width: `${Math.min(100, (game.scores.player / game.target) * 100)}%` }}
            />
          </div>
          <ScoreBlock
            label="相手"
            score={game.scores.cpu}
            target={game.target}
            oya={game.oya === "cpu"}
            yaku={cpuYaku}
            align="end"
          />
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-3">
        <section aria-label="相手">
          <div className="flex items-center gap-2">
            <div className="back-pile flex shrink-0" aria-hidden="true">
              {Array.from({ length: backs }).map((_, i) => (
                <CardView key={i} faceDown stack />
              ))}
            </div>
            <p className="shrink-0 text-xs text-haze tabular-nums">手札 {game.hands.cpu.length}</p>
            <div className="min-w-0 flex-1">
              <CaptureRow cards={game.captured.cpu} takenIds={game.takenIds} empty="取り札はまだありません" />
            </div>
          </div>
        </section>

        <section className="field-mat min-h-36 flex-1 p-2" aria-label="場札">
          <div className="flex items-start gap-2">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <CardView faceDown />
              <span className="text-xs text-gold-soft tabular-nums">山 {game.deck.length}</span>
            </div>
            <div className="flex flex-1 flex-wrap content-start justify-center gap-4">
              {game.field.length === 0 ? <p className="py-6 text-sm text-haze">場に札がありません</p> : null}
              {game.field.map((card) => {
                const option = choosing && game.optionIds.includes(card.id);
                const paired = option || (yourTurn && game.hands.player.some((hand) => hand.month === card.month));
                return (
                  <CardView
                    key={card.id}
                    card={card}
                    hot={paired}
                    blink={paired && blinks(card.month)}
                    dim={choosing && !option}
                    onHoverMonth={paired ? setHoverMonth : undefined}
                    onClick={option ? () => api.choose(card.id) : undefined}
                  />
                );
              })}
            </div>
          </div>
        </section>

        <section aria-label="あなたの取り札">
          <CaptureRow cards={game.captured.player} takenIds={game.takenIds} empty="取った札がここに並びます" />
        </section>
      </div>

      <div className="safe-b px-3">
        <div className="flex flex-col gap-2 rounded-xl border border-gold/35 bg-ink-soft px-3 py-2 sm:flex-row sm:items-center" aria-live="polite">
          {game.pending && choosing ? (
            <CardView card={game.pending} mini blink={blinks(game.pending.month)} />
          ) : null}
          <p className="min-w-0 flex-1 text-sm text-pretty">{game.message}</p>
          {game.phase === "decide" ? (
            <div className="flex gap-2">
              <button type="button" onClick={api.agari} className="h-12 flex-1 rounded-xl bg-lacquer px-4 text-cream sm:flex-none">
                あがり {agariPoints(game)}点
              </button>
              <button type="button" onClick={api.koikoi} className="h-12 flex-1 rounded-xl border border-gold px-4 text-gold-soft sm:flex-none">
                こいこい
              </button>
            </div>
          ) : null}
        </div>
        <div className="mt-2 flex gap-4 overflow-x-auto px-1 py-3" aria-label="手札">
          {game.hands.player.map((card) => {
            const hot = yourTurn && monthOnField(card.month);
            return (
              <CardView
                key={card.id}
                card={card}
                hot={hot}
                blink={hot && blinks(card.month)}
                disabled={!yourTurn}
                onHoverMonth={hot ? setHoverMonth : undefined}
                onClick={() => api.play(card.id)}
              />
            );
          })}
        </div>
      </div>

      {game.phase === "roundEnd" || game.phase === "matchEnd" ? (
        <ResultSheet game={game} onNext={api.dealNext} onAgain={api.begin} onTitle={api.quit} />
      ) : null}
      {api.rulesOpen ? <RulesSheet cards={game.captured.player} onClose={() => api.setRulesOpen(false)} /> : null}
      {api.confirmQuit ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/70 p-3 sm:items-center">
          <div className="w-full max-w-sm rounded-2xl bg-paper p-5 text-ink" role="dialog" aria-modal="true" aria-labelledby="quit-title">
            <h2 id="quit-title" className="font-display text-2xl">
              対局をやめますか
            </h2>
            <p className="mt-2 text-sm">この対局の点数は消えます。</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={api.quit} className="h-12 flex-1 rounded-xl bg-lacquer text-cream">
                やめる
              </button>
              <button type="button" onClick={() => api.setConfirmQuit(false)} className="h-12 flex-1 rounded-xl border border-ink/20">
                続ける
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export function GameApp() {
  const api = useKoiKoi();
  if (api.game.phase === "title") return <TitleScreen api={api} />;
  return <Board api={api} />;
}
