import { COLS, ROWS } from './consts.ts';
import { LocalizedString } from './i18n.ts';

export interface LevelThing {
  k: 'crumble' | 'ghost' | 'hidden' | 'pop' | 'drop' | 'walker' | 'mover' | 'shooter' | 'flip' | 'dodge';
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  delay?: number;
  from?: number;
  to?: number;
  x1?: number;
  x2?: number;
  speed?: number;
  axis?: 'x' | 'y';
  dir?: number;
  period?: number;
  offset?: number;
  rs?: number[];
  alts?: Array<{ x: number; y: number }>;
  // runtime fields
  px?: number;
  py?: number;
  pw?: number;
  ph?: number;
  st?: number;
  tm?: number;
  vy?: number;
  up?: number;
  alive?: boolean;
  deadT?: number;
  a?: number;
  b?: number;
  dx?: number;
  dy?: number;
  arm?: number;
  revealed?: boolean;
}

export interface LevelSign {
  x: number;
  y: number;
  bn: string;
  en: string;
}

export interface LevelDefinition {
  id: number;
  theme: 'school' | 'bridge' | 'hartal' | 'flood' | 'night' | 'flip' | 'runaway' | 'final';
  name: LocalizedString;
  intro: LocalizedString;
  win: LocalizedString;
  blackout?: { light: number; dark: number };
  things: LevelThing[];
  signs: LevelSign[];
  fakeDoors: Array<[number, number]>;
  start: [number, number];
  exit: [number, number];
  map: string[];
}

export interface LevelBuilderApi {
  set: (x: number, y: number, c: string) => void;
  wall: (x: number, y: number, w?: number, h?: number) => void;
  gap: (x: number, w: number) => void;
  water: (x: number, w: number) => void;
  spikes: (x: number, y: number, w?: number) => void;
  ballot: (x: number, y: number) => void;
  start: (x: number, y: number) => void;
  exit: (x: number, y: number) => void;
  fake: (x: number, y: number) => void;
  sign: (x: number, y: number, bn: string, en: string) => void;
  add: (t: LevelThing) => void;
}

function build(
  id: number,
  meta: {
    theme: LevelDefinition['theme'];
    name: LocalizedString;
    intro: LocalizedString;
    win: LocalizedString;
    blackout?: { light: number; dark: number };
  },
  fn: (b: LevelBuilderApi) => void
): LevelDefinition {
  const g: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill('.'));
  for (let x = 0; x < COLS; x++) {
    g[0][x] = '#';
    g[ROWS - 1][x] = '#';
    g[ROWS - 2][x] = '#';
  }
  for (let y = 0; y < ROWS; y++) {
    g[y][0] = '#';
    g[y][COLS - 1] = '#';
  }
  const lv: LevelDefinition = {
    id,
    ...meta,
    things: [],
    signs: [],
    fakeDoors: [],
    start: [2, 12],
    exit: [22, 12],
    map: [],
  };

  const api: LevelBuilderApi = {
    set: (x, y, c) => {
      g[y][x] = c;
    },
    wall: (x, y, w = 1, h = 1) => {
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) g[yy][xx] = '#';
    },
    gap: (x, w) => {
      for (let xx = x; xx < x + w; xx++) {
        g[ROWS - 2][xx] = '.';
        g[ROWS - 1][xx] = '.';
      }
    },
    water: (x, w) => {
      for (let xx = x; xx < x + w; xx++) {
        g[ROWS - 2][xx] = '~';
        g[ROWS - 1][xx] = '#';
      }
    },
    spikes: (x, y, w = 1) => {
      for (let xx = x; xx < x + w; xx++) g[y][xx] = '^';
    },
    ballot: (x, y) => {
      g[y][x] = 'B';
    },
    start: (x, y) => {
      lv.start = [x, y];
    },
    exit: (x, y) => {
      lv.exit = [x, y];
    },
    fake: (x, y) => lv.fakeDoors.push([x, y]),
    sign: (x, y, bn, en) => lv.signs.push({ x, y, bn, en }),
    add: (t) => lv.things.push(t),
  };

  fn(api);
  lv.map = g.map((r) => r.join(''));
  return lv;
}

