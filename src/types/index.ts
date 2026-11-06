export type GameCategory = 'Platformer' | 'Arcade' | 'Puzzle';
export type GameDifficulty = 'Casual' | 'Medium' | 'Hardcore' | 'Troll';
export type AppLanguage = 'en' | 'bn';

export interface GameInfo {
  id: string;
  slug: string;
  title: string;
  titleBn: string;
  subtitle: string;
  subtitleBn: string;
  description: string;
  descriptionBn: string;
  category: GameCategory;
  difficulty: GameDifficulty;
  levelCount: number;
  icon: string;
  thumbnailGradient: string;
  badges: string[];
  controls: {
    desktop: string;
    mobile: string;
  };
  features: string[];
  status: 'active' | 'beta' | 'coming-soon';
  releaseDate: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  avatar_url: string;
  created_at: string;
  is_guest: boolean;
  preferences: {
    soundMuted: boolean;
    language: AppLanguage;
    theme: 'dark' | 'arcade';
  };
}

export interface LevelRecord {
  levelId: number | string;
  stars: number; // 0..3
  score: number;
  deaths: number;
  timeSeconds: number;
  completedAt: string;
}

export interface GameProgressRecord {
  gameId: string;
  highestUnlockedLevel: number;
  completedLevels: Record<string, LevelRecord>;
  totalScore: number;
  bestScore: number;
  lastPlayedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  icon: string;
  category: 'general' | 'ballot-trap' | 'snake' | 'memory';
  targetValue: number;
  xpReward: number;
}

export interface UserAchievement {
  achievementId: string;
  currentValue: number;
  unlockedAt: string | null;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
  gameId: string; // 'global' or specific game id
  score: number;
  levelsCompleted: number;
  stars: number;
  rank?: number;
  updatedAt: string;
}
