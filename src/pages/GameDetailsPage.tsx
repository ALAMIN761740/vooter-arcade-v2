import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { GAMES_REGISTRY } from '../data/games.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useProgress } from '../context/ProgressContext.tsx';
import { sfx } from '../services/audio.ts';
import {
  ArrowLeft,
  Play,
  Star,
  Layers,
  Keyboard,
  Smartphone,
  CheckCircle,
  Trophy,
} from 'lucide-react';

export const GameDetailsPage: React.FC = () => {
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
        <p className="text-xs text-slate-400">The game you requested does not exist in the registry.</p>
        <Link
          to="/games"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games Library</span>
        </Link>
      </div>
    );
  }

  const prog = getGameProgress(game.id);
  const completedCount = Object.keys(prog.completedLevels || {}).length;
  let totalStars = 0;
  Object.values(prog.completedLevels || {}).forEach((lvl) => {
    totalStars += lvl.stars || 0;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Back Button */}
      <button
        onClick={() => {
          sfx.click();
          navigate('/games');
        }}
        className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Games Library</span>
      </button>

      {/* Hero Header Card */}
      <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${game.thumbnailGradient} p-6 sm:p-10 border border-white/10 shadow-2xl`}>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-black/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-4xl sm:text-5xl shadow-2xl">
              {game.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20">
                  {game.category}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/40 text-cyan-300 backdrop-blur-md border border-cyan-400/30">
                  {game.difficulty} Difficulty
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
                {lang === 'bn' ? game.titleBn : game.title}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 font-medium mt-1">
                {lang === 'bn' ? game.subtitleBn : game.subtitle}
              </p>
            </div>
          </div>

          {/* Quick Play CTA */}
          <div className="flex flex-col gap-2 shrink-0">
            <Link
              to={`/play/${game.slug}`}
              onClick={() => sfx.click()}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm shadow-xl transition-all hover:scale-102 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Play Now</span>
            </Link>
            <Link
              to={`/levels/${game.slug}`}
              onClick={() => sfx.click()}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-black/30 hover:bg-black/50 text-white text-xs font-semibold border border-white/20 transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Select Level (1-{game.levelCount})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Description & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details & Controls */}
        <div className="md:col-span-2 space-y-6">
          {/* Game Description */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-base font-display font-bold text-white">About the Game</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lang === 'bn' ? game.descriptionBn : game.description}
            </p>
          </div>

          {/* Key Features */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-base font-display font-bold text-white">Key Features</h3>
            <ul className="space-y-2">
              {game.features.map((feat) => (
                <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Controls Guide */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-display font-bold text-white">Controls Guide</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <Keyboard className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Desktop Keyboard</div>
                  <div className="text-xs text-slate-300 font-mono mt-0.5">{game.controls.desktop}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <Smartphone className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-white">Mobile Touch</div>
                  <div className="text-xs text-slate-300 font-mono mt-0.5">{game.controls.mobile}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Career Stats Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Your Career Stats</span>
            </h3>

            <div className="space-y-3 font-mono">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <span className="text-xs text-slate-400">Levels Cleared</span>
                <span className="text-sm font-bold text-cyan-400">
                  {completedCount} / {game.levelCount}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <span className="text-xs text-slate-400">Stars Collected</span>
                <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{totalStars} / {game.levelCount * 3}</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-800">
                <span className="text-xs text-slate-400">Highest Score</span>
                <span className="text-sm font-bold text-emerald-400">
                  {prog.bestScore} pts
                </span>
              </div>
            </div>

            <Link
              to={`/levels/${game.slug}`}
              onClick={() => sfx.click()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-cyan-950/40"
            >
              <span>View Level Select</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
