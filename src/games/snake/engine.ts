import { Point, Direction, FoodItem, PowerupType, SnakeLevel } from './types.ts';
import { SNAKE_COLS, SNAKE_ROWS } from './levels.ts';

export interface SnakeState {
  level: SnakeLevel;
  snake: Point[];
  direction: Direction;
  nextDirection: Direction;
  food: FoodItem;
  specialFood: FoodItem | null;
  score: number;
  combo: number;
  comboTimer: number;
  ghostTimer: number; // seconds remaining
  speedTimer: number; // seconds remaining
  isDead: boolean;
  isWin: boolean;
  deathCause: string | null;
}

export function isOppositeDirection(a: Direction, b: Direction): boolean {
  return (
    (a === 'UP' && b === 'DOWN') ||
    (a === 'DOWN' && b === 'UP') ||
    (a === 'LEFT' && b === 'RIGHT') ||
    (a === 'RIGHT' && b === 'LEFT')
  );
}

export function getNextHeadPosition(head: Point, dir: Direction): Point {
  switch (dir) {
    case 'UP':
      return { x: head.x, y: head.y - 1 };
    case 'DOWN':
      return { x: head.x, y: head.y + 1 };
    case 'LEFT':
      return { x: head.x - 1, y: head.y };
    case 'RIGHT':
      return { x: head.x + 1, y: head.y };
  }
}

export function isCellOccupied(point: Point, snake: Point[], walls: Point[]): boolean {
  if (snake.some((s) => s.x === point.x && s.y === point.y)) return true;
  if (walls.some((w) => w.x === point.x && w.y === point.y)) return true;
  return false;
}

export function spawnFood(snake: Point[], walls: Point[], type: PowerupType = 'food'): FoodItem {
  const emptyCells: Point[] = [];
  for (let x = 1; x < SNAKE_COLS - 1; x++) {
    for (let y = 1; y < SNAKE_ROWS - 1; y++) {
      if (!isCellOccupied({ x, y }, snake, walls)) {
        emptyCells.push({ x, y });
      }
    }
  }

  if (emptyCells.length === 0) {
    return { x: 5, y: 5, type };
  }

  const chosen = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  return {
    ...chosen,
    type,
    expiresAt: type !== 'food' ? Date.now() + 10000 : undefined,
  };
}

export function createInitialSnakeState(level: SnakeLevel): SnakeState {
  const midX = Math.floor(SNAKE_COLS / 2);
  const midY = Math.floor(SNAKE_ROWS / 2);

  const snake: Point[] = [
    { x: midX, y: midY },
    { x: midX - 1, y: midY },
    { x: midX - 2, y: midY },
  ];

  return {
    level,
    snake,
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    food: spawnFood(snake, level.walls, 'food'),
    specialFood: null,
    score: 0,
    combo: 1,
    comboTimer: 0,
    ghostTimer: 0,
    speedTimer: 0,
    isDead: false,
    isWin: false,
    deathCause: null,
  };
}

export interface StepResult {
  state: SnakeState;
  ateFood: boolean;
  ateSpecial: PowerupType | null;
  died: boolean;
  won: boolean;
}

export function stepSnake(prevState: SnakeState, dt: number): StepResult {
  if (prevState.isDead || prevState.isWin) {
    return { state: prevState, ateFood: false, ateSpecial: null, died: false, won: false };
  }

  const state = { ...prevState };
  state.direction = state.nextDirection;

  // Timers
  if (state.ghostTimer > 0) state.ghostTimer = Math.max(0, state.ghostTimer - dt);
  if (state.speedTimer > 0) state.speedTimer = Math.max(0, state.speedTimer - dt);
  if (state.comboTimer > 0) {
    state.comboTimer = Math.max(0, state.comboTimer - dt);
    if (state.comboTimer === 0) state.combo = 1;
  }

  // Check special food expiration
  if (state.specialFood && state.specialFood.expiresAt && Date.now() > state.specialFood.expiresAt) {
    state.specialFood = null;
  }

  // Randomly spawn special powerup (ghost, speed, diamond) if none active
  if (!state.specialFood && Math.random() < 0.04) {
    const powerTypes: PowerupType[] = ['speed', 'ghost', 'diamond'];
    const chosenType = powerTypes[Math.floor(Math.random() * powerTypes.length)];
    state.specialFood = spawnFood(state.snake, state.level.walls, chosenType);
  }

  let head = getNextHeadPosition(state.snake[0], state.direction);
  const isGhost = state.ghostTimer > 0;

  // Handle bounds
  if (head.x < 0 || head.x >= SNAKE_COLS || head.y < 0 || head.y >= SNAKE_ROWS) {
    if (isGhost) {
      // Wrap around in ghost mode!
      head = {
        x: (head.x + SNAKE_COLS) % SNAKE_COLS,
        y: (head.y + SNAKE_ROWS) % SNAKE_ROWS,
      };
    } else {
      state.isDead = true;
      state.deathCause = 'Hit the arena boundary wall';
      return { state, ateFood: false, ateSpecial: null, died: true, won: false };
    }
  }

  // Handle wall obstacles
  const hitWall = state.level.walls.some((w: Point) => w.x === head.x && w.y === head.y);
  if (hitWall) {
    if (!isGhost) {
      state.isDead = true;
      state.deathCause = 'Crashed into a stone pillar';
      return { state, ateFood: false, ateSpecial: null, died: true, won: false };
    }
  }

  // Handle self-tail collision
  const hitSelf = state.snake.slice(0, -1).some((s) => s.x === head.x && s.y === head.y);
  if (hitSelf && !isGhost) {
    state.isDead = true;
    state.deathCause = 'Bit own tail';
    return { state, ateFood: false, ateSpecial: null, died: true, won: false };
  }

  let ateFood = false;
  let ateSpecial: PowerupType | null = null;

  // Check eating food
  if (head.x === state.food.x && head.y === state.food.y) {
    ateFood = true;
    state.score += 10 * state.combo;
    state.combo = Math.min(5, state.combo + 1);
    state.comboTimer = 4.0; // 4s to chain next food for higher multiplier
    state.food = spawnFood([head, ...state.snake], state.level.walls, 'food');
  }

  // Check eating special powerup
  if (state.specialFood && head.x === state.specialFood.x && head.y === state.specialFood.y) {
    ateSpecial = state.specialFood.type;
    if (ateSpecial === 'speed') {
      state.speedTimer = 6.0;
      state.score += 25 * state.combo;
    } else if (ateSpecial === 'ghost') {
      state.ghostTimer = 6.0;
      state.score += 30 * state.combo;
    } else if (ateSpecial === 'diamond') {
      state.score += 50 * state.combo;
    }
    state.specialFood = null;
  }

  // Move snake
  const newSnake = [head, ...state.snake];
  if (!ateFood && !ateSpecial) {
    newSnake.pop();
  }
  state.snake = newSnake;

  // Check Win condition
  if (state.score >= state.level.targetScore) {
    state.isWin = true;
    return { state, ateFood, ateSpecial, died: false, won: true };
  }

  return { state, ateFood, ateSpecial, died: false, won: false };
}
