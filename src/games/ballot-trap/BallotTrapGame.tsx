import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createWorld, step, World, DifficultyMode } from './engine.ts';
import { draw } from './render.ts';
import { LEVELS } from './levels.ts';
import { sfx, unlockAudio } from '../../services/audio.ts';
import { STR, pickDeath } from './i18n.ts';
import { W, H } from './consts.ts';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Pause, Play, Volume2, VolumeX, Globe, HelpCircle } from 'lucide-react';

const STEP = 1 / 60;

function formatTime(t: number): string {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export interface BallotTrapGameProps {
  levelIndex: number;
  initialDifficulty?: DifficultyMode;
  lang: 'en' | 'bn';
  muted: boolean;
  onExit: () => void;
  onComplete: (levelIndex: number, stats: { stars: number; score: number; deaths: number; timeSeconds: number }) => void;
  onNextLevel?: () => void;
  hasNextLevel?: boolean;
  toggleMute: () => void;
  toggleLang: () => void;
}

export const BallotTrapGame: React.FC<BallotTrapGameProps> = ({
  levelIndex,
  initialDifficulty = 'normal',
  lang,
  muted,
  onExit,
  onComplete,
  onNextLevel,
  hasNextLevel = true,
  toggleMute,
  toggleLang,
}) => {
  const lv = LEVELS[levelIndex] || LEVELS[0];
  const s = STR[lang];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<World | null>(null);
  const keys = useRef({ left: false, right: false, jump: false });
  const jp = useRef(false);
  const tombs = useRef<Array<{ x: number; y: number }>>([]);
  const stats = useRef({ deaths: 0, msgN: 0 });
  const pausedRef = useRef(false);
  const langRef = useRef(lang);

  const [difficulty, setDifficulty] = useState<DifficultyMode>(initialDifficulty);
  const [hud, setHud] = useState({ got: 0, deaths: 0, time: 0 });
  const [toast, setToast] = useState<{ bn: string; en: string } | null>(null);
  const [paused, setPaused] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [result, setResult] = useState<{ got: number; deaths: number; time: number; score: number } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  langRef.current = lang;

  const restartWorld = useCallback(() => {
    worldRef.current = createWorld(lv, difficulty);
  }, [lv, difficulty]);

  // Restart on level or difficulty change
  useEffect(() => {
    tombs.current = [];
    stats.current = { deaths: 0, msgN: 0 };
    restartWorld();
    setResult(null);
    setPaused(false);
    pausedRef.current = false;
    setToast(null);
    setHud({ got: 0, deaths: 0, time: 0 });
  }, [levelIndex, difficulty, restartWorld]);

  // Main simulation loop
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let acc = 0;
    let hudT = 0;

    const handleEvents = (w: World) => {
      for (const e of w.events) {
        switch (e.t) {
          case 'jump': sfx.jump(); break;
          case 'land': sfx.land(); break;
          case 'ballot': sfx.ballot(); break;
          case 'stomp': sfx.stomp(); break;
          case 'crumble': sfx.crumble(); break;
          case 'pop': sfx.pop(); break;
          case 'thud': sfx.thud(); break;
          case 'shoot': sfx.shoot(); break;
          case 'bump': sfx.bump(); break;
          case 'dodge': sfx.dodge(); break;
          case 'flip': sfx.flip(); break;
          case 'dark': sfx.dark(); break;
          case 'light': sfx.light(); break;
          case 'die': {
            sfx.die();
            stats.current.deaths++;
            tombs.current.push({ x: e.x || 0, y: Math.min(e.y || 0, H - 40) });
            if (tombs.current.length > 30) tombs.current.shift();
            const m = pickDeath(e.cause || 'generic', stats.current.msgN++);
            setToast(m);
            if (toastTimer.current) clearTimeout(toastTimer.current);
            toastTimer.current = setTimeout(() => setToast(null), 1900);
            break;
          }
          case 'win': {
            sfx.win();
            try {
              confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
            } catch {
              // ignore
            }
            const timeBonus = Math.max(0, Math.floor(120 - w.time) * 2);
            const deathPenalty = stats.current.deaths * 10;
            const score = Math.max(100, 200 + w.got * 100 + timeBonus - deathPenalty);
            const r = { got: w.got, deaths: stats.current.deaths, time: w.time, score };
            setTimeout(() => {
              setResult(r);
              onComplete(levelIndex, {
                stars: Math.max(1, w.got),
                score,
                deaths: stats.current.deaths,
                timeSeconds: Math.floor(w.time),
              });
            }, 750);
            break;
          }
        }
      }
      w.events.length = 0;
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = worldRef.current;
      if (w) {
        if (!pausedRef.current && !result) {
          acc += dt;
          while (acc >= STEP) {
            step(w, { ...keys.current, jumpPressed: jp.current }, STEP);
            jp.current = false;
            handleEvents(w);
            acc -= STEP;
            if (w.state === 'dead' && w.stateT > 0.85) {
              restartWorld();
              break;
            }
          }
          hudT += dt;
          if (hudT > 0.1) {
            hudT = 0;
            const cw = worldRef.current;
            if (cw) {
              setHud({ got: cw.got, deaths: stats.current.deaths, time: cw.time });
            }
          }
        }
        draw(ctx, w, { tombs: tombs.current, lang: langRef.current });
      }
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    const setKey = (e: KeyboardEvent, v: boolean) => {
      const k = e.key;
      let used = true;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.current.left = v;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.current.right = v;
      else if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === ' ') {
        if (v && !keys.current.jump) jp.current = true;
        keys.current.jump = v;
      } else {
        used = false;
      }
      if (used && !['Tab', 'F5', 'F11', 'F12'].includes(e.key)) {
        e.preventDefault();
      }
    };

    const kd = (e: KeyboardEvent) => {
      unlockAudio();
      if (e.repeat) return;
      if (e.key === 'r' || e.key === 'R') {
        restartWorld();
        return;
      }
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        pausedRef.current = !pausedRef.current;
        setPaused(pausedRef.current);
        return;
      }
      setKey(e, true);
    };

    const ku = (e: KeyboardEvent) => setKey(e, false);
    const handleBlur = () => {
      keys.current = { left: false, right: false, jump: false };
    };

    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('blur', handleBlur);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', kd);
      window.removeEventListener('keyup', ku);
      window.removeEventListener('blur', handleBlur);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [levelIndex, result, restartWorld, onComplete]);

  // Touch controls
  const handleTouch = (action: 'left' | 'right' | 'jump', active: boolean) => (e: React.SyntheticEvent) => {
    e.preventDefault();
    unlockAudio();
    if (action === 'jump') {
      if (active && !keys.current.jump) jp.current = true;
      keys.current.jump = active;
    } else {
      keys.current[action] = active;
    }
  };

  const starsCount = result ? Math.max(1, result.got) : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-5xl mx-auto select-none">
      {/* Top Bar HUD */}
      <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-t-xl text-xs sm:text-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer font-medium"
            title="Back to Levels"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Levels</span>
          </button>
          <div className="flex items-baseline gap-1.5 pl-1">
            <span className="font-display font-bold text-cyan-400 text-sm sm:text-base">
              {lang === 'bn' ? 'লেভেল' : 'Level'} {lv.id}:
            </span>
            <span className="font-medium text-slate-200">{lv.name[lang]}</span>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 sm:gap-5 font-mono text-xs sm:text-sm">
          <div className="flex items-center gap-1 text-amber-400" title="Ballots collected">
            <span>🗳️</span>
            <span className="font-bold">{hud.got}/3</span>
          </div>
          <div className="flex items-center gap-1 text-rose-400" title="Deaths this attempt">
            <span>💀</span>
            <span className="font-bold">{hud.deaths}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400" title="Timer">
            <span>⏱</span>
            <span className="font-bold">{formatTime(hud.time)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Difficulty Dropdown */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyMode)}
            className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 cursor-pointer focus:outline-none focus:border-cyan-500 hidden sm:block"
          >
            <option value="easy">Casual</option>
            <option value="normal">Normal</option>
            <option value="hard">Hardcore</option>
          </select>

          <button
            onClick={() => setShowRules(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Rules"
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
            onClick={toggleLang}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer font-semibold text-xs flex items-center gap-1"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{s.lang}</span>
          </button>
          <button
            onClick={() => {
              pausedRef.current = !pausedRef.current;
              setPaused(pausedRef.current);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Pause [P / Esc]"
          >
            {paused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4" />}
          </button>
          <button
            onClick={restartWorld}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Restart [R]"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-[5/3] bg-black border-x border-b border-slate-800 rounded-b-xl overflow-hidden shadow-2xl">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="w-full h-full object-contain block"
        />

        {/* Death Toast Message */}
        {toast && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-950/90 text-rose-300 border border-rose-500/40 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-rose-950/50 backdrop-blur-md flex items-center gap-2 animate-bounce pointer-events-none">
            <span>💀</span>
            <span>{toast[lang]}</span>
          </div>
        )}

        {/* Pause Overlay */}
        {paused && !result && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-20">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
              <h2 className="text-xl font-display font-bold text-amber-400 mb-2">{s.paused}</h2>
              <p className="text-sm text-slate-400 mb-6">Take a breather, voter. The ballot box is waiting.</p>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    pausedRef.current = false;
                    setPaused(false);
                  }}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold cursor-pointer transition shadow-lg shadow-cyan-900/30"
                >
                  {s.resume}
                </button>
                <button
                  onClick={restartWorld}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium cursor-pointer transition"
                >
                  {s.restart}
                </button>
                <button
                  onClick={onExit}
                  className="w-full py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl font-medium cursor-pointer transition"
                >
                  {s.menu}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rules Modal Overlay */}
        {showRules && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 z-30">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full text-left shadow-2xl overflow-y-auto max-h-[90%]">
              <h2 className="text-lg font-display font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <span>📜</span> {s.rulesTitle}
              </h2>
              <ul className="space-y-2.5 text-xs text-slate-300 mb-4">
                {s.rules.map(([icon, head, body]) => (
                  <li key={head} className="flex gap-2.5 bg-slate-800/60 p-2 rounded-lg border border-slate-800">
                    <span className="text-base">{icon}</span>
                    <div>
                      <b className="text-slate-100">{head}: </b>
                      <span className="text-slate-300">{body}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-slate-400 italic mb-4">{s.disclaimer}</p>
              <button
                onClick={() => setShowRules(false)}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold cursor-pointer transition"
              >
                {s.understood}
              </button>
            </div>
          </div>
        )}

        {/* Victory Modal */}
        {result && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-20">
            <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 max-w-md w-full text-center shadow-2xl shadow-cyan-950/50">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-2xl font-display font-bold text-white mb-1">{s.cleared}</h2>
              <p className="text-xs text-slate-400 mb-3">{lv.win[lang]}</p>

              {/* Stars Earned */}
              <div className="flex justify-center gap-2 text-2xl text-amber-400 mb-4">
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i < starsCount ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-slate-700'}>
                    ★
                  </span>
                ))}
              </div>

              {/* Stats Card */}
              <div className="grid grid-cols-3 gap-2 bg-slate-800/70 p-3 rounded-xl border border-slate-700/60 mb-5 font-mono text-center">
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Score</div>
                  <div className="text-sm sm:text-base font-bold text-cyan-400">+{result.score}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Ballots</div>
                  <div className="text-sm sm:text-base font-bold text-amber-400">{result.got}/3</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-slate-400">Deaths</div>
                  <div className="text-sm sm:text-base font-bold text-rose-400">{result.deaths}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {hasNextLevel ? (
                  <button
                    onClick={onNextLevel}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold cursor-pointer transition shadow-lg shadow-cyan-900/40"
                  >
                    {s.next}
                  </button>
                ) : (
                  <button
                    onClick={onExit}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold cursor-pointer transition shadow-lg shadow-emerald-900/40"
                  >
                    🏁 {s.allDone}
                  </button>
                )}
                <button
                  onClick={() => {
                    setResult(null);
                    restartWorld();
                  }}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium cursor-pointer transition text-xs sm:text-sm"
                >
                  {s.replay}
                </button>
                <button
                  onClick={onExit}
                  className="w-full py-1.5 text-slate-400 hover:text-slate-200 text-xs cursor-pointer transition"
                >
                  {s.menu}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls Bar */}
      <div className="flex sm:hidden items-center justify-between w-full px-4 py-3 bg-slate-900/90 border border-t-0 border-slate-800 rounded-b-xl touch-none">
        <div className="flex gap-2">
          <button
            onTouchStart={handleTouch('left', true)}
            onTouchEnd={handleTouch('left', false)}
            onMouseDown={handleTouch('left', true)}
            onMouseUp={handleTouch('left', false)}
            className="w-14 h-12 bg-slate-800 active:bg-cyan-600 border border-slate-700 rounded-xl text-xl font-bold text-slate-200 flex items-center justify-center"
            aria-label="Left"
          >
            ◀
          </button>
          <button
            onTouchStart={handleTouch('right', true)}
            onTouchEnd={handleTouch('right', false)}
            onMouseDown={handleTouch('right', true)}
            onMouseUp={handleTouch('right', false)}
            className="w-14 h-12 bg-slate-800 active:bg-cyan-600 border border-slate-700 rounded-xl text-xl font-bold text-slate-200 flex items-center justify-center"
            aria-label="Right"
          >
            ▶
          </button>
        </div>
        <button
          onTouchStart={handleTouch('jump', true)}
          onTouchEnd={handleTouch('jump', false)}
          onMouseDown={handleTouch('jump', true)}
          onMouseUp={handleTouch('jump', false)}
          className="w-20 h-12 bg-cyan-600 active:bg-cyan-500 border border-cyan-400/40 rounded-xl text-base font-bold text-white flex items-center justify-center shadow-lg shadow-cyan-950/50"
          aria-label="Jump"
        >
          JUMP ▲
        </button>
      </div>

      {/* Desktop Keyboard Control Hint */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-xs text-slate-400 pt-2 font-mono">
        <span>Move: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">A / D</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">← →</kbd></span>
        <span>Jump: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">W</kbd></span>
        <span>Pause: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">P / Esc</kbd></span>
        <span>Restart: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-200">R</kbd></span>
      </div>
    </div>
  );
};
