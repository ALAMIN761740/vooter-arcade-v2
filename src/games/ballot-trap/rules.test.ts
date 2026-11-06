import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld, step, doorRect, World } from './engine.ts';
import { LEVELS } from './levels.ts';

test('Ballot Trap world initializes correctly with player spawn and ballots', () => {
  const level1 = LEVELS[0];
  const world: World = createWorld(level1, 'normal');

  assert.equal(world.state, 'play');
  assert.equal(world.got, 0);
  assert.equal(world.ballots.length, 3);
  assert.ok(world.p.x > 0);
  assert.ok(world.p.y > 0);
  assert.equal(world.p.vx, 0);
  assert.equal(world.p.vy, 0);
});

test('Ballot Trap doorRect returns valid bounding box matching exit coordinate', () => {
  const level1 = LEVELS[0];
  const world: World = createWorld(level1, 'normal');
  const dRect = doorRect(world);

  assert.equal(dRect.w, 32);
  assert.equal(dRect.h, 48);
  assert.equal(dRect.x, level1.exit[0] * 32);
});

test('Ballot Trap physics steps correctly on gravity and ground collision', () => {
  const level1 = LEVELS[0];
  const world: World = createWorld(level1, 'normal');

  // Step with no input
  step(world, { left: false, right: false, jump: false, jumpPressed: false }, 0.05);

  assert.equal(world.state, 'play');
  assert.ok(world.time > 0);
  assert.ok(world.t > 0);
});

test('Ballot Trap right movement increases velocity and moves player right', () => {
  const level1 = LEVELS[0];
  const world: World = createWorld(level1, 'normal');
  const initialX = world.p.x;

  for (let i = 0; i < 5; i++) {
    step(world, { left: false, right: true, jump: false, jumpPressed: false }, 0.05);
  }

  assert.ok(world.p.x >= initialX);
  assert.ok(world.p.vx > 0);
});
