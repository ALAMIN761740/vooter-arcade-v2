import { CardTheme, MemoryCard, MemoryLevel } from './types.ts';
import { THEMED_CARDS } from './levels.ts';

export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function createDeck(level: MemoryLevel, theme: CardTheme): MemoryCard[] {
  const cardsPool = THEMED_CARDS[theme] || THEMED_CARDS.arcade;
  const shuffledPool = shuffleArray(cardsPool);
  const selectedCards = shuffledPool.slice(0, level.pairsCount);

  const deck: MemoryCard[] = [];
  selectedCards.forEach((c) => {
    deck.push({
      instanceId: `${c.id}_1_${Math.random().toString(36).substring(2, 7)}`,
      cardId: c.id,
      symbol: c.symbol,
      name: c.name,
      isFlipped: false,
      isMatched: false,
    });
    deck.push({
      instanceId: `${c.id}_2_${Math.random().toString(36).substring(2, 7)}`,
      cardId: c.id,
      symbol: c.symbol,
      name: c.name,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(deck);
}

export function checkPairMatch(cardA: MemoryCard, cardB: MemoryCard): boolean {
  return cardA.cardId === cardB.cardId && cardA.instanceId !== cardB.instanceId;
}

export function calculateMemoryStars(
  moves: number,
  targetMoves: number,
  timeSeconds: number,
  targetSeconds: number
): number {
  const movesRatio = moves / targetMoves;
  const timeRatio = timeSeconds / targetSeconds;

  if (movesRatio <= 1.15 && timeRatio <= 1.1) {
    return 3;
  }
  if (movesRatio <= 1.5 && timeRatio <= 1.5) {
    return 2;
  }
  return 1;
}

export function calculateMemoryScore(
  moves: number,
  targetMoves: number,
  timeSeconds: number,
  targetSeconds: number,
  pairsCount: number
): number {
  const baseScore = pairsCount * 50;
  const moveEfficiency = Math.max(0, Math.floor((targetMoves * 1.5 - moves) * 15));
  const timeEfficiency = Math.max(0, Math.floor((targetSeconds * 1.5 - timeSeconds) * 5));
  return Math.max(100, baseScore + moveEfficiency + timeEfficiency);
}
