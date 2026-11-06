import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SNAKE_COLS, SNAKE_ROWS, SNAKE_LEVELS } from './levels.ts';
import { Direction, PowerupType, SnakeLevel } from './types.ts';
import { createInitialSnakeState, stepSnake, isOppositeDirection, SnakeState } from './engine.ts';
import { sfx, unlockAudio } from '../../services/audio.ts';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Pause, Play, Volume2, VolumeX, Zap, Ghost, Sparkles } from 'lucide-react';

export interface SnakeGameProps {
  levelIndex: number;
  lang: 'en' | 'bn';
  muted: boolean;
  onExit: () => void;
  onComplete: (levelIndex: number, stats: { stars: number; score: number; deaths: number; timeSeconds: number }) => void;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
  toggleMute: () => void;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({
  levelIndex,
  lang,
  muted,
  onExit,
  onComplete,
  onNextLevel,
  hasNextLevel = true,
  toggleMute,
}) => {
  const level: SnakeLevel = SNAKE_LEVELS[levelIndex] || SNAKE_LEVELS[0];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef<SnakeState>(createInitialSnakeState(level));
  const [gameState, setGameState] = useState<SnakeState>(stateRef.current);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [result, setResult] = useState<{ score: number; stars: number } | null>(null);

  const resetGame = useCallback(() => {
    stateRef.current = createInitialSnakeState(level);
    setGameState(stateRef.current);
    setIsPaused(false);
    setResult(null);
  }, [level]);

  useEffect(() => {
    resetGame();
  }, [levelIndex, resetGame]);

  // Game Loop
  useEffect(() => {
    let animId = 0;
    let lastTick = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      if (isPaused || result || stateRef.current.isDead || stateRef.current.isWin) {
        return;
      }

      const currentState = stateRef.current;
      const isSpeedBoosted = currentState.speedTimer > 0;
      const currentSpeed = (currentState.level.baseSpeed + (isSpeedBoosted ? 5 : 0));
      const tickInterval = 1000 / currentSpeed;

      if (now - lastTick >= tickInterval) {
        const dt = (now - lastTick) / 1000;
        lastTick = now;

        const res = stepSnake(currentState, dt);
        stateRef.current = res.state;
        setGameState({ ...res.state });

        if (res.ateFood) {
          sfx.snakeEat();
        }
        if (res.ateSpecial) {
          sfx.snakePower();
        }
        if (res.died) {
          sfx.die();
        }
        if (res.won) {
          sfx.win();
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
          const stars = res.state.score >= level.targetScore * 1.4 ? 3 : res.state.score >= level.targetScore * 1.15 ? 2 : 1;
          setResult({ score: res.state.score, stars });
          onComplete(levelIndex, {
            stars,
            score: res.state.score,
            deaths: 0,
            timeSeconds: 60,
          });
        }
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, result, levelIndex, level.targetScore, onComplete]);

  // Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellW = canvas.width / SNAKE_COLS;
    const cellH = canvas.height / SNAKE_ROWS;
    const st = gameState;

    // Background
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= SNAKE_COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellW, 0);
      ctx.lineTo(x * cellW, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= SNAKE_ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellH);
      ctx.lineTo(canvas.width, y * cellH);
      ctx.stroke();
    }

    // Walls
    for (const w of st.level.walls) {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(w.x * cellW + 1, w.y * cellH + 1, cellW - 2, cellH - 2);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(w.x * cellW + 2, w.y * cellH + 2, cellW - 4, cellH - 4);
    }

