import React, { useState, useEffect } from 'react';
import { useProgress } from '../context/ProgressContext.tsx';
import { LeaderboardEntry } from '../types/index.ts';
import { sfx } from '../services/audio.ts';
import { Trophy, Medal, Flame, Calendar, Crown, Sparkles, Filter } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const { getLeaderboard } = useProgress();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filterGame, setFilterGame] = useState<string>('global');
  const [filterTime, setFilterTime] = useState<'all' | 'weekly'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function fetchScores() {
      setIsLoading(true);
      const data = await getLeaderboard(filterGame);
      if (mounted) {
        setEntries(data);
        setIsLoading(false);
      }
    }
    fetchScores();
    return () => {
      mounted = false;
    };
  }, [filterGame, getLeaderboard]);

  const topThree = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Hall of Fame</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
          Arcade Leaderboards
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Rankings updated in real time. Climb the ranks by clearing stages, collecting all 3 ballots, and scoring high combo streaks.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Game Filters */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'global', label: 'Global Ranking' },
            { id: 'ballot-trap', label: 'Ballot Trap' },
            { id: 'snake-evolution', label: 'Snake' },
            { id: 'memory-match', label: 'Memory' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sfx.click();
                setFilterGame(item.id);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer whitespace-nowrap ${
                filterGame === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Time Window */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
          <button
            onClick={() => {
              sfx.click();
              setFilterTime('all');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterTime === 'all'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>All-Time</span>
          </button>
          <button
            onClick={() => {
              sfx.click();
              setFilterTime('weekly');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filterTime === 'weekly'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Weekly</span>
          </button>
        </div>
      </div>

      {/* Top 3 Podium (Visual Showcase) */}
      {!isLoading && topThree.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 max-w-4xl mx-auto items-end">
          {/* Rank 2 (Silver) */}
          <div className="order-2 md:order-1 p-6 rounded-3xl bg-slate-900/80 border border-slate-700 flex flex-col items-center text-center shadow-xl space-y-3">
            <div className="relative">
              <img
                src={topThree[1].avatarUrl}
                alt={topThree[1].username}
                className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-slate-400 object-cover"
              />
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-slate-300 text-slate-950 font-display font-extrabold text-xs flex items-center justify-center border-2 border-slate-900">
                #2
              </span>
            </div>
            <div>
              <div className="font-display font-bold text-base text-white truncate max-w-[150px]">
                {topThree[1].username}
              </div>
              <div className="text-sm font-mono font-bold text-slate-300 mt-0.5">
                {topThree[1].score} pts
              </div>
            </div>
          </div>

          {/* Rank 1 (Gold - Center Monument) */}
          <div className="order-1 md:order-2 p-8 rounded-3xl bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-900 border-2 border-amber-500/50 flex flex-col items-center text-center shadow-2xl shadow-amber-950/50 space-y-3 scale-105 z-10">
            <div className="relative">
              <Crown className="w-6 h-6 text-amber-400 absolute -top-7 left-1/2 -translate-x-1/2 animate-bounce" />
              <img
                src={topThree[0].avatarUrl}
                alt={topThree[0].username}
                className="w-20 h-20 rounded-2xl bg-slate-800 border-2 border-amber-400 object-cover shadow-lg shadow-amber-500/20"
              />
              <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-display font-extrabold text-sm flex items-center justify-center border-2 border-slate-900">
                #1
              </span>
            </div>
            <div>
              <div className="font-display font-extrabold text-lg text-amber-300 truncate max-w-[180px]">
                {topThree[0].username}
              </div>
              <div className="text-base font-mono font-bold text-amber-400 mt-0.5">
                {topThree[0].score} pts
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">
                {topThree[0].levelsCompleted} Levels &bull; ★ {topThree[0].stars}
              </div>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="order-3 md:order-3 p-6 rounded-3xl bg-slate-900/80 border border-slate-700/80 flex flex-col items-center text-center shadow-xl space-y-3">
            <div className="relative">
              <img
                src={topThree[2].avatarUrl}
                alt={topThree[2].username}
                className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-amber-700 object-cover"
              />
              <span className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-amber-700 text-white font-display font-extrabold text-xs flex items-center justify-center border-2 border-slate-900">
                #3
              </span>
            </div>
            <div>
              <div className="font-display font-bold text-base text-white truncate max-w-[150px]">
                {topThree[2].username}
              </div>
              <div className="text-sm font-mono font-bold text-amber-600 mt-0.5">
                {topThree[2].score} pts
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ranked Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="w-16">Rank</div>
          <div className="flex-1">Player</div>
          <div className="w-24 text-right">Stages</div>
          <div className="w-24 text-right">Stars</div>
          <div className="w-28 text-right font-bold text-slate-300">Total Score</div>
        </div>

        <div className="divide-y divide-slate-800/60">
          {entries.map((entry, idx) => (
            <div
              key={entry.id + idx}
              className={`px-6 py-3.5 flex items-center justify-between text-xs transition ${
                entry.id === 'current_user'
                  ? 'bg-cyan-500/10 border-l-4 border-cyan-400'
                  : 'hover:bg-slate-850/50'
              }`}
            >
              <div className="w-16 font-display font-bold text-sm text-slate-400">
                {entry.rank === 1 ? (
                  <span className="text-amber-400 font-bold">🥇 #1</span>
                ) : entry.rank === 2 ? (
                  <span className="text-slate-300 font-bold">🥈 #2</span>
                ) : entry.rank === 3 ? (
                  <span className="text-amber-600 font-bold">🥉 #3</span>
                ) : (
                  <span>#{entry.rank}</span>
                )}
              </div>

              <div className="flex-1 flex items-center gap-3">
                <img
                  src={entry.avatarUrl}
                  alt={entry.username}
                  className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 object-cover"
                />
                <span className="font-semibold text-slate-200">
                  {entry.username}
                </span>
              </div>

              <div className="w-24 text-right font-mono text-slate-400">
                {entry.levelsCompleted}
              </div>

              <div className="w-24 text-right font-mono text-amber-400">
                ★ {entry.stars}
              </div>

              <div className="w-28 text-right font-mono font-bold text-cyan-400 text-sm">
                {entry.score}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
