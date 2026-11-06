import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MEMORY_LEVELS } from './levels.ts';
import { CardTheme, MemoryCard, MemoryLevel } from './types.ts';
import { createDeck, checkPairMatch, calculateMemoryStars, calculateMemoryScore } from './engine.ts';
import { sfx, unlockAudio } from '../../services/audio.ts';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Volume2, VolumeX, Sparkles, HelpCircle } from 'lucide-react';

export interface MemoryGameProps {
  levelIndex: number;
  lang: 'en' | 'bn';
  muted: boolean;
  onExit: () => void;
  onComplete: (levelIndex: number, stats: { stars: number; score: number; deaths: number; timeSeconds: number }) => void;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
  toggleMute: () => void;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  levelIndex,
  lang,
  muted,
  onExit,
  onComplete,
  onNextLevel,
  hasNextLevel = true,
  toggleMute,
}) => {
  const level: MemoryLevel = MEMORY_LEVELS[levelIndex] || MEMORY_LEVELS[0];
  const [theme, setTheme] = useState<CardTheme>('arcade');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedCount, setMatchedCount] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(1);
  const [result, setResult] = useState<{ score: number; stars: number } | null>(null);
  const [showRules, setShowRules] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initGame = useCallback(() => {
    const deck = createDeck(level, theme);
    setCards(deck);
    setFlippedIndices([]);
    setMatchedCount(0);
    setMoves(0);
    setSeconds(0);
    setCombo(1);
    setIsProcessing(false);
    setResult(null);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }, [level, theme]);

  useEffect(() => {
    initGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [initGame]);

  // Card click handler
  const handleCardClick = (index: number) => {
    unlockAudio();
    if (isProcessing) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length >= 2) return;

    sfx.cardFlip();

    // Flip card
    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const nextFlipped = [...flippedIndices, index];
    setFlippedIndices(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsProcessing(true);

      const [firstIdx, secondIdx] = nextFlipped;
      const cardA = updatedCards[firstIdx];
      const cardB = updatedCards[secondIdx];

      if (checkPairMatch(cardA, cardB)) {
        // Matched!
        setTimeout(() => {
          sfx.cardMatch();
          updatedCards[firstIdx].isMatched = true;
          updatedCards[secondIdx].isMatched = true;
          setCards([...updatedCards]);
          setFlippedIndices([]);
          setMatchedCount((prev) => {
            const nextMatch = prev + 1;
            if (nextMatch === level.pairsCount) {
              // Game Won!
              if (timerRef.current) clearInterval(timerRef.current);
              sfx.win();
              try {
                confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
              } catch {
                // ignore
              }
              const stars = calculateMemoryStars(moves + 1, level.targetMoves, seconds, level.targetSeconds);
              const score = calculateMemoryScore(moves + 1, level.targetMoves, seconds, level.targetSeconds, level.pairsCount);
              setResult({ score, stars });
              onComplete(levelIndex, {
                stars,
                score,
                deaths: 0,
                timeSeconds: seconds,
              });
            }
            return nextMatch;
          });
          setCombo((c) => Math.min(5, c + 1));
          setIsProcessing(false);
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          sfx.cardMiss();
          updatedCards[firstIdx].isFlipped = false;
          updatedCards[secondIdx].isFlipped = false;
          setCards([...updatedCards]);
          setFlippedIndices([]);
          setCombo(1);
          setIsProcessing(false);
        }, 900);
      }
    }
  };

  const formatSecs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  // Grid styling based on cols
  const gridColsClass =
    level.cols === 4
      ? 'grid-cols-4'
      : level.cols === 5
      ? 'grid-cols-5'
      : level.cols === 6
      ? 'grid-cols-6'
      : 'grid-cols-4';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto select-none">
      {/* Top Bar HUD */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-t-xl text-xs sm:text-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Levels</span>
          </button>
          <div className="flex items-baseline gap-1.5 pl-1">
            <span className="font-display font-bold text-violet-400 text-sm sm:text-base">
              {lang === 'bn' ? 'লেভেল' : 'Level'} {level.id}:
            </span>
            <span className="font-medium text-slate-200">{lang === 'bn' ? level.nameBn : level.name}</span>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs sm:text-sm">
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-400 text-[10px] uppercase">Moves:</span>
            <span className="font-bold text-violet-300">{moves}</span>
            <span className="text-slate-500 text-xs">/ {level.targetMoves}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-400 text-[10px] uppercase">Pairs:</span>
            <span className="font-bold text-emerald-400">{matchedCount}</span>
            <span className="text-slate-500 text-xs">/ {level.pairsCount}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-400 text-[10px] uppercase">Time:</span>
            <span className="font-bold text-amber-400">{formatSecs(seconds)}</span>
          </div>
          {combo > 1 && (
            <div className="hidden sm:flex items-center gap-1 text-amber-400 font-bold animate-pulse">
              <Sparkles className="w-3.5 h-3.5" />
              <span>x{combo}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          {/* Theme Selector */}
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as CardTheme)}
            className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 cursor-pointer focus:outline-none focus:border-violet-500 hidden sm:block"
          >
            <option value="arcade">🕹️ Arcade</option>
            <option value="ballot">🗳️ Ballot</option>
            <option value="cyber">⚡ Cyber</option>
          </select>

          <button
            onClick={() => setShowRules(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={initGame}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Restart"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cards Playfield Viewport */}
      <div className="relative w-full min-h-[460px] p-4 sm:p-6 bg-slate-950 border-x border-b border-slate-800 rounded-b-xl flex items-center justify-center">
        <div className={`grid ${gridColsClass} gap-2.5 sm:gap-3.5 w-full max-w-2xl mx-auto`}>
          {cards.map((card, idx) => {
            const isRevealed = card.isFlipped || card.isMatched;
            return (
              <button
                key={card.instanceId}
                onClick={() => handleCardClick(idx)}
                disabled={card.isMatched || isRevealed}
                className={`aspect-[3/4] rounded-xl flex flex-col items-center justify-center transition-all duration-300 transform perspective-1000 cursor-pointer ${
                  card.isMatched
                    ? 'bg-emerald-950/40 border border-emerald-500/40 scale-95 opacity-60 pointer-events-none'
                    : isRevealed
                    ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-violet-500 shadow-lg shadow-violet-900/30 scale-100 rotate-y-180'
                    : 'bg-gradient-to-br from-slate-900 to-slate-850 hover:from-slate-850 hover:to-slate-800 border border-slate-700/70 hover:border-violet-500/50 hover:scale-102 active:scale-95 shadow-md'
                }`}
                aria-label={isRevealed ? card.name : `Card ${idx + 1}`}
              >
                {isRevealed ? (
                  <div className="flex flex-col items-center justify-center p-1 text-center animate-in fade-in zoom-in-75 duration-200">
                    <span className="text-2xl sm:text-3xl filter drop-shadow-md mb-1">{card.symbol}</span>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-200 truncate max-w-[70px] sm:max-w-[90px]">
                      {card.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-600">
                    <span className="text-xl opacity-40">✨</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Modal */}
        {result && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-20">
            <div className="bg-slate-900 border border-violet-500/50 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl shadow-violet-950/50">
              <div className="text-4xl mb-2">🧠</div>
              <h2 className="text-2xl font-display font-bold text-white mb-1">Puzzle Solved!</h2>
              <p className="text-xs text-slate-400 mb-3">All matching pairs discovered!</p>

              <div className="flex justify-center gap-2 text-2xl text-amber-400 mb-4">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i < result.stars ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-slate-700'}>
                    ★
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2 bg-slate-800/80 p-3 rounded-xl border border-slate-700 mb-5 font-mono text-center">
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Score</div>
                  <div className="text-sm sm:text-base font-bold text-violet-400">+{result.score}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Moves</div>
                  <div className="text-sm sm:text-base font-bold text-slate-200">{moves}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Time</div>
                  <div className="text-sm sm:text-base font-bold text-emerald-400">{formatSecs(seconds)}</div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {hasNextLevel ? (
                  <button
                    onClick={onNextLevel}
                    className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold cursor-pointer transition shadow-lg shadow-violet-900/40"
                  >
                    Next Level ▶
                  </button>
                ) : (
                  <button
                    onClick={onExit}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold cursor-pointer transition"
                  >
                    All Levels Completed!
                  </button>
                )}
                <button
                  onClick={initGame}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium cursor-pointer transition text-xs"
                >
                  Replay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rules Modal */}
        {showRules && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-30">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full text-left shadow-2xl">
              <h3 className="text-lg font-display font-bold text-violet-400 mb-2">How to Play</h3>
              <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                Click any two cards to reveal them. If they match, they stay unlocked. Consecutive matches grant combo bonuses! Complete with fewer moves and faster time to earn 3 stars.
              </p>
              <button
                onClick={() => setShowRules(false)}
                className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold cursor-pointer transition text-xs"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Hint */}
      <div className="flex items-center justify-center gap-4 text-xs text-slate-400 pt-2 font-mono">
        <span>Click / Tap cards to reveal matching pairs</span>
        <span>Theme: <span className="text-violet-400 uppercase font-semibold">{theme}</span></span>
      </div>
    </div>
  );
};
