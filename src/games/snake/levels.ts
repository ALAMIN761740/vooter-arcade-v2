import { SnakeLevel, Point } from './types.ts';

export const SNAKE_COLS = 25;
export const SNAKE_ROWS = 18;
export const SNAKE_CELL_SIZE = 28;

function createBoxWalls(x1: number, y1: number, x2: number, y2: number): Point[] {
  const walls: Point[] = [];
  for (let x = x1; x <= x2; x++) {
    for (let y = y1; y <= y2; y++) {
      walls.push({ x, y });
    }
  }
  return walls;
}

export const SNAKE_LEVELS: SnakeLevel[] = [
  {
    id: 1,
    name: 'Neon Meadow',
    nameBn: 'নিওন তৃণভূমি',
    targetScore: 100,
    baseSpeed: 7,
    walls: [],
    description: 'Open arena with no interior barriers. Master steering and powerups!',
    descriptionBn: 'উন্মুক্ত ময়দান, কোনো বাধা নেই। গতি ও পাওয়ার-আপের খেলা শুরু হোক!',
  },
  {
    id: 2,
    name: 'Stone Labyrinth',
    nameBn: 'পাথুরে গোলকধাঁধা',
    targetScore: 150,
    baseSpeed: 8,
    walls: [
      ...createBoxWalls(5, 4, 7, 6),
      ...createBoxWalls(17, 4, 19, 6),
      ...createBoxWalls(5, 11, 7, 13),
      ...createBoxWalls(17, 11, 19, 13),
    ],
    description: 'Four solid stone blocks anchor the corners. Steer carefully around corners.',
    descriptionBn: 'চার কোণায় চারটি দুর্ভেদ্য পাথর। বাঁক নেওয়ার সময় সাবধান থাকুন।',
  },
  {
    id: 3,
    name: 'Twin Pillars',
    nameBn: 'যুগ্ম স্তম্ভ',
    targetScore: 200,
    baseSpeed: 9,
    walls: [
      ...createBoxWalls(8, 3, 9, 7),
      ...createBoxWalls(8, 10, 9, 14),
      ...createBoxWalls(15, 3, 16, 7),
      ...createBoxWalls(15, 10, 16, 14),
    ],
    description: 'Twin vertical pillars carve narrow chokepoints across the center.',
    descriptionBn: 'মাঝের সরু পথ দিয়ে যাওয়ার সময় সাবধানতা প্রয়োজন।',
  },
  {
    id: 4,
    name: 'Cyber Corridors',
    nameBn: 'সাইবার করিডোর',
    targetScore: 250,
    baseSpeed: 10,
    walls: [
      ...createBoxWalls(4, 5, 20, 5),
      ...createBoxWalls(4, 12, 20, 12),
    ],
    description: 'Horizontal speed rails require fast reflexes to avoid crashing at high speed.',
    descriptionBn: 'লম্বা অনুভূমিক দেয়াল — উচ্চ গতিতে মোড় ঘোরার দ্রুততম পরীক্ষা।',
  },
  {
    id: 5,
    name: 'The Gauntlet',
    nameBn: 'চরম পরীক্ষা',
    targetScore: 300,
    baseSpeed: 11,
    walls: [
      ...createBoxWalls(6, 4, 7, 6),
      ...createBoxWalls(17, 4, 18, 6),
      ...createBoxWalls(11, 8, 13, 9),
      ...createBoxWalls(6, 11, 7, 13),
      ...createBoxWalls(17, 11, 18, 13),
      ...createBoxWalls(1, 8, 3, 9),
      ...createBoxWalls(21, 8, 23, 9),
    ],
    description: 'Dense obstacle matrix with shifting corridors. Only true arcade masters survive.',
    descriptionBn: 'অসংখ্য বাধার গোলকধাঁধা — কেবল সেরা গেমাররাই এটি জয় করতে পারে।',
  },
];
