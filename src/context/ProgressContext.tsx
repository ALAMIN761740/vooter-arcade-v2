import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { GameProgressRecord, LevelRecord, LeaderboardEntry, UserAchievement } from '../types/index.ts';
import { ACHIEVEMENTS_REGISTRY, GAMES_REGISTRY } from '../data/games.ts';
import { useAuth } from './AuthContext.tsx';
import { getSupabase } from '../services/supabase.ts';
import { sfx } from '../services/audio.ts';

interface ProgressContextType {
  progress: Record<string, GameProgressRecord>;
  achievements: Record<string, UserAchievement>;
  recentNotification: { title: string; desc: string; icon: string } | null;
  syncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  recordLevelComplete: (
    gameId: string,
    levelId: number | string,
    stats: { stars: number; score: number; deaths: number; timeSeconds: number }
  ) => void;
  recordHighScore: (gameId: string, score: number, level?: string) => void;
  getGameProgress: (gameId: string) => GameProgressRecord;
  getTotalStars: () => number;
  getTotalScore: () => number;
  getTotalLevelsCompleted: () => number;
  getUnlockedAchievementsCount: () => number;
  getLeaderboard: (gameId?: string) => Promise<LeaderboardEntry[]>;
  migrateGuestProgressToCloud: () => Promise<boolean>;
  resetAllProgress: () => void;
  dismissNotification: () => void;
}

const LOCAL_PROGRESS_KEY = 'vooter_arcade_progress_v2';
const LOCAL_ACHIEVEMENTS_KEY = 'vooter_arcade_achievements_v2';

function getInitialGameProgress(gameId: string): GameProgressRecord {
  return {
    gameId,
    highestUnlockedLevel: 1,
    completedLevels: {},
    totalScore: 0,
    bestScore: 0,
    lastPlayedAt: new Date().toISOString(),
  };
}

