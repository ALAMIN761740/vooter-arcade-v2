import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialSnakeState,
  stepSnake,
  isOppositeDirection,
  getNextHeadPosition,
} from './engine.ts';
import { SNAKE_LEVELS } from './levels.ts';

test('isOppositeDirection detects opposite directions accurately', () => {
  assert.equal(isOppositeDirection('UP', 'DOWN'), true);
  assert.equal(isOppositeDirection('DOWN', 'UP'), true);
  assert.equal(isOppositeDirection('LEFT', 'RIGHT'), true);
  assert.equal(isOppositeDirection('RIGHT', 'LEFT'), true);
  assert.equal(isOppositeDirection('UP', 'RIGHT'), false);
  assert.equal(isOppositeDirection('DOWN', 'LEFT'), false);
});

test('getNextHeadPosition calculates target coordinate according to direction', () => {
  const origin = { x: 10, y: 10 };
  assert.deepEqual(getNextHeadPosition(origin, 'UP'), { x: 10, y: 9 });
  assert.deepEqual(getNextHeadPosition(origin, 'DOWN'), { x: 10, y: 11 });
  assert.deepEqual(getNextHeadPosition(origin, 'LEFT'), { x: 9, y: 10 });
  assert.deepEqual(getNextHeadPosition(origin, 'RIGHT'), { x: 11, y: 10 });
});

test('Snake world initializes with 3-segment snake moving right', () => {
  const level1 = SNAKE_LEVELS[0];
  const state = createInitialSnakeState(level1);

  assert.equal(state.snake.length, 3);
  assert.equal(state.direction, 'RIGHT');
  assert.equal(state.score, 0);
  assert.equal(state.isDead, false);
  assert.equal(state.isWin, false);
});

test('Snake movement steps forward without eating food', () => {
  const level1 = SNAKE_LEVELS[0];
  const state = createInitialSnakeState(level1);
  state.food = { x: 0, y: 0, type: 'food' }; // put food far away

  const headX = state.snake[0].x;
  const res = stepSnake(state, 0.1);

  assert.equal(res.state.snake[0].x, headX + 1);
  assert.equal(res.state.snake.length, 3);
  assert.equal(res.ateFood, false);
});

test('Snake eating food increments length, score, and combo multiplier', () => {
  const level1 = SNAKE_LEVELS[0];
  const state = createInitialSnakeState(level1);
  // Place food directly in front of head
  state.food = { x: state.snake[0].x + 1, y: state.snake[0].y, type: 'food' };

  const res = stepSnake(state, 0.1);

  assert.equal(res.ateFood, true);
  assert.equal(res.state.score, 10);
  assert.equal(res.state.snake.length, 4);
  assert.equal(res.state.combo, 2);
});
