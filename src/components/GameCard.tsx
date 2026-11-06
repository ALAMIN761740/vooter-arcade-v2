import React from 'react';
import { Link } from 'react-router-dom';
import { GameInfo } from '../types/index.ts';
import { useProgress } from '../context/ProgressContext.tsx';
import { sfx } from '../services/audio.ts';
import { Play, Star, Layers, Sparkles } from 'lucide-react';

export const GameCard: React.FC<{ game: GameInfo; lang?: 'en' | 'bn' }> = ({ game, lang = 'en' }) => {
  const { getGameProgress } = useProgress();
  const prog = getGameProgress(game.id);

  const completedCount = Object.keys(prog.completedLevels || {}).length;
  let totalStars = 0;
  Object.values(prog.completedLevels || {}).forEach((lvl) => {
    totalStars += lvl.stars || 0;
  });

  const difficultyColors = {
    Casual: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    Medium: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    Hardcore: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    Troll: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  };

  return (
    <div className="group relative flex flex-col bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/30">
      {/* Visual Header / Banner */}
      <div className={`relative h-44 w-full bg-gradient-to-br ${game.thumbnailGradient} p-5 flex flex-col justify-between overflow-hidden`}>
        {/* Ambient overlay */}
        <div className="absolute inset-0 bg-slate-950/30 backdrop-blur-[1px]" />
        
        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-black/40 text-white backdrop-blur-md border border-white/10">
            {game.category}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg border backdrop-blur-md ${difficultyColors[game.difficulty]}`}>
            {game.difficulty}
          </span>
        </div>

        {/* Center Hero Icon */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-xl group-hover:scale-110 transition-transform">
            {game.icon}
          </div>
          <div>
            <h3 className="font-display font-bold text-xl text-white tracking-wide drop-shadow-md">
              {lang === 'bn' ? game.titleBn : game.title}
            </h3>
            <div className="text-xs text-white/80 font-medium">
              {game.levelCount} Challenging Stages
            </div>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
            {lang === 'bn' ? game.subtitleBn : game.subtitle}
          </p>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            {game.badges.slice(0, 3).map((badge) => (
              <span
                key={badge}
                className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* Player Progress Mini Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1" title="Levels Completed">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>{completedCount}/{game.levelCount}</span>
            </span>
            <span className="flex items-center gap-1 text-amber-400" title="Stars Collected">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{totalStars}</span>
            </span>
          </div>

          {prog.bestScore > 0 && (
            <div className="flex items-center gap-1 text-emerald-400 text-[11px]" title="Best Score">
              <Sparkles className="w-3 h-3" />
              <span>{prog.bestScore}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Link
            to={`/games/${game.slug}`}
            onClick={() => sfx.click()}
            className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold text-center transition border border-slate-700/60 hover:text-white"
          >
            Details & Levels
          </Link>
          <Link
            to={`/play/${game.slug}`}
            onClick={() => sfx.click()}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold text-center transition shadow-lg shadow-cyan-950/40 hover:shadow-cyan-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Play Now</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