    // Regular Food (Golden Apple)
    const fx = st.food.x * cellW + cellW / 2;
    const fy = st.food.y * cellH + cellH / 2;
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(fx, fy, cellW * 0.38, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(fx, fy, cellW * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Special Food
    if (st.specialFood) {
      const sx = st.specialFood.x * cellW + cellW / 2;
      const sy = st.specialFood.y * cellH + cellH / 2;
      ctx.save();
      if (st.specialFood.type === 'speed') {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sx, sy, cellW * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', sx, sy);
      } else if (st.specialFood.type === 'ghost') {
        ctx.fillStyle = '#c084fc';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sx, sy, cellW * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👻', sx, sy);
      } else if (st.specialFood.type === 'diamond') {
        ctx.fillStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sx, sy, cellW * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💎', sx, sy);
      }
      ctx.restore();
    }

    // Snake Body
    const isGhost = st.ghostTimer > 0;
    st.snake.forEach((seg, i) => {
      const isHead = i === 0;
      const px = seg.x * cellW + 1;
      const py = seg.y * cellH + 1;
      const sizeW = cellW - 2;
      const sizeH = cellH - 2;

      ctx.save();
      if (isGhost) {
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = isHead ? '#c084fc' : '#a855f7';
      } else {
        ctx.fillStyle = isHead ? '#10b981' : i % 2 === 0 ? '#059669' : '#047857';
      }

      ctx.beginPath();
      ctx.roundRect(px, py, sizeW, sizeH, isHead ? 6 : 4);
      ctx.fill();

      // Eyes on head
      if (isHead) {
        ctx.fillStyle = '#ffffff';
        let e1x = px + sizeW * 0.3;
        let e1y = py + sizeH * 0.3;
        let e2x = px + sizeW * 0.7;
        let e2y = py + sizeH * 0.3;

        if (st.direction === 'LEFT' || st.direction === 'RIGHT') {
          e1x = st.direction === 'RIGHT' ? px + sizeW * 0.7 : px + sizeW * 0.3;
          e2x = e1x;
          e1y = py + sizeH * 0.3;
          e2y = py + sizeH * 0.7;
        }

        ctx.beginPath();
        ctx.arc(e1x, e1y, 2.5, 0, Math.PI * 2);
        ctx.arc(e2x, e2y, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(e1x, e1y, 1.2, 0, Math.PI * 2);
        ctx.arc(e2x, e2y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }, [gameState]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      unlockAudio();
      const currentDir = stateRef.current.direction;
      let newDir: Direction | null = null;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') newDir = 'UP';
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') newDir = 'DOWN';
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') newDir = 'LEFT';
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') newDir = 'RIGHT';
      else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused((p) => !p);
        return;
      } else if (e.key === 'r' || e.key === 'R') {
        resetGame();
        return;
      }

      if (newDir && !isOppositeDirection(currentDir, newDir)) {
        stateRef.current.nextDirection = newDir;
        sfx.snakeTurn();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [resetGame]);

  const changeDirection = (newDir: Direction) => {
    unlockAudio();
    const currentDir = stateRef.current.direction;
    if (!isOppositeDirection(currentDir, newDir)) {
      stateRef.current.nextDirection = newDir;
      sfx.snakeTurn();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto select-none">
      {/* Top HUD */}
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
            <span className="font-display font-bold text-emerald-400 text-sm sm:text-base">
              {lang === 'bn' ? 'লেভেল' : 'Level'} {level.id}:
            </span>
            <span className="font-medium text-slate-200">{lang === 'bn' ? level.nameBn : level.name}</span>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs sm:text-sm">
          <div className="flex items-center gap-1">
            <span className="text-slate-400 text-[10px] uppercase">Score:</span>
            <span className="font-bold text-emerald-400">{gameState.score}</span>
            <span className="text-slate-500 text-xs">/ {level.targetScore}</span>
          </div>
          {gameState.combo > 1 && (
            <div className="flex items-center gap-1 text-amber-400 animate-pulse font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>x{gameState.combo}</span>
            </div>
          )}
          {gameState.ghostTimer > 0 && (
            <div className="flex items-center gap-1 text-purple-400 font-bold">
              <Ghost className="w-3.5 h-3.5 animate-bounce" />
              <span>{Math.ceil(gameState.ghostTimer)}s</span>
            </div>
          )}
          {gameState.speedTimer > 0 && (
            <div className="flex items-center gap-1 text-cyan-400 font-bold">
              <Zap className="w-3.5 h-3.5" />
              <span>{Math.ceil(gameState.speedTimer)}s</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => setIsPaused((p) => !p)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Pause [P]"
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={resetGame}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Restart [R]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-[25/18] bg-black border-x border-b border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={700}
          height={504}
          className="w-full h-full object-contain block"
        />

        {/* Game Over Modal */}
        {gameState.isDead && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-20">
            <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
              <div className="text-4xl mb-2">💥</div>
              <h2 className="text-2xl font-display font-bold text-rose-400 mb-1">Game Over</h2>
              <p className="text-xs text-slate-400 mb-4">{gameState.deathCause}</p>
              <div className="bg-slate-800/80 p-3 rounded-xl mb-5 font-mono">
                <span className="text-xs text-slate-400">Final Score: </span>
                <span className="text-lg font-bold text-white">{gameState.score}</span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={resetGame}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer transition shadow-lg shadow-emerald-950/50"
                >
                  Try Again
                </button>
                <button
                  onClick={onExit}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium cursor-pointer transition text-xs"
                >
                  Back to Levels
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Victory Modal */}
        {result && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-20">
            <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl shadow-emerald-950/50">
              <div className="text-4xl mb-2">🏆</div>
              <h2 className="text-2xl font-display font-bold text-white mb-1">Level Cleared!</h2>
              <p className="text-xs text-slate-400 mb-3">You reached the target score of {level.targetScore}!</p>
              <div className="flex justify-center gap-2 text-2xl text-amber-400 mb-4">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i < result.stars ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-slate-700'}>
                    ★
                  </span>
                ))}
              </div>
              <div className="bg-slate-800/80 p-3 rounded-xl mb-5 font-mono">
                <span className="text-xs text-slate-400">Final Score: </span>
                <span className="text-xl font-bold text-emerald-400">{result.score}</span>
              </div>
              <div className="flex flex-col gap-2">
                {hasNextLevel ? (
                  <button
                    onClick={onNextLevel}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer transition shadow-lg shadow-emerald-900/40"
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
                  onClick={resetGame}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium cursor-pointer transition text-xs"
                >
                  Replay Level
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Virtual D-Pad */}
      <div className="flex sm:hidden flex-col items-center justify-center w-full py-3 bg-slate-900/90 border border-t-0 border-slate-800 rounded-b-xl touch-none">
        <button
          onTouchStart={(e) => { e.preventDefault(); changeDirection('UP'); }}
          className="w-12 h-11 bg-slate-800 active:bg-emerald-600 border border-slate-700 rounded-lg text-lg text-white flex items-center justify-center mb-1"
        >
          ▲
        </button>
        <div className="flex gap-4">
          <button
            onTouchStart={(e) => { e.preventDefault(); changeDirection('LEFT'); }}
            className="w-12 h-11 bg-slate-800 active:bg-emerald-600 border border-slate-700 rounded-lg text-lg text-white flex items-center justify-center"
          >
            ◀
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); changeDirection('DOWN'); }}
            className="w-12 h-11 bg-slate-800 active:bg-emerald-600 border border-slate-700 rounded-lg text-lg text-white flex items-center justify-center"
          >
            ▼
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); changeDirection('RIGHT'); }}
            className="w-12 h-11 bg-slate-800 active:bg-emerald-600 border border-slate-700 rounded-lg text-lg text-white flex items-center justify-center"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Desktop Hint */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-xs text-slate-400 pt-2 font-mono">
        <span>Steer: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">W A S D</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">Arrows</kbd></span>
        <span>Ghost Power: <span className="text-purple-400">Pass walls & tail</span></span>
        <span>Speed Power: <span className="text-cyan-400">Turbo score chain</span></span>
        <span>Pause: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">P</kbd></span>
      </div>
    </div>
  );
};
