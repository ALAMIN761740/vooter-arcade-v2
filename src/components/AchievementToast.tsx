import React from 'react';
import { useProgress } from '../context/ProgressContext.tsx';
import { X } from 'lucide-react';

export const AchievementToast: React.FC = () => {
  const { recentNotification, dismissNotification } = useProgress();

  if (!recentNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl shadow-amber-950/50 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
          {recentNotification.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
            Achievement Unlocked!
          </div>
          <div className="font-display font-bold text-sm text-white truncate">
            {recentNotification.title}
          </div>
          <div className="text-xs text-slate-300 line-clamp-2 mt-0.5">
            {recentNotification.desc}
          </div>
        </div>
        <button
          onClick={dismissNotification}
          className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
