import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useProgress } from '../context/ProgressContext.tsx';
import { GAMES_REGISTRY, ACHIEVEMENTS_REGISTRY } from '../data/games.ts';
import { saveSupabaseConfig, SUPABASE_SETUP_SQL, isSupabaseConnected } from '../services/supabase.ts';
import { sfx } from '../services/audio.ts';
import {
  User,
  Gamepad2,
  Trophy,
  Award,
  Settings,
  Layers,
  Star,
  Zap,
  Cloud,
  CloudCheck,
  CheckCircle,
  Copy,
  ExternalLink,
  RotateCcw,
  Volume2,
  VolumeX,
  Globe,
  LogIn,
  Play,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isGuest, updatePreferences, updateProfileName, signOut } = useAuth();
  const {
    progress,
    achievements,
    getTotalScore,
    getTotalStars,
    getTotalLevelsCompleted,
    getUnlockedAchievementsCount,
    migrateGuestProgressToCloud,
    resetAllProgress,
    syncStatus,
  } = useProgress();

  const activeTab = searchParams.get('tab') || 'overview';
  const setTab = (tab: string) => {
    sfx.click();
    setSearchParams({ tab });
  };

  // Profile Edit State
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [profileSaved, setProfileSaved] = useState(false);

  // Supabase Setup State
  const [supabaseUrl, setSupabaseUrl] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('vooter_supabase_url') || '' : ''
  );
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('vooter_supabase_anon_key') || '' : ''
  );
  const [supabaseSaved, setSupabaseSaved] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');

  useEffect(() => {
    if (user) {
      setEditUsername(user.username);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    sfx.click();
    if (editUsername.trim()) {
      await updateProfileName(editUsername.trim());
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    sfx.click();
    saveSupabaseConfig(supabaseUrl, supabaseAnonKey);
    setSupabaseSaved(true);
    setTimeout(() => setSupabaseSaved(false), 2500);
  };

  const handleCopySql = () => {
    sfx.click();
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleMigrate = async () => {
    sfx.click();
    setMigrationStatus('running');
    const ok = await migrateGuestProgressToCloud();
    setMigrationStatus(ok ? 'success' : 'failed');
  };

  const handleReset = () => {
    sfx.click();
    if (window.confirm('Are you sure you want to reset all game progress? This cannot be undone.')) {
      resetAllProgress();
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-white">Guest Session Loading</h2>
        <p className="text-xs text-slate-400">Loading your player dashboard...</p>
      </div>
    );
  }

  const lang = user.preferences.language || 'en';
  const totalStars = getTotalStars();
  const totalScore = getTotalScore();
  const totalLevels = getTotalLevelsCompleted();
  const unlockedAchCount = getUnlockedAchievementsCount();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'my-games', label: 'My Games', icon: Gamepad2 },
    { id: 'progress', label: 'Game Progress', icon: Layers },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Account Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Profile Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={user.avatar_url}
              alt={user.username}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-800 border-2 border-cyan-500/40 object-cover shadow-xl"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  {user.username}
                </h1>
                {isGuest ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Guest Account
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-cyan-400" />
                    Verified Player
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono">{user.email}</p>
              <div className="text-[11px] text-slate-500 mt-1">
                Joined: {new Date(user.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Guest Upgrade Prompt */}
          {isGuest && (
            <div className="flex flex-col sm:items-end gap-2 shrink-0">
              <Link
                to="/login"
                onClick={() => sfx.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Link Google Account</span>
              </Link>
              <span className="text-[10px] text-slate-400">
                Retain all stars & scores in Google Cloud
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase">Career Score</span>
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-cyan-400">{totalScore}</div>
              <div className="text-[10px] text-slate-500 mt-1">Across all 3 games</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase">Stars Collected</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-amber-400">{totalStars}</div>
              <div className="text-[10px] text-slate-500 mt-1">Total stars earned</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase">Stages Cleared</span>
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400">{totalLevels}</div>
              <div className="text-[10px] text-slate-500 mt-1">Unique levels won</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs uppercase">Achievements</span>
                <Award className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                {unlockedAchCount} / {ACHIEVEMENTS_REGISTRY.length}
              </div>
              <div className="text-[10px] text-slate-500 mt-1">Milestones unlocked</div>
            </div>
          </div>

          {/* Quick Resume Carousel */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-cyan-400" />
              <span>Resume Playing</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {GAMES_REGISTRY.map((game) => {
                const gProg = progress[game.id];
                const completedLevels = Object.keys(gProg?.completedLevels || {}).length;
                return (
                  <div
                    key={game.id}
                    className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{game.icon}</div>
                      <div>
                        <div className="font-display font-bold text-sm text-white">
                          {lang === 'bn' ? game.titleBn : game.title}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {completedLevels} of {game.levelCount} levels beat
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-xs font-mono text-emerald-400">
                        Best: {gProg?.bestScore || 0} pts
                      </span>
                      <Link
                        to={`/play/${game.slug}`}
                        onClick={() => sfx.click()}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow-md shadow-cyan-950/40"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Play</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MY GAMES */}
      {activeTab === 'my-games' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GAMES_REGISTRY.map((game) => {
              const gProg = progress[game.id];
              const completedCount = Object.keys(gProg?.completedLevels || {}).length;
              let gameStars = 0;
              Object.values(gProg?.completedLevels || {}).forEach((lvl) => {
                gameStars += lvl.stars || 0;
              });

              return (
                <div
                  key={game.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col justify-between"
                >
                  <div className={`p-5 bg-gradient-to-br ${game.thumbnailGradient}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{game.icon}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black/40 text-white backdrop-blur-md">
                        {game.category}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-lg text-white">
                      {lang === 'bn' ? game.titleBn : game.title}
                    </h3>
                  </div>

                  <div className="p-5 space-y-4 font-mono text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Levels Unlocked:</span>
                      <span className="font-bold text-cyan-400">
                        {gProg?.highestUnlockedLevel || 1} / {game.levelCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Completed Levels:</span>
                      <span className="font-bold text-emerald-400">
                        {completedCount} / {game.levelCount}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Stars Earned:</span>
                      <span className="font-bold text-amber-400">
                        ★ {gameStars} / {game.levelCount * 3}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>High Score:</span>
                      <span className="font-bold text-white">{gProg?.bestScore || 0} pts</span>
                    </div>

                    <div className="pt-2">
                      <Link
                        to={`/levels/${game.slug}`}
                        onClick={() => sfx.click()}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition cursor-pointer shadow-lg shadow-cyan-950/40"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>View Level Grid</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GAME PROGRESS */}
      {activeTab === 'progress' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="text-xs text-slate-400">
            Detailed log of all individual level completions, deaths, record times, and star ratings.
          </div>
          {GAMES_REGISTRY.map((game) => {
            const gProg = progress[game.id];
            const records = Object.values(gProg?.completedLevels || {});

            return (
              <div
                key={game.id}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{game.icon}</span>
                  <div>
                    <h3 className="font-display font-bold text-base text-white">
                      {lang === 'bn' ? game.titleBn : game.title}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono">
                      {records.length} stages recorded
                    </div>
                  </div>
                </div>

                {records.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {records.map((rec) => (
                      <div
                        key={String(rec.levelId)}
                        className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 font-mono text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-400">Level {rec.levelId}</span>
                          <span className="text-amber-400">{'★'.repeat(rec.stars)}</span>
                        </div>
                        <div className="text-slate-300">Score: {rec.score} pts</div>
                        <div className="text-slate-400 text-[11px]">Deaths: {rec.deaths}</div>
                        <div className="text-slate-400 text-[11px]">Time: {rec.timeSeconds}s</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400 italic">
                    No completed levels recorded for this game yet. Play a level to log your progress!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-display font-bold text-white">Platform Achievements</h3>
              <p className="text-xs text-slate-400">
                Unlock achievements as you conquer traps, master snake speed, and match memory cards.
              </p>
            </div>
            <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {unlockedAchCount} / {ACHIEVEMENTS_REGISTRY.length} Unlocked
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACHIEVEMENTS_REGISTRY.map((ach) => {
              const userAch = achievements[ach.id];
              const isUnlocked = Boolean(userAch?.unlockedAt);

              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition flex items-start gap-3.5 ${
                    isUnlocked
                      ? 'bg-slate-900/90 border-purple-500/40 shadow-lg shadow-purple-950/20'
                      : 'bg-slate-950/40 border-slate-850 opacity-60'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                      isUnlocked
                        ? 'bg-purple-500/20 border border-purple-500/40'
                        : 'bg-slate-800 border border-slate-700 grayscale'
                    }`}
                  >
                    {ach.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-display font-bold text-sm text-white truncate">
                        {lang === 'bn' ? ach.titleBn : ach.title}
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                        +{ach.xpReward} XP
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {lang === 'bn' ? ach.descriptionBn : ach.description}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-2">
                      {isUnlocked ? (
                        <span className="text-emerald-400">
                          Unlocked on {new Date(userAch.unlockedAt!).toLocaleDateString()}
                        </span>
                      ) : (
                        <span>Locked</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ACCOUNT SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-8 max-w-3xl animate-in fade-in duration-200">
          {/* Section: Profile Info */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <User className="w-4 h-4 text-cyan-400" />
              <span>Player Profile</span>
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs transition cursor-pointer"
                >
                  Save Profile
                </button>
                {profileSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Saved!
                  </span>
                )}
              </div>
            </form>
          </div>

          {/* Section: Supabase Cloud Sync Configuration */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Supabase Cloud Database & Auth Configuration</span>
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  isSupabaseConnected()
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {isSupabaseConnected() ? 'Connected' : 'Offline Storage'}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Connect your Supabase project to enable persistent Google OAuth authentication and cross-device cloud game saves. You can enter your Project URL and Anon Public Key below:
            </p>

            <form onSubmit={handleSaveSupabase} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-[11px] font-sans font-medium text-slate-300 mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-project.supabase.co"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-sans font-medium text-slate-300 mb-1">
                  Supabase Anon Public API Key
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-sans font-bold text-xs transition cursor-pointer"
                >
                  Save Supabase Keys
                </button>
                {supabaseSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-sans">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Credentials Saved!
                  </span>
                )}
              </div>
            </form>

            {/* Supabase Schema SQL Script */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span>Database Tables & RLS Policies SQL Script</span>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Paste and run this script inside your Supabase dashboard SQL Editor to create the <code>profiles</code>, <code>game_progress</code>, <code>game_scores</code>, and <code>achievements</code> tables with Row Level Security.
              </p>
              <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[10px] text-slate-400 overflow-x-auto max-h-40">
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>

            {/* Guest Progress Cloud Migration */}
            {!isGuest && (
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">Sync Local Progress to Cloud</div>
                  <div className="text-[11px] text-slate-400">
                    Upload any locally cached stars, scores, and achievements to your Supabase account.
                  </div>
                </div>
                <button
                  onClick={handleMigrate}
                  disabled={migrationStatus === 'running'}
                  className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg cursor-pointer transition disabled:opacity-50"
                >
                  {migrationStatus === 'running'
                    ? 'Syncing...'
                    : migrationStatus === 'success'
                    ? 'Synced!'
                    : 'Sync Now'}
                </button>
              </div>
            )}
          </div>

          {/* Section: Audio & Language Preferences */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-display font-bold text-white">Preferences</h3>

            <div className="flex items-center justify-between py-2 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-white">Audio Sound Effects</div>
                <div className="text-[11px] text-slate-400">Procedural WebAudio sound synth</div>
              </div>
              <button
                onClick={() => updatePreferences({ soundMuted: !user.preferences.soundMuted })}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
              >
                {user.preferences.soundMuted ? 'Muted' : 'Enabled'}
              </button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-xs font-bold text-white">Platform Language</div>
                <div className="text-[11px] text-slate-400">English / বাংলা</div>
              </div>
              <button
                onClick={() =>
                  updatePreferences({ language: user.preferences.language === 'en' ? 'bn' : 'en' })
                }
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
              >
                {user.preferences.language === 'en' ? 'Switch to বাংলা' : 'Switch to English'}
              </button>
            </div>
          </div>

          {/* Section: Danger Zone (Reset Progress) */}
          <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
            <h3 className="text-base font-display font-bold text-rose-400">Danger Zone</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reset all local game progress, cleared levels, and unlocked achievements on this device.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer transition"
              >
                Reset All Progress
              </button>
              {!isGuest && (
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
