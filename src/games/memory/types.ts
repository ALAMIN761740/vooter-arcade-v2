export type CardTheme = 'arcade' | 'ballot' | 'cyber';

export interface CardItem {
  id: string;
  symbol: string;
  name: string;
  nameBn: string;
}

export interface MemoryCard {
  instanceId: string;
  cardId: string;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryLevel {
  id: number;
  name: string;
  nameBn: string;
  cols: number;
  rows: number;
  pairsCount: number;
  targetMoves: number;
  targetSeconds: number;
}
