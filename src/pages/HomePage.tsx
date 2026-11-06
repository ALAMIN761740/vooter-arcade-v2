import React from 'react';
import { Link } from 'react-router-dom';
import { GAMES_REGISTRY } from '../data/games.ts';
import { GameCard } from '../components/GameCard.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useProgress } from '../context/ProgressContext.tsx';
import { sfx } from '../services/audio.ts';
import { Play, Trophy, Sparkles, Smartphone, ShieldCheck, Zap } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const { getTotalScore, getTotalStars, getTotalLevelsCompleted } = useProgress();
  const lang = user?.preferences.language || 'en';

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-900 bg-gradient-to-b from-[#080d1a] via-[#090b14] to-[#07090e]">
        {/* Ambient background glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-cyan-950/40 animate-glow">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>One Platform. Multiple Games. Endless Fun.</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-none">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">Vooter Arcade</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The ultimate home for satirical troll platformers, reflex arcades, and mind-bending puzzle challenges. Play instantly in your browser on desktop or mobile.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              to="/play/ballot-trap"
              onClick={() => sfx.click()}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-950/60 hover:shadow-cyan-500/20 transition-all hover:scale-102 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Play Ballot Trap (ভোটের ফাঁদ)</span>
            </Link>

            <Link
              to="/games"
              onClick={() => sfx.click()}
              className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 transition cursor-pointer"
            >
              Explore All 3 Games
            </Link>
          </div>

          {/* Platform Stat Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto pt-10 font-mono">
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-cyan-400">3</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Independent Games</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-purple-400">18+</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Handcrafted Stages</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-amber-400">{getTotalStars()}</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Stars Earned</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-3.5 rounded-xl backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">{getTotalScore()}</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Career Points</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-cyan-400 tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Featured Arcades</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Choose Your Next Challenge
            </h2>
          </div>
          <Link
            to="/games"
            onClick={() => sfx.click()}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View Games Library</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Game Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GAMES_REGISTRY.map((game) => (
            <GameCard key={game.id} game={game} lang={lang} />
          ))}
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-16 bg-[#060810] border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
              Engineered for Modern Web Gaming
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              No bloated downloads, no ads, no delays. Instant 60fps simulation straight in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-3">
                <Play className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">60fps HTML5 Canvas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hardware-accelerated rendering decoupled from React re-renders for butter-smooth physics.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Google & Supabase Auth</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log in with your Google account to automatically synchronize high scores and level progress across devices.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Mobile Touch First</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Virtual D-Pads and touch gestures designed to prevent browser scroll conflicts on smartphones and tablets.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Global Leaderboards</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Compete against players worldwide on all-time and weekly rankings across every game.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
