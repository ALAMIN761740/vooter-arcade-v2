import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { GAMES_REGISTRY } from '../data/games.ts';
import { BallotTrapGame } from '../games/ballot-trap/BallotTrapGame.tsx';
import { SnakeGame } from '../games/snake/SnakeGame.tsx';
import { MemoryGame } from '../games/memory/MemoryGame.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { useProgress } from '../context/ProgressContext.tsx';

export const GamePlayerPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updatePreferences } = useAuth();
  const { recordLevelComplete, recordHighScore } = useProgress();

  const levelQuery = parseInt(searchParams.get('level') || '0', 10);
  const [levelIndex, setLevelIndex] = useState<number>(isNaN(levelQuery) ? 0 : levelQuery);

  useEffect(() => {
    const q = parseInt(searchParams.get('level') || '0', 10);
    if (!isNaN(q) && q !== levelIndex) {
      setLevelIndex(q);
    }
  }, [searchParams, levelIndex]);

  const game = GAMES_REGISTRY.find((g) => g.id === gameId || g.slug === gameId);

  if (!game) {
    return (
      <div className="py-20 text-center text-white space-y-4">
        <h2 className="text-2xl font-bold font-display">Game not found</h2>
        <button
          onClick={() => navigate('/games')}
          className="px-4 py-2 bg-cyan-600 rounded-xl text-xs font-bold"
        >
          Return to Games Library
        </button>
      </div>
    );
  }

  const lang = user?.preferences.language || 'en';
  const muted = user?.preferences.soundMuted ?? false;

  const toggleMute = () => {
    if (user) {
      updatePreferences({ soundMuted: !user.preferences.soundMuted });
    }
  };

  const toggleLang = () => {
    if (user) {
      const nextLang = user.preferences.language === 'en' ? 'bn' : 'en';
      updatePreferences({ language: nextLang });
    }
  };

  const handleLevelComplete = (
    lvlIdx: number,
    stats: { stars: number; score: number; deaths: number; timeSeconds: number }
  ) => {
    // Record to persistent storage & cloud
    const actualLevelNumber = lvlIdx + 1;
    recordLevelComplete(game.id, actualLevelNumber, stats);
    recordHighScore(game.id, stats.score, String(actualLevelNumber));
  };

  const handleNextLevel = () => {
    if (levelIndex < game.levelCount - 1) {
      const nextIdx = levelIndex + 1;
      setLevelIndex(nextIdx);
      setSearchParams({ level: String(nextIdx) });
    } else {
      navigate(`/levels/${game.slug}`);
    }
  };

  const handleExit = () => {
    navigate(`/levels/${game.slug}`);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-4 px-2 sm:px-6 bg-[#060810]">
      <div className="w-full max-w-5xl">
        {game.id === 'ballot-trap' && (
          <BallotTrapGame
            levelIndex={levelIndex}
            lang={lang}
            muted={muted}
            onExit={handleExit}
            onComplete={handleLevelComplete}
            onNextLevel={handleNextLevel}
            hasNextLevel={levelIndex < game.levelCount - 1}
            toggleMute={toggleMute}
            toggleLang={toggleLang}
          />
        )}

        {game.id === 'snake-evolution' && (
          <SnakeGame
            levelIndex={levelIndex}
            lang={lang}
            muted={muted}
            onExit={handleExit}
            onComplete={handleLevelComplete}
            onNextLevel={handleNextLevel}
            hasNextLevel={levelIndex < game.levelCount - 1}
            toggleMute={toggleMute}
          />
        )}

        {game.id === 'memory-match' && (
          <MemoryGame
            levelIndex={levelIndex}
            lang={lang}
            muted={muted}
            onExit={handleExit}
            onComplete={handleLevelComplete}
            onNextLevel={handleNextLevel}
            hasNextLevel={levelIndex < game.levelCount - 1}
            toggleMute={toggleMute}
          />
        )}
      </div>
    </div>
  );
};