// Generate realistic mock leaderboard entries for demo/offline richness
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', userId: 'u1', username: 'NeonRider', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=NeonRider', gameId: 'global', score: 4820, levelsCompleted: 18, stars: 42, updatedAt: '2025-02-28' },
  { id: '2', userId: 'u2', username: 'PixelMaster', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelMaster', gameId: 'global', score: 4150, levelsCompleted: 16, stars: 39, updatedAt: '2025-03-01' },
  { id: '3', userId: 'u3', username: 'VoterBoss', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=VoterBoss', gameId: 'global', score: 3790, levelsCompleted: 15, stars: 36, updatedAt: '2025-03-02' },
  { id: '4', userId: 'u4', username: 'TrollHunter', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=TrollHunter', gameId: 'global', score: 3240, levelsCompleted: 14, stars: 31, updatedAt: '2025-03-03' },
  { id: '5', userId: 'u5', username: 'CyberSnake', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=CyberSnake', gameId: 'global', score: 2980, levelsCompleted: 12, stars: 28, updatedAt: '2025-03-04' },
  { id: '6', userId: 'u6', username: 'DhakaSpeed', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=DhakaSpeed', gameId: 'global', score: 2650, levelsCompleted: 11, stars: 24, updatedAt: '2025-03-04' },
  { id: '7', userId: 'u7', username: 'MemoryGenius', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=MemoryGenius', gameId: 'global', score: 2310, levelsCompleted: 10, stars: 22, updatedAt: '2025-03-05' },
];

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<string, GameProgressRecord>>({});
  const [achievements, setAchievements] = useState<Record<string, UserAchievement>>({});
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const [recentNotification, setRecentNotification] = useState<{ title: string; desc: string; icon: string } | null>(null);

  // Load progress from localStorage on start
  useEffect(() => {
    try {
      const savedProg = localStorage.getItem(LOCAL_PROGRESS_KEY);
      if (savedProg) {
        setProgress(JSON.parse(savedProg));
      } else {
        const initProg: Record<string, GameProgressRecord> = {};
        GAMES_REGISTRY.forEach((g) => {
          initProg[g.id] = getInitialGameProgress(g.id);
        });
        setProgress(initProg);
        localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(initProg));
      }

      const savedAch = localStorage.getItem(LOCAL_ACHIEVEMENTS_KEY);
      if (savedAch) {
        setAchievements(JSON.parse(savedAch));
      }
    } catch {
      // fallback
    }
  }, []);

  // Sync with Supabase when logged in
  useEffect(() => {
    if (!user || user.is_guest) return;

    let isMounted = true;
    async function loadCloudProgress() {
      const supabase = getSupabase();
      if (!supabase || !user) return;

      setSyncStatus('syncing');
      try {
        const { data: cloudProg } = await supabase
          .from('game_progress')
          .select('*')
          .eq('user_id', user.id);

        if (cloudProg && cloudProg.length > 0 && isMounted) {
          setProgress((prev) => {
            const merged = { ...prev };
            cloudProg.forEach((row) => {
              merged[row.game_id] = {
                gameId: row.game_id,
                highestUnlockedLevel: row.highest_unlocked_level,
                completedLevels: (row.completed_levels as Record<string, LevelRecord>) || {},
                totalScore: row.total_score,
                bestScore: row.best_score,
                lastPlayedAt: row.last_played_at,
              };
            });
            localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(merged));
            return merged;
          });
        }

        const { data: cloudAch } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', user.id);

        if (cloudAch && cloudAch.length > 0 && isMounted) {
          setAchievements((prev) => {
            const merged = { ...prev };
            cloudAch.forEach((row) => {
              merged[row.achievement_key] = {
                achievementId: row.achievement_key,
                currentValue: 1,
                unlockedAt: row.unlocked_at,
              };
            });
            localStorage.setItem(LOCAL_ACHIEVEMENTS_KEY, JSON.stringify(merged));
            return merged;
          });
        }

        if (isMounted) setSyncStatus('synced');
      } catch {
        if (isMounted) setSyncStatus('error');
      }
    }

    loadCloudProgress();
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Achievement unlock checker
  const checkAchievements = useCallback(
    (currentProgress: Record<string, GameProgressRecord>, currentAchievements: Record<string, UserAchievement>) => {
      let totalLevels = 0;
      let totalStars = 0;
      let totalScore = 0;

      Object.values(currentProgress).forEach((p) => {
        totalScore += p.totalScore || 0;
        Object.values(p.completedLevels || {}).forEach((lvl) => {
          totalLevels++;
          totalStars += lvl.stars || 0;
        });
      });

      const updatedAch = { ...currentAchievements };
      let newlyUnlocked: { title: string; desc: string; icon: string } | null = null;

      ACHIEVEMENTS_REGISTRY.forEach((ach) => {
        if (updatedAch[ach.id]?.unlockedAt) return; // already unlocked

        let achieved = false;
        if (ach.id === 'first_game' && totalLevels > 0) achieved = true;
        if (ach.id === 'first_level' && totalLevels >= 1) achieved = true;
        if (ach.id === 'ten_levels' && totalLevels >= 10) achieved = true;
        if (ach.id === 'star_collector' && totalStars >= 15) achieved = true;
        if (ach.id === 'score_1000' && totalScore >= 1000) achieved = true;

        const btProg = currentProgress['ballot-trap'];
        if (ach.id === 'ballot_voter' && Object.keys(btProg?.completedLevels || {}).length >= 3) achieved = true;
        if (ach.id === 'ballot_champion' && Object.keys(btProg?.completedLevels || {}).length >= 8) achieved = true;

        const snakeProg = currentProgress['snake-evolution'];
        if (ach.id === 'snake_50' && (snakeProg?.bestScore || 0) >= 50) achieved = true;
        if (ach.id === 'snake_150' && (snakeProg?.bestScore || 0) >= 150) achieved = true;

        const memProg = currentProgress['memory-match'];
        if (ach.id === 'memory_flawless') {
          const has3Star = Object.values(memProg?.completedLevels || {}).some((l) => l.stars === 3);
          if (has3Star) achieved = true;
        }

        if (achieved) {
          const now = new Date().toISOString();
          updatedAch[ach.id] = {
            achievementId: ach.id,
            currentValue: ach.targetValue,
            unlockedAt: now,
          };
          newlyUnlocked = {
            title: `Achievement Unlocked: ${ach.title}!`,
            desc: ach.description,
            icon: ach.icon,
          };
        }
      });

      if (newlyUnlocked) {
        sfx.unlock();
        setRecentNotification(newlyUnlocked);
        setAchievements(updatedAch);
        localStorage.setItem(LOCAL_ACHIEVEMENTS_KEY, JSON.stringify(updatedAch));

        // Save to Supabase if logged in
        if (user && !user.is_guest) {
          const supabase = getSupabase();
          if (supabase) {
            Object.values(updatedAch).forEach(async (ua) => {
              if (ua.unlockedAt) {
                try {
                  await supabase
                    .from('achievements')
                    .upsert({ user_id: user.id, achievement_key: ua.achievementId, unlocked_at: ua.unlockedAt });
                } catch {
                  // ignore
                }
              }
            });
          }
        }
      }
    },
    [user]
  );

  const recordLevelComplete = useCallback(
    (
      gameId: string,
      levelId: number | string,
      stats: { stars: number; score: number; deaths: number; timeSeconds: number }
    ) => {
      setProgress((prev) => {
        const gameProg = prev[gameId] || getInitialGameProgress(gameId);
        const levelKey = String(levelId);
        const prevLevel = gameProg.completedLevels[levelKey];

        const record: LevelRecord = {
          levelId,
          stars: Math.max(prevLevel?.stars || 0, stats.stars),
          score: Math.max(prevLevel?.score || 0, stats.score),
          deaths: prevLevel ? Math.min(prevLevel.deaths, stats.deaths) : stats.deaths,
          timeSeconds: prevLevel ? Math.min(prevLevel.timeSeconds, stats.timeSeconds) : stats.timeSeconds,
          completedAt: new Date().toISOString(),
        };

        const nextLevelNum = typeof levelId === 'number' ? levelId + 1 : parseInt(levelId, 10) + 1;
        const highestUnlocked = Math.max(gameProg.highestUnlockedLevel, nextLevelNum || 1);

        const newCompleted = {
          ...gameProg.completedLevels,
          [levelKey]: record,
        };

        let totalScore = 0;
        Object.values(newCompleted).forEach((r) => {
          totalScore += r.score;
        });

        const updatedGame: GameProgressRecord = {
          ...gameProg,
          highestUnlockedLevel: highestUnlocked,
          completedLevels: newCompleted,
          totalScore,
          bestScore: Math.max(gameProg.bestScore, stats.score),
          lastPlayedAt: new Date().toISOString(),
        };

        const nextProg = {
          ...prev,
          [gameId]: updatedGame,
        };

        localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(nextProg));

        // Sync with Supabase
        if (user && !user.is_guest) {
          const supabase = getSupabase();
          if (supabase) {
            Promise.resolve().then(async () => {
              try {
                await supabase
                  .from('game_progress')
                  .upsert(
                    {
                      user_id: user.id,
                      game_id: gameId,
                      highest_unlocked_level: highestUnlocked,
                      completed_levels: newCompleted,
                      total_score: totalScore,
                      best_score: updatedGame.bestScore,
                      last_played_at: updatedGame.lastPlayedAt,
                    },
                    { onConflict: 'user_id, game_id' }
                  );

                await supabase
                  .from('game_scores')
                  .insert({
                    user_id: user.id,
                    game_id: gameId,
                    score: stats.score,
                    level: String(levelId),
                  });
              } catch {
                // ignore
              }
            });
          }
        }

        checkAchievements(nextProg, achievements);
        return nextProg;
      });
    },
    [user, achievements, checkAchievements]
  );

  const recordHighScore = useCallback(
    (gameId: string, score: number, level?: string) => {
      setProgress((prev) => {
        const gameProg = prev[gameId] || getInitialGameProgress(gameId);
        const bestScore = Math.max(gameProg.bestScore, score);
        const totalScore = gameProg.totalScore + score;

        const updatedGame: GameProgressRecord = {
          ...gameProg,
          bestScore,
          totalScore,
          lastPlayedAt: new Date().toISOString(),
        };

        const nextProg = {
          ...prev,
          [gameId]: updatedGame,
        };

        localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(nextProg));

        if (user && !user.is_guest) {
          const supabase = getSupabase();
          if (supabase) {
            Promise.resolve().then(async () => {
              try {
                await supabase
                  .from('game_progress')
                  .upsert({
                    user_id: user.id,
                    game_id: gameId,
                    best_score: bestScore,
                    total_score: totalScore,
                    last_played_at: updatedGame.lastPlayedAt,
                  });

                await supabase
                  .from('game_scores')
                  .insert({
                    user_id: user.id,
                    game_id: gameId,
                    score,
                    level: level || 'arcade',
                  });
              } catch {
                // ignore
              }
            });
          }
        }

        checkAchievements(nextProg, achievements);
        return nextProg;
      });
    },
    [user, achievements, checkAchievements]
  );

  const getGameProgress = useCallback(
    (gameId: string): GameProgressRecord => {
      return progress[gameId] || getInitialGameProgress(gameId);
    },
    [progress]
  );

  const getTotalStars = useCallback((): number => {
    let count = 0;
    Object.values(progress).forEach((g) => {
      Object.values(g.completedLevels || {}).forEach((lvl) => {
        count += lvl.stars || 0;
      });
    });
    return count;
  }, [progress]);

  const getTotalScore = useCallback((): number => {
    let sum = 0;
    Object.values(progress).forEach((g) => {
      sum += g.totalScore || 0;
    });
    return sum;
  }, [progress]);

  const getTotalLevelsCompleted = useCallback((): number => {
    let count = 0;
    Object.values(progress).forEach((g) => {
      count += Object.keys(g.completedLevels || {}).length;
    });
    return count;
  }, [progress]);

  const getUnlockedAchievementsCount = useCallback((): number => {
    return Object.values(achievements).filter((a) => Boolean(a.unlockedAt)).length;
  }, [achievements]);

  const getLeaderboard = useCallback(
    async (gameId: string = 'global'): Promise<LeaderboardEntry[]> => {
      const supabase = getSupabase();
      if (supabase) {
        try {
          let query = supabase
            .from('game_scores')
            .select(`
              id,
              user_id,
              score,
              completed_at,
              profiles ( username, avatar_url )
            `)
            .order('score', { ascending: false })
            .limit(20);

          if (gameId !== 'global') {
            query = query.eq('game_id', gameId);
          }

          const { data, error } = await query;
          if (!error && data && data.length > 0) {
            return data.map((item, idx) => {
              const prof = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
              return {
                id: item.id,
                userId: item.user_id,
                username: (prof as { username?: string })?.username || 'Player',
                avatarUrl: (prof as { avatar_url?: string })?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.user_id}`,
                gameId,
                score: item.score,
                levelsCompleted: 1,
                stars: 3,
                rank: idx + 1,
                updatedAt: item.completed_at,
              };
            });
          }
        } catch {
          // Fall back to local/mock leaderboard
        }
      }

      // Add current user's local score to mock leaderboard
      const userTotal = getTotalScore();
      const userLevels = getTotalLevelsCompleted();
      const userStars = getTotalStars();

      const combined: LeaderboardEntry[] = [
        ...MOCK_LEADERBOARD,
        ...(user
          ? [
              {
                id: 'current_user',
                userId: user.id,
                username: user.username + (user.is_guest ? ' (You)' : ' (You)'),
                avatarUrl: user.avatar_url,
                gameId: 'global',
                score: Math.max(userTotal, 120),
                levelsCompleted: userLevels,
                stars: userStars,
                updatedAt: new Date().toISOString(),
              },
            ]
          : []),
      ];

      // Sort descending by score and assign ranks
      return combined
        .sort((a, b) => b.score - a.score)
        .map((e, i) => ({ ...e, rank: i + 1 }));
    },
    [user, getTotalScore, getTotalLevelsCompleted, getTotalStars]
  );

  const migrateGuestProgressToCloud = useCallback(async (): Promise<boolean> => {
    if (!user || user.is_guest) return false;
    const supabase = getSupabase();
    if (!supabase) return false;

    setSyncStatus('syncing');
    try {
      // Push each game progress
      for (const [gameId, gProg] of Object.entries(progress)) {
        await supabase.from('game_progress').upsert(
          {
            user_id: user.id,
            game_id: gameId,
            highest_unlocked_level: gProg.highestUnlockedLevel,
            completed_levels: gProg.completedLevels,
            total_score: gProg.totalScore,
            best_score: gProg.bestScore,
            last_played_at: gProg.lastPlayedAt,
          },
          { onConflict: 'user_id, game_id' }
        );
      }

      // Push achievements
      for (const ach of Object.values(achievements)) {
        if (ach.unlockedAt) {
          await supabase.from('achievements').upsert({
            user_id: user.id,
            achievement_key: ach.achievementId,
            unlocked_at: ach.unlockedAt,
          });
        }
      }

      setSyncStatus('synced');
      return true;
    } catch {
      setSyncStatus('error');
      return false;
    }
  }, [user, progress, achievements]);

  const resetAllProgress = useCallback(() => {
    const initProg: Record<string, GameProgressRecord> = {};
    GAMES_REGISTRY.forEach((g) => {
      initProg[g.id] = getInitialGameProgress(g.id);
    });
    setProgress(initProg);
    setAchievements({});
    localStorage.removeItem(LOCAL_PROGRESS_KEY);
    localStorage.removeItem(LOCAL_ACHIEVEMENTS_KEY);
  }, []);

  const dismissNotification = useCallback(() => {
    setRecentNotification(null);
  }, []);

  const value = useMemo(
    () => ({
      progress,
      achievements,
      recentNotification,
      syncStatus,
      recordLevelComplete,
      recordHighScore,
      getGameProgress,
      getTotalStars,
      getTotalScore,
      getTotalLevelsCompleted,
      getUnlockedAchievementsCount,
      getLeaderboard,
      migrateGuestProgressToCloud,
      resetAllProgress,
      dismissNotification,
    }),
    [
      progress,
      achievements,
      recentNotification,
      syncStatus,
      recordLevelComplete,
      recordHighScore,
      getGameProgress,
      getTotalStars,
      getTotalScore,
      getTotalLevelsCompleted,
      getUnlockedAchievementsCount,
      getLeaderboard,
      migrateGuestProgressToCloud,
      resetAllProgress,
      dismissNotification,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