export const LEVELS: LevelDefinition[] = [
  // Level 1: School Center
  build(
    1,
    {
      theme: 'school',
      name: { bn: 'স্কুল কেন্দ্র', en: 'School Center' },
      intro: {
        bn: 'প্রথম কেন্দ্র। সহজই মনে হচ্ছে… তাই না?',
        en: 'The first center. Looks easy… doesn’t it?',
      },
      win: {
        bn: 'প্রথম ভোট পড়ল! কিন্তু এটা তো কেবল শুরু।',
        en: 'First vote cast! But this is only the beginning.',
      },
    },
    (b) => {
      b.start(2, 12);
      b.exit(23, 12);
      b.gap(9, 3);
      b.sign(3, 12, 'ডানে যাও — কেন্দ্র একদম সামনেই!', 'Go right — the center is right ahead!');
      b.ballot(6, 11);
      b.ballot(10, 9);
      b.ballot(19, 10);
      b.add({ k: 'pop', x: 18, y: 12, w: 2, from: 14.5, to: 16.5, delay: 0.08 });
      b.add({ k: 'drop', x: 22, y: 1, from: 19.5, to: 21.2 });
    }
  ),

  // Level 2: Bridge of Promises
  build(
    2,
    {
      theme: 'bridge',
      name: { bn: 'প্রতিশ্রুতির সেতু', en: 'Bridge of Promises' },
      intro: {
        bn: 'নির্বাচনের আগে সেতু হবেই! (অবশ্যই!)',
        en: 'A bridge will be built before the election! (Definitely!)',
      },
      win: {
        bn: 'সেতু পার হলেন — অর্ধেক প্রতিশ্রুতি রক্ষা হলো।',
        en: 'You crossed — half the promises were kept.',
      },
    },
    (b) => {
      b.start(2, 12);
      b.exit(23, 12);
      b.gap(6, 11);
      b.sign(3, 12, 'নতুন সেতু উদ্বোধনের অপেক্ষায়!', 'A brand-new bridge, ready for opening!');
      b.wall(6, 12);
      b.add({ k: 'crumble', x: 7, y: 12, w: 2, delay: 0.55 });
      b.wall(9, 12);
      b.add({ k: 'ghost', x: 10, y: 12, w: 2 });
      b.wall(12, 12);
      b.add({ k: 'crumble', x: 13, y: 12, w: 2, delay: 0.45 });
      b.wall(15, 12);
      b.add({ k: 'ghost', x: 16, y: 12, w: 1 });
      b.sign(18, 12, 'দেখলেন তো? সেতু হয়েছে!', 'See? The bridge is done!');
      b.ballot(8, 10);
      b.ballot(11, 10);
      b.ballot(14, 10);
      b.add({ k: 'walker', x: 19, y: 12, x1: 19, x2: 21, speed: 55 });
    }
  ),

  // Level 3: Hartal Morning
  build(
    3,
    {
      theme: 'hartal',
      name: { bn: 'হরতালের সকাল', en: 'Hartal Morning' },
      intro: {
        bn: 'রাস্তায় ব্যারিকেড, আকাশে ইট। ভোটকেন্দ্র উঁচুতে!',
        en: 'Barricades on the road, bricks in the air. The center is up high!',
      },
      win: {
        bn: 'হরতাল পেরিয়ে ভোট! সাহস আছে বটে।',
        en: 'Voted through a hartal! That takes guts.',
      },
    },
    (b) => {
      b.start(2, 12);
      b.exit(21, 8);
      b.wall(8, 11, 1, 2);
      b.wall(13, 11, 1, 2);
      b.wall(17, 11, 2, 1);
      b.wall(20, 9, 4, 1);
      b.sign(3, 12, 'আজ হরতাল! ঘরে থাকুন। (থাকলেন না?)', 'Hartal today! Stay home. (You didn’t?)');
      b.ballot(6, 10);
      b.ballot(10, 9);
      b.ballot(18, 8);
      b.add({ k: 'drop', x: 5, y: 1, from: 3.2, to: 4.6 });
      b.add({ k: 'drop', x: 11, y: 1, from: 9.4, to: 10.8 });
      b.add({ k: 'drop', x: 15, y: 1, from: 13.4, to: 14.8 });
      b.add({ k: 'shooter', x: 23, y: 12, dir: -1, period: 1.8, speed: 270, offset: 0.4 });
    }
  ),

  // Level 4: Flood Waters
  build(
    4,
    {
      theme: 'flood',
      name: { bn: 'বানের পানি', en: 'Flood Waters' },
      intro: {
        bn: 'চারদিকে পানি। নৌকাই ভরসা — যদি ভাসে!',
        en: 'Water everywhere. Boats are your hope — if they float!',
      },
      win: {
        bn: 'বন্যা পেরিয়ে ভোটকেন্দ্র — ত্রাণ পাননি তো কী!',
        en: 'Through the flood to the polls — relief or no relief!',
      },
    },
    (b) => {
      b.start(2, 12);
      b.exit(23, 12);
      b.water(5, 16);
      b.wall(12, 12, 2, 1);
      b.wall(17, 7, 3, 1);
      b.sign(3, 12, 'ত্রাণ আসছে… নৌকায় চড়ে!', 'Relief is on its way… by boat!');
      b.add({ k: 'mover', x: 5, y: 12, w: 3, axis: 'x', to: 8, speed: 55 });
      b.add({ k: 'mover', x: 15, y: 12, w: 2, axis: 'y', to: 7, speed: 50 });
      b.add({ k: 'pop', x: 13, y: 11, w: 1, from: 12.2, to: 13, delay: 0.1 });
      b.add({ k: 'crumble', x: 20, y: 7, w: 1, delay: 0.35 });
      b.ballot(7, 9);
      b.ballot(12, 9);
      b.ballot(18, 5);
    }
  ),

  // Level 5: Load-shedding
  build(
    5,
    {
      theme: 'night',
      name: { bn: 'লোডশেডিং', en: 'Load-shedding' },
      intro: {
        bn: 'হঠাৎ বিদ্যুৎ চলে গেল। অন্ধকারে ভরসা স্মৃতিশক্তি!',
        en: 'The power just went out. In the dark, memory is all you have!',
      },
      win: {
        bn: 'অন্ধকারেই ভোট দিয়ে এলেন — রেকর্ড!',
        en: 'Voted in the dark — a record!',
      },
      blackout: { light: 2.8, dark: 2.6 },
    },
    (b) => {
      b.start(2, 12);
      b.exit(23, 12);
      b.gap(6, 1);
      b.gap(9, 2);
      b.spikes(13, 12, 2);
      b.wall(16, 12, 1, 1);
      b.wall(18, 10, 2, 1);
      b.wall(21, 8, 2, 1);
      b.sign(3, 12, 'বিদ্যুৎ আসবে… কিছুক্ষণের মধ্যেই!', 'Power will return… shortly!');
      b.ballot(6, 10);
      b.ballot(19, 8);
      b.ballot(22, 6);
      b.add({ k: 'pop', x: 11, y: 12, w: 1, from: 8.5, to: 10.5, delay: 0.1 });
      b.add({ k: 'hidden', x: 17, y: 9, w: 1, h: 1 });
      b.add({ k: 'walker', x: 21, y: 12, x1: 20, x2: 22, speed: 70 });
    }
  ),

  // Level 6: Party Hopping (Control Flip)
  build(
    6,
    {
      theme: 'flip',
      name: { bn: 'দলবদল', en: 'Party Hopping' },
      intro: {
        bn: 'এখানে সবাই দল বদলায় — এমনকি আপনার ডান-বাম-ও!',
        en: 'Everyone switches sides here — even your left and right!',
      },
      win: {
        bn: 'দিক ঠিক রাখলেন — দল ঠিক রাখলেন না!',
        en: 'You kept your direction — not your side!',
      },
    },
    (b) => {
      b.start(2, 12);
      b.exit(23, 12);
      b.gap(7, 2);
      b.spikes(12, 12, 1);
      b.wall(14, 12, 1, 1);
      b.spikes(17, 12, 2);
      b.wall(20, 10, 2, 1);
      b.gap(21, 1);
      b.sign(3, 12, 'বেগুনি জোনে ঢুকলে দল বদলে যায়!', 'Purple zones make you switch sides!');
      b.add({ k: 'flip', x: 5, y: 1, w: 5, h: 12 });
      b.add({ k: 'flip', x: 15, y: 1, w: 5, h: 12 });
      b.ballot(8, 9);
      b.ballot(18, 9);
      b.ballot(20, 8);
      b.add({ k: 'pop', x: 15, y: 12, w: 1, from: 13.2, to: 14.6, delay: 0.1 });
    }
  ),

  // Level 7: The Runaway Center (Dodging Door)
  build(
    7,
    {
      theme: 'runaway',
      name: { bn: 'পলাতক কেন্দ্র', en: 'The Runaway Center' },
      intro: {
        bn: 'ভোটকেন্দ্রও এখন ভোটারকে এড়িয়ে চলে!',
        en: 'Even the polling center now avoids voters!',
      },
      win: {
        bn: 'ধরেই ফেললেন! এমন পলায়ন কেন্দ্রও আপনার সামনে হার মানল।',
        en: 'Caught it! Even a runaway center gave up on you.',
      },
    },
    (b) => {
      b.start(1, 12);
      b.exit(23, 12);
      b.wall(3, 11, 3, 1);
      b.wall(7, 9, 3, 1);
      b.wall(11, 7, 4, 1);
      b.wall(16, 9, 3, 1);
      b.wall(20, 11, 3, 1);
      b.sign(1, 12, 'আসল কেন্দ্রের বাতি সবুজ। বাকি সব ভুয়া!', 'The real center has a GREEN lamp. The rest are fake!');
      b.fake(12, 12);
      b.fake(21, 10);
      b.add({
        k: 'dodge',
        rs: [4.2, 3.2],
        alts: [
          { x: 13, y: 6 },
          { x: 4, y: 10 },
        ],
      });
      b.ballot(8, 7);
      b.ballot(17, 7);
      b.ballot(12, 5);
    }
  ),

  // Level 8: The Ballot Trap (Grand Finale)
  build(
    8,
    {
      theme: 'final',
      name: { bn: 'ভোটের ফাঁদ', en: 'The Ballot Trap' },
      intro: {
        bn: 'শেষ কেন্দ্র। সব ফাঁদ একসাথে। শুভকামনা!',
        en: 'The last center. Every trap at once. Good luck!',
      },
      win: {
        bn: 'আপনিই চূড়ান্ত ভোটার! ফলাফল ঘোষণা: ভোটার জিতেছে।',
        en: 'You are the ultimate voter! Result: the voter wins.',
      },
      blackout: { light: 3.6, dark: 1.3 },
    },
    (b) => {
      b.start(1, 12);
      b.exit(22, 8);
      b.add({ k: 'drop', x: 3, y: 1, from: 1.4, to: 2.4 });
      b.add({ k: 'pop', x: 5, y: 12, w: 2, from: 2.5, to: 4, delay: 0.06 });
      b.add({ k: 'drop', x: 8, y: 1, from: 6.2, to: 7.6 });
      b.add({ k: 'flip', x: 10, y: 1, w: 5, h: 12 });
      b.gap(12, 2);
      b.gap(16, 4);
      b.add({ k: 'crumble', x: 16, y: 12, w: 1, delay: 0.3 });
      b.add({ k: 'ghost', x: 17, y: 11, w: 1 });
      b.add({ k: 'crumble', x: 18, y: 12, w: 1, delay: 0.3 });
      b.wall(19, 12, 1, 1);
      b.wall(20, 11, 2, 1);
      b.wall(22, 9, 2, 1);
      b.fake(23, 12);
      b.sign(1, 12, 'শেষ কেন্দ্র — সবুজ বাতি খুঁজুন!', 'The final center — look for the green lamp!');
      b.ballot(6, 10);
      b.ballot(13, 9);
      b.ballot(17, 9);
      b.add({ k: 'walker', x: 22, y: 12, x1: 21, x2: 22, speed: 50 });
    }
  ),
];
