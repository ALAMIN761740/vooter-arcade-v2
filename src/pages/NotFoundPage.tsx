import React from 'react';
import { Link } from 'react-router-dom';
import { sfx } from '../services/audio.ts';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-4 p-8 rounded-3xl bg-slate-900/60 border border-slate-800">
        <div className="text-5xl">💀</div>
        <h1 className="text-3xl font-display font-extrabold text-white">404: Level Not Found</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          Looks like you stumbled upon a trapdoor or an unmapped polling center.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            onClick={() => sfx.click()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-cyan-950/50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Arcade Lobby</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
