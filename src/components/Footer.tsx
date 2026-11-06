import React from 'react';
import { Link } from 'react-router-dom';
import { sfx } from '../services/audio.ts';
import { Gamepad2, Shield, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#05070e] border-t border-slate-900 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗳️</span>
              <span className="font-display font-bold text-lg text-white">VOOTER ARCADE</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              One Platform. Multiple Games. Endless Fun. A premier browser arcade built with responsive HTML5 Canvas engines, procedural WebAudio, and cross-device cloud persistence.
            </p>
            <p className="text-[11px] text-slate-500 italic max-w-sm">
              Note: &ldquo;Ballot Trap&rdquo; (ভোটের ফাঁদ) is an entirely fictional satirical parody. It has no connection to any actual person, political party, or real-world election.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <div className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">
              Platform
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link to="/games" onClick={() => sfx.click()} className="hover:text-cyan-400 transition">
                  Games Library
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" onClick={() => sfx.click()} className="hover:text-cyan-400 transition">
                  Global Leaderboards
                </Link>
              </li>
              <li>
                <Link to="/dashboard" onClick={() => sfx.click()} className="hover:text-cyan-400 transition">
                  Player Dashboard
                </Link>
              </li>
              <li>
                <Link to="/about" onClick={() => sfx.click()} className="hover:text-cyan-400 transition">
                  About & Lore
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech & Cloud Status */}
          <div className="space-y-2">
            <div className="text-xs font-bold font-display uppercase tracking-wider text-slate-300">
              Technology
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>React + Vite 60fps</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Supabase PostgreSQL</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Zero Slop / Instant Load</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div>
            &copy; {new Date().getFullYear()} Vooter Arcade. Designed for endless browser gaming.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-slate-400 transition">Disclaimer</Link>
            <span>&bull;</span>
            <Link to="/dashboard?tab=settings" className="hover:text-slate-400 transition">Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
