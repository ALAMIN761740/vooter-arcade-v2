export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type PowerupType = 'food' | 'speed' | 'ghost' | 'diamond' | 'bomb';

export interface FoodItem extends Point {
  type: PowerupType;
  expiresAt?: number;
}

export interface SnakeLevel {
  id: number;
  name: string;
  nameBn: string;
  targetScore: number;
  baseSpeed: number; // updates per second
  walls: Point[];
  description: string;
  descriptionBn: string;
}
