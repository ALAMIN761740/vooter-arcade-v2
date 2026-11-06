import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDeck,
  checkPairMatch,
  calculateMemoryStars,
  calculateMemoryScore,
} from './engine.ts';
import { MEMORY_LEVELS } from './levels.ts';

test('createDeck creates 2x pairsCount cards with matching pairs', () => {
  const level1 = MEMORY_LEVELS[0]; // 6 pairs -> 12 cards
  const deck = createDeck(level1, 'arcade');

  assert.equal(deck.length, 12);
  const cardIds = deck.map((c) => c.cardId);

  // Each cardId must appear exactly twice
  const counts: Record<string, number> = {};
  cardIds.forEach((id) => {
    counts[id] = (counts[id] || 0) + 1;
  });

  assert.equal(Object.keys(counts).length, 6);
  Object.values(counts).forEach((count) => {
    assert.equal(count, 2);
  });
});

test('checkPairMatch returns true for matching card IDs and false for different cards', () => {
  const cardA = {
    instanceId: 'card1_a',
    cardId: 'pacman',
    symbol: '🟡',
    name: 'Pacman',
    isFlipped: true,
    isMatched: false,
  };
  const cardB = {
    instanceId: 'card1_b',
    cardId: 'pacman',
    symbol: '🟡',
    name: 'Pacman',
    isFlipped: true,
    isMatched: false,
  };
  const cardC = {
    instanceId: 'card2_a',
    cardId: 'ghost',
    symbol: '👻',
    name: 'Ghost',
    isFlipped: true,
    isMatched: false,
  };

  assert.equal(checkPairMatch(cardA, cardB), true);
  assert.equal(checkPairMatch(cardA, cardC), false);
  // Same instance is not a valid pair
  assert.equal(checkPairMatch(cardA, cardA), false);
});

test('calculateMemoryStars awards 3 stars for efficient completion and lower stars for high moves', () => {
  // Target moves: 10, target seconds: 40
  const stars3 = calculateMemoryStars(9, 10, 30, 40);
  assert.equal(stars3, 3);

  const stars2 = calculateMemoryStars(14, 10, 50, 40);
  assert.equal(stars2, 2);

  const stars1 = calculateMemoryStars(25, 10, 90, 40);
  assert.equal(stars1, 1);
});

test('calculateMemoryScore awards base points plus speed and move bonuses', () => {
  const score = calculateMemoryScore(8, 10, 20, 40, 6);
  assert.ok(score >= 300);
});
