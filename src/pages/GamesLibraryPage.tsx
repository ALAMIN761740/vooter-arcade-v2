import React, { useState, useMemo } from 'react';
import { GAMES_REGISTRY } from '../data/games.ts';
import { GameCard } from '../components/GameCard.tsx';
import { GameCategory, GameDifficulty } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { sfx } from '../services/audio.ts';
import { Search, Filter, Gamepad2 } from 'lucide-react';

export const GamesLibraryPage: React.FC = () => {
  const { user } = useAuth();
  const lang = user?.preferences.language || 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | 'All'>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<GameDifficulty | 'All'>('All');

  const categories: Array<GameCategory | 'All'> = ['All', 'Platformer', 'Arcade', 'Puzzle'];
  const difficulties: Array<GameDifficulty | 'All'> = ['All', 'Casual', 'Medium', 'Hardcore', 'Troll'];

  const filteredGames = useMemo(() => {
    return GAMES_REGISTRY.filter((game) => {
      const matchSearch =
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.titleBn.includes(searchQuery) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.badges.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'All' || game.category === selectedCategory;
      const matchDifficulty = selectedDifficulty === 'All' || game.difficulty === selectedDifficulty;

      return matchSearch && matchCategory && matchDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-cyan-400 mb-1">
          <Gamepad2 className="w-4 h-4" />
          <span>Central Game Library</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-white">
          Games Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
          Browse and play all games on Vooter Arcade. Every game features independent physics, levels, scoring, and cloud synchronization.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search games, tags, mechanics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sfx.click();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700/80 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as GameDifficulty | 'All')}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              {difficulties.map((d) => (
                <option key={d} value={d} className="bg-slate-900 text-white">
                  {d === 'All' ? 'All Difficulties' : d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} lang={lang} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
          <div className="text-3xl">🔍</div>
          <h3 className="font-display font-bold text-lg text-white">No Games Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or reset your category/difficulty filters to find available games.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setSelectedDifficulty('All');
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl font-medium cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
