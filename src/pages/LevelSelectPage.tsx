import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GAMES_REGISTRY } from '../data/games.ts';
import { LEVELS as BALLOT_LEVELS } from '../games/ballot-trap/levels.ts';
import { SNAKE_LEVELS } from '../games/snake/levels.ts';
import { MEMORY_LEVELS } from '../games/memory/levels.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useProgress } from '../context/ProgressContext.tsx';
import { sfx } from '../services/audio.ts';
import { ArrowLeft, Play, Lock, Star, Sparkles } from 'lucide-react';

export const LevelSelectPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getGameProgress } = useProgress();
  const lang = user?.preferences.language || 'en';

  const game = GAMES_REGISTRY.find((g) => g.id === gameId || g.slug === gameId);

  if (!game) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-white">Game Not Found</h2>
        <Link to="/games" className="text-cyan-400 text-xs">Return to Games</Link>
      </div>
    );
  }

  const prog = getGameProgress(game.id);

  // Retrieve level definitions based on game
  let levelList: Array<{ id: number; name: string; nameBn: string; subtitle?: string }> = [];
  if (game.id === 'ballot-trap') {
    levelList = BALLOT_LEVELS.map((l) => ({
      id: l.id,
      name: l.name.en,
      nameBn: l.name.bn,
      subtitle: l.intro.en,
    }));
  } else if (game.id === 'snake-evolution') {
    levelList = SNAKE_LEVELS.map((l) => ({
      id: l.id,
      name: l.name,
      nameBn: l.nameBn,
      subtitle: `${l.targetScore} Pts Target`,
    }));
  } else if (game.id === 'memory-match') {
    levelList = MEMORY_LEVELS.map((l) => ({
      id: l.id,
      name: l.name,
      nameBn: l.nameBn,
      subtitle: `${l.pairsCount} Pairs`,
    }));
  }

  const isLevelUnlocked = (idx: number) => {
    if (idx === 0) return true;
    const levelId = levelList[idx].id;
    // Unlocked if highest unlocked level >= levelId or previous level completed
    const prevLevelId = String(levelList[idx - 1].id);
    return prog.highestUnlockedLevel >= levelId || Boolean(prog.completedLevels[prevLevelId]);
  };

  let totalStars = 0;
  Object.values(prog.completedLevels || {}).forEach((lvl) => {
    totalStars += lvl.stars || 0;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            sfx.click();
            navigate(`/games/${game.slug}`);
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Game Details</span>
        </button>

        <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="font-bold text-amber-400">{totalStars}</span>
          <span className="text-slate-500">/ {levelList.length * 3}</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-xl">
          {game.icon}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            {lang === 'bn' ? game.titleBn : game.title} &mdash; Level Select
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Select an unlocked stage to begin your run. Complete earlier stages to unlock higher difficulties.
          </p>
        </div>
      </div>

      {/* Level Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {levelList.map((lvl, idx) => {
          const unlocked = isLevelUnlocked(idx);
          const record = prog.completedLevels[String(lvl.id)];
          const starsEarned = record?.stars || 0;

          return (
            <div
              key={lvl.id}
              className={`relative rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                unlocked
                  ? 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-cyan-500/50 hover:shadow-xl hover:shadow-cyan-950/20 hover:-translate-y-0.5 cursor-pointer'
                  : 'bg-slate-950/40 border-slate-900 opacity-60 cursor-not-allowed'
              }`}
            >
              <div>
                {/* Level Badge & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`w-9 h-9 rounded-xl font-display font-bold text-sm flex items-center justify-center ${
                      unlocked
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {unlocked ? lvl.id : <Lock className="w-4 h-4" />}
                  </span>

                  {/* Stars Display */}
                  <div className="flex gap-1 text-sm">
                    {[0, 1, 2].map((sIdx) => (
                      <span
                        key={sIdx}
                        className={
                          sIdx < starsEarned
                            ? 'text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]'
                            : 'text-slate-700'
                        }
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Level Name */}
                <h3 className="font-display font-bold text-base text-white mb-1">
                  {lang === 'bn' ? lvl.nameBn : lvl.name}
                </h3>
                {lvl.subtitle && (
                  <p className="text-[11px] text-slate-400 line-clamp-1">{lvl.subtitle}</p>
                )}
              </div>

              {/* Bottom stats or locked status */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                {unlocked ? (
                  <>
                    <span className="text-slate-400 text-[11px]">
                      {record ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          <span>{record.score} pts</span>
                        </span>
                      ) : (
                        <span className="text-slate-500">Unplayed</span>
                      )}
                    </span>
                    <Link
                      to={`/play/${game.slug}?level=${idx}`}
                      onClick={() => sfx.click()}
                      className="px-3 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition shadow-md shadow-cyan-950/40 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-white" />
                      <span>Play</span>
                    </Link>
                  </>
                ) : (
                  <span className="text-slate-600 text-[11px] italic">Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
