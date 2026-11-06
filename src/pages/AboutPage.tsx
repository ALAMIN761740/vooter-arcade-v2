import React from 'react';
import { Link } from 'react-router-dom';
import { sfx } from '../services/audio.ts';
import { Shield, Sparkles, Code, Heart, Gamepad2, Play } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-10">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-3xl mx-auto shadow-xl">
          🗳️
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
          About Vooter Arcade
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          The story, technical philosophy, and cultural homage behind the multi-game platform.
        </p>
      </div>

      {/* Story & Cultural Context */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <span>📜</span> The Story of Ballot Trap (ভোটের ফাঁদ)
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          <strong>Vooter Faand (Ballot Trap)</strong> was conceived as a lighthearted, witty troll-platformer inspired by the vibrant election festivities, campaign megaphone broadcasts, bridge promises, and unpredictable hurdles of South Asian political folklore.
        </p>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          From crumbling bridges that only existed on paper, to pop-up development spikes, fleeing ballot boxes that run away from voters, and sudden power load-sheddings, every level is handcrafted to provide comedic trial-and-error gameplay.
        </p>
        <div className="p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 text-xs text-slate-400 italic">
          Disclaimer: This project is a fictional satirical game. It has no connection to any real-world person, political organization, or government body.
        </div>
      </div>

      {/* Evolution into Vooter Arcade */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <span>The Evolution into Vooter Arcade</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          What started as a single browser game has now expanded into a modular multi-game arcade platform supporting:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="text-2xl mb-1.5">🗳️</div>
            <div className="font-bold text-white mb-1">Ballot Trap</div>
            <div className="text-slate-400">8 satirical platformer levels with troll physics & death quotes.</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="text-2xl mb-1.5">🐍</div>
            <div className="font-bold text-white mb-1">Snake Evolution</div>
            <div className="text-slate-400">Cyberpunk arcade snake with Ghost and Speed boost powerups.</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="text-2xl mb-1.5">🃏</div>
            <div className="font-bold text-white mb-1">Memory Match</div>
            <div className="text-slate-400">Mind-training pair puzzle with Arcade, Election, and Cyber decks.</div>
          </div>
        </div>
      </div>

      {/* Tech Architecture */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <Code className="w-5 h-5 text-purple-400" />
          <span>Architecture & Reliability</span>
        </h2>
        <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
          <li className="flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Supabase Authentication & Row Level Security: </strong>
              Google OAuth login and secure PostgreSQL storage with RLS policies guaranteeing players only edit their own progress.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <Gamepad2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Decoupled Game Loop: </strong>
              Simulations run on fixed 60Hz physics timesteps completely isolated from React DOM rendering.
            </div>
          </li>
          <li className="flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Zero Asset Bloat: </strong>
              All sound effects are synthetically produced in real-time via the browser&apos;s WebAudio API.
            </div>
          </li>
        </ul>
      </div>

      {/* CTA Button */}
      <div className="text-center pt-4">
        <Link
          to="/games"
          onClick={() => sfx.click()}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm shadow-xl shadow-cyan-950/60 transition cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Jump Into the Arcade</span>
        </Link>
      </div>
    </div>
  );
};
