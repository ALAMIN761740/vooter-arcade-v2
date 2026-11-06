import { T, COLS, ROWS, W, H } from './consts.ts';
import { LevelDefinition, LevelThing } from './levels.ts';

// Physics tuning (pixels / seconds)
const GRAV = 1900;
const JUMP = -650;
const RUN = 235;
const ACC = 2100;
const FRIC = 2600;
const AIRK = 0.85;
const MAXFALL = 950;
export const PW = 20;
export const PH = 28;
const DOOR_W = 32;
const DOOR_H = 48;

export type DifficultyMode = 'easy' | 'normal' | 'hard';

export interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  groundOn: LevelThing | null;
  coyote: number;
  buf: number;
  face: number;
  anim: number;
  squash: number;
}

export interface Ballot {
  x: number;
  y: number;
  got: boolean;
  ph: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  ref?: LevelThing;
}

export interface GameEvent {
  t: string;
  cause?: string;
  x?: number;
  y?: number;
}

export interface Bullet {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  rot: number;
}

export interface World {
  lv: LevelDefinition;
  difficulty: DifficultyMode;
  tiles: string[][];
  t: number;
  time: number;
  state: 'play' | 'dead' | 'win';
  stateT: number;
  events: GameEvent[];
  ballots: Ballot[];
  got: number;
  spikes: Rect[];
  waters: Rect[];
  things: LevelThing[];
  bullets: Bullet[];
  fakeDoors: Rect[];
  flipT: number;
  shake: number;
  cause: string | null;
  dark: boolean;
  darkAlpha: number;
  darkClock: number;
  intro: number;
  door: { tx: number; ty: number; poof: number };
  dodge: { i: number; rs: number[]; alts: Array<{ x: number; y: number }> } | null;
  p: Player;
  deathPos: { x: number; y: number } | null;
}

const rand = (() => {
  let s = 12345;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
})();

const ov = (a: Rect, b: Rect): boolean =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

export function doorRect(w: World): Rect {
  return { x: w.door.tx * T, y: (w.door.ty + 1) * T - DOOR_H, w: DOOR_W, h: DOOR_H };
}

export function createWorld(lv: LevelDefinition, difficulty: DifficultyMode = 'normal'): World {
  const tiles = lv.map.map((r) => r.split(''));
  const ballots: Ballot[] = [];
  const spikes: Rect[] = [];
  const waters: Rect[] = [];

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = tiles[y][x];
      if (c === 'B') {
        ballots.push({ x: x * T + 16, y: y * T + 16, got: false, ph: rand() * 6 });
        tiles[y][x] = '.';
      } else if (c === '^') {
        spikes.push({ x: x * T + 5, y: y * T + 14, w: T - 10, h: T - 14 });
      } else if (c === '~') {
        waters.push({ x: x * T, y: y * T + 10, w: T, h: T - 10 });
      }
    }
  }

  const [sx, sy] = lv.start;
  const p: Player = {
    x: sx * T + (T - PW) / 2,
    y: (sy + 1) * T - PH,
    w: PW,
    h: PH,
    vx: 0,
    vy: 0,
    onGround: false,
    groundOn: null,
    coyote: 0,
    buf: 0,
    face: 1,
    anim: 0,
    squash: 0,
  };

  const w: World = {
    lv,
    difficulty,
    tiles,
    t: 0,
    time: 0,
    state: 'play',
    stateT: 0,
    events: [],
    ballots,
    got: 0,
    spikes,
    waters,
    things: [],
    bullets: [],
    fakeDoors: lv.fakeDoors.map(([x, y]) => ({ x: x * T, y: (y + 1) * T - DOOR_H, w: DOOR_W, h: DOOR_H })),
    flipT: 0,
    shake: 0,
    cause: null,
    dark: false,
    darkAlpha: 0,
    darkClock: 0,
    intro: 2.4,
    door: { tx: lv.exit[0], ty: lv.exit[1], poof: 0 },
    dodge: null,
    p,
    deathPos: null,
  };

  for (const d of lv.things) {
    const o: LevelThing = { ...d };
    const speedMult = difficulty === 'easy' ? 0.8 : difficulty === 'hard' ? 1.25 : 1.0;

    switch (d.k) {
      case 'crumble':
      case 'ghost':
        Object.assign(o, {
          px: (d.x ?? 0) * T,
          py: (d.y ?? 0) * T,
          pw: (d.w ?? 1) * T,
          ph: T,
          st: 0,
          tm: 0,
          vy: 0,
          delay: (d.delay ?? 0.5) * (difficulty === 'easy' ? 1.3 : 1),
        });
        break;
      case 'hidden':
        Object.assign(o, {
          px: (d.x ?? 0) * T,
          py: (d.y ?? 0) * T,
          pw: (d.w ?? 1) * T,
          ph: (d.h ?? 1) * T,
          revealed: false,
        });
        break;
      case 'pop':
        Object.assign(o, {
          px: (d.x ?? 0) * T,
          py: (d.y ?? 0) * T,
          pw: (d.w ?? 1) * T,
          ph: T,
          st: 0,
          tm: 0,
          up: 0,
          delay: (d.delay ?? 0.1) * (difficulty === 'easy' ? 1.5 : 1),
        });
        break;
      case 'drop':
        Object.assign(o, {
          px: (d.x ?? 0) * T,
          py: (d.y ?? 0) * T,
          pw: T,
          ph: T,
          st: 0,
          vy: 0,
          tm: 0,
        });
        break;
      case 'walker':
        Object.assign(o, {
          px: (d.x ?? 0) * T + 4,
          py: ((d.y ?? 0) + 1) * T - 28,
          pw: 24,
          ph: 28,
          dir: 1,
          alive: true,
          deadT: 0,
          speed: (d.speed ?? 55) * speedMult,
          x1: (d.x1 ?? 0) * T,
          x2: ((d.x2 ?? 0) + 1) * T,
        });
        break;
      case 'mover': {
        const horiz = d.axis === 'x';
        const a = (horiz ? (d.x ?? 0) : (d.y ?? 0)) * T;
        const bb = (d.to ?? 0) * T;
        Object.assign(o, {
          px: (d.x ?? 0) * T,
          py: (d.y ?? 0) * T,
          pw: (d.w ?? 1) * T,
          ph: 18,
          speed: (d.speed ?? 55) * speedMult,
          a: Math.min(a, bb),
          b: Math.max(a, bb),
          dir: bb >= a ? 1 : -1,
          dx: 0,
          dy: 0,
        });
        break;
      }
      case 'shooter':
        Object.assign(o, {
          px: (d.x ?? 0) * T,
          py: (d.y ?? 0) * T,
          pw: T,
          ph: T,
          speed: (d.speed ?? 270) * speedMult,
          tm: d.offset || 0,
          arm: 0,
        });
        break;
      case 'flip':
        Object.assign(o, {
          px: (d.x ?? 0) * T,
          py: (d.y ?? 0) * T,
          pw: (d.w ?? 1) * T,
          ph: (d.h ?? 1) * T,
        });
        break;
      case 'dodge':
        if (d.rs && d.alts) {
          w.dodge = { i: 0, rs: d.rs, alts: d.alts };
        }
        break;
    }
    if (d.k !== 'dodge') w.things.push(o);
  }
  return w;
}

function solidTile(w: World, tx: number, ty: number): boolean {
  if (tx < 0 || tx >= COLS || ty < 0) return true;
  if (ty >= ROWS) return false;
  return w.tiles[ty][tx] === '#';
}

function dynSolids(w: World): Rect[] {
  const list: Rect[] = [];
  for (const o of w.things) {
    if (o.k === 'crumble' && (o.st ?? 0) < 2) {
      list.push({ x: o.px!, y: o.py!, w: o.pw!, h: o.ph!, ref: o });
    } else if (o.k === 'hidden') {
      list.push({ x: o.px!, y: o.py!, w: o.pw!, h: o.ph!, ref: o });
    } else if (o.k === 'drop' && o.st === 2) {
      list.push({ x: o.px!, y: o.py!, w: o.pw!, h: o.ph!, ref: o });
    } else if (o.k === 'mover') {
      list.push({ x: o.px!, y: o.py!, w: o.pw!, h: o.ph!, ref: o });
    }
  }
  return list;
}

function collide(w: World, r: Rect, dyn: Rect[]): Rect[] {
  const out: Rect[] = [];
  const x0 = Math.floor(r.x / T);
  const x1 = Math.floor((r.x + r.w - 0.001) / T);
  const y0 = Math.floor(r.y / T);
  const y1 = Math.floor((r.y + r.h - 0.001) / T);
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      if (solidTile(w, tx, ty)) out.push({ x: tx * T, y: ty * T, w: T, h: T });
    }
  }
  for (const d of dyn) {
    if (ov(r, d)) out.push(d);
  }
  return out;
}

function reveal(w: World, o: LevelThing): void {
  if (!o.revealed) {
    o.revealed = true;
    w.events.push({ t: 'bump' });
  }
}

function moveX(w: World, p: Player, dx: number, dyn: Rect[]): void {
  p.x += dx;
  for (const s of collide(w, p, dyn)) {
    if (dx > 0) p.x = Math.min(p.x, s.x - p.w);
    else if (dx < 0) p.x = Math.max(p.x, s.x + s.w);
    p.vx = 0;
    if (s.ref && s.ref.k === 'hidden') reveal(w, s.ref);
  }
}

function moveY(w: World, p: Player, dy: number, dyn: Rect[]): void {
  p.y += dy;
  p.onGround = false;
  p.groundOn = null;
  for (const s of collide(w, p, dyn)) {
    if (dy > 0) {
      p.y = Math.min(p.y, s.y - p.h);
      p.vy = 0;
      p.onGround = true;
      p.groundOn = s.ref || null;
    } else if (dy < 0) {
      p.y = Math.max(p.y, s.y + s.h);
      p.vy = 0;
      if (s.ref && s.ref.k === 'hidden') reveal(w, s.ref);
    }
  }
}

export function kill(w: World, cause: string): void {
  if (w.state !== 'play') return;
  w.state = 'dead';
  w.stateT = 0;
  w.cause = cause;
  w.deathPos = { x: w.p.x + w.p.w / 2, y: w.p.y + w.p.h / 2 };
  w.shake = 0.28;
  w.p.vy = -420;
  w.events.push({ t: 'die', cause, x: w.deathPos.x, y: w.deathPos.y });
}

export function step(w: World, inp: { left: boolean; right: boolean; jump: boolean; jumpPressed: boolean }, dt: number): void {
  w.t += dt;
  w.shake = Math.max(0, w.shake - dt);
  if (w.intro > 0) w.intro -= dt;
  if (w.door.poof > 0) w.door.poof -= dt;
  const p = w.p;

  if (w.state === 'dead') {
    w.stateT += dt;
    p.vy = Math.min(MAXFALL, p.vy + GRAV * dt);
    p.y += p.vy * dt;
    p.anim += dt * 10;
    updateThings(w, dt, true);
    return;
  }
  if (w.state === 'win') {
    w.stateT += dt;
    p.anim += dt * 8;
    return;
  }

  w.time += dt;

  // blackout cycle
  if (w.lv.blackout) {
    const { light, dark } = w.lv.blackout;
    w.darkClock += dt;
    const ph = w.darkClock % (light + dark);
    const d = ph >= light;
    if (d !== w.dark) {
      w.dark = d;
      w.events.push({ t: d ? 'dark' : 'light' });
    }
    const target = w.dark ? 1 : 0;
    w.darkAlpha += (target - w.darkAlpha) * Math.min(1, dt * 9);
  }

  updateThings(w, dt, false);

  // carried by moving platform
  if (p.groundOn && p.groundOn.k === 'mover' && p.groundOn.dx !== undefined && p.groundOn.dy !== undefined) {
    p.x += p.groundOn.dx;
    p.y += p.groundOn.dy;
  }

  // input & physics
  let dir = (inp.right ? 1 : 0) - (inp.left ? 1 : 0);
  if (w.flipT > 0) dir = -dir;
  const target = dir * RUN;
  const a = (dir !== 0 ? ACC : FRIC) * (p.onGround ? 1 : AIRK);
  if (p.vx < target) p.vx = Math.min(target, p.vx + a * dt);
  else if (p.vx > target) p.vx = Math.max(target, p.vx - a * dt);
  if (dir !== 0) p.face = dir;

  const coyoteBonus = w.difficulty === 'easy' ? 0.14 : 0.1;
  p.coyote = p.onGround ? coyoteBonus : p.coyote - dt;
  p.buf = inp.jumpPressed ? 0.12 : p.buf - dt;

  if (p.buf > 0 && p.coyote > 0) {
    p.vy = w.difficulty === 'easy' ? JUMP * 1.05 : JUMP;
    p.buf = 0;
    p.coyote = 0;
    p.onGround = false;
    p.groundOn = null;
    p.squash = -1;
    w.events.push({ t: 'jump' });
  }
  if (!inp.jump && p.vy < -240) p.vy += GRAV * dt * 2.4;
  p.vy = Math.min(MAXFALL, p.vy + GRAV * dt);

  const wasAir = !p.onGround;
  const dyn = dynSolids(w);
  moveX(w, p, p.vx * dt, dyn);
  moveY(w, p, p.vy * dt, dyn);
  if (wasAir && p.onGround) {
    p.squash = 1;
    w.events.push({ t: 'land' });
  }
  p.squash *= 0.86;
  p.anim += dt * (p.onGround ? Math.abs(p.vx) / 18 : 4);

  // crumbling platform triggers
  if (p.groundOn && p.groundOn.k === 'crumble' && p.groundOn.st === 0) {
    p.groundOn.st = 1;
    p.groundOn.tm = 0;
    w.events.push({ t: 'crumble' });
  }

  const pc = { x: p.x + p.w / 2, y: p.y + p.h / 2 };
  const hb: Rect = { x: p.x + 3, y: p.y + 3, w: p.w - 6, h: p.h - 5 };

  // triggers
  for (const o of w.things) {
    if (o.k === 'pop' && o.st === 0 && pc.x >= (o.from ?? 0) * T && pc.x <= (o.to ?? 0) * T) {
      o.st = 1;
      o.tm = 0;
    }
    if (o.k === 'drop' && o.st === 0 && pc.x >= (o.from ?? 0) * T && pc.x <= (o.to ?? 0) * T && pc.y > o.py!) {
      o.st = 1;
      w.events.push({ t: 'dropstart' });
    }
    if (o.k === 'flip' && ov(hb, { x: o.px!, y: o.py!, w: o.pw!, h: o.ph! })) {
      if (w.flipT <= 0) w.events.push({ t: 'flip' });
      w.flipT = 0.8;
    }
  }
  if (w.flipT > 0) w.flipT -= dt;

  // ballots
  for (const b of w.ballots) {
    if (!b.got && Math.hypot(b.x - pc.x, b.y - pc.y) < 24) {
      b.got = true;
      w.got++;
      w.events.push({ t: 'ballot', x: b.x, y: b.y });
    }
  }

  // dodging door
  if (w.dodge && w.dodge.i < w.dodge.alts.length) {
    const dr = doorRect(w);
    const dist = Math.hypot(dr.x + dr.w / 2 - pc.x, dr.y + dr.h / 2 - pc.y);
    if (dist < w.dodge.rs[w.dodge.i] * T) {
      const alt = w.dodge.alts[w.dodge.i];
      w.door.tx = alt.x;
      w.door.ty = alt.y;
      w.door.poof = 0.6;
      w.dodge.i++;
      w.events.push({ t: 'dodge' });
    }
  }

  // hazards
  if (p.y > H + 30) kill(w, 'pit');
  for (const s of w.spikes) if (ov(hb, s)) kill(w, 'spike');
  for (const s of w.waters) if (ov(hb, s)) kill(w, 'water');

  for (const o of w.things) {
    if (o.k === 'pop' && (o.up ?? 0) > 0.55) {
      const r = { x: o.px! + 5, y: o.py! + T - o.up! * (T - 4), w: o.pw! - 10, h: o.up! * (T - 4) };
      if (ov(hb, r)) kill(w, 'spike');
    } else if (o.k === 'drop' && o.st === 1) {
      if (ov(hb, { x: o.px! + 2, y: o.py! + 2, w: o.pw! - 4, h: o.ph! - 2 })) kill(w, 'drop');
    } else if (o.k === 'walker' && o.alive) {
      const r = { x: o.px! + 2, y: o.py! + 2, w: o.pw! - 4, h: o.ph! - 2 };
      if (ov(hb, r)) {
        if (p.vy > 60 && p.y + p.h - 10 < o.py! + 12) {
          o.alive = false;
          o.deadT = 0;
          p.vy = -470;
          p.onGround = false;
          w.events.push({ t: 'stomp' });
        } else {
          kill(w, 'walker');
        }
      }
    }
  }

  for (const b of w.bullets) {
    if (ov(hb, { x: b.x, y: b.y, w: b.w, h: b.h })) kill(w, 'brick');
  }

  for (const f of w.fakeDoors) {
    if (ov(hb, { x: f.x + 4, y: f.y + 6, w: f.w - 8, h: f.h - 6 })) kill(w, 'fakedoor');
  }

  // win condition
  if (w.state === 'play') {
    const d = doorRect(w);
    if (ov(hb, { x: d.x + 4, y: d.y + 6, w: d.w - 8, h: d.h - 6 })) {
      w.state = 'win';
      w.stateT = 0;
      w.events.push({ t: 'win' });
    }
  }
}

function updateThings(w: World, dt: number, frozen: boolean): void {
  for (const o of w.things) {
    switch (o.k) {
      case 'crumble':
        if (o.st === 1) {
          o.tm = (o.tm ?? 0) + dt;
          if (o.tm >= (o.delay ?? 0.5)) {
            o.st = 2;
            o.vy = 0;
          }
        } else if (o.st === 2) {
          o.vy = (o.vy ?? 0) + GRAV * dt;
          o.py = (o.py ?? 0) + o.vy * dt;
          if (o.py > H + 80) o.st = 3;
        }
        break;
      case 'pop':
        if (o.st === 1) {
          o.tm = (o.tm ?? 0) + dt;
          if (o.tm >= (o.delay || 0.1)) {
            o.st = 2;
            w.events.push({ t: 'pop' });
          }
        } else if (o.st === 2) {
          o.up = Math.min(1, (o.up ?? 0) + dt * 9);
        }
        break;
      case 'drop':
        if (o.st === 1) {
          o.vy = Math.min(1100, (o.vy ?? 0) + 3200 * dt);
          o.py = (o.py ?? 0) + o.vy * dt;
          const r: Rect = { x: o.px! + 2, y: o.py!, w: o.pw! - 4, h: o.ph! };
          const hit = collide(w, r, []).concat(
            dynSolids(w).filter((d) => d.ref !== o && ov(r, d))
          );
          if (hit.length) {
            const top = Math.min(...hit.map((s) => s.y));
            o.py = top - o.ph!;
            o.st = 2;
            o.vy = 0;
            w.shake = Math.max(w.shake, 0.22);
            w.events.push({ t: 'thud' });
          }
        }
        break;
      case 'walker':
        if (o.alive && !frozen) {
          o.px = (o.px ?? 0) + (o.dir ?? 1) * (o.speed ?? 55) * dt;
          if (o.px < (o.x1 ?? 0)) {
            o.px = o.x1;
            o.dir = 1;
          } else if (o.px + (o.pw ?? 24) > (o.x2 ?? W)) {
            o.px = o.x2! - o.pw!;
            o.dir = -1;
          }
        } else if (!o.alive) {
          o.deadT = (o.deadT ?? 0) + dt;
        }
        break;
      case 'mover': {
        if (frozen) {
          o.dx = 0;
          o.dy = 0;
          break;
        }
        const horiz = o.axis === 'x';
        const cur = horiz ? o.px! : o.py!;
        let nxt = cur + (o.dir ?? 1) * (o.speed ?? 55) * dt;
        if (nxt >= (o.b ?? 0)) {
          nxt = o.b!;
          o.dir = -1;
        } else if (nxt <= (o.a ?? 0)) {
          nxt = o.a!;
          o.dir = 1;
        }
        const d = nxt - cur;
        if (horiz) {
          o.px = nxt;
          o.dx = d;
          o.dy = 0;
        } else {
          o.py = nxt;
          o.dy = d;
          o.dx = 0;
        }
        break;
      }
      case 'shooter':
        if (!frozen) {
          o.tm = (o.tm ?? 0) + dt;
          o.arm = Math.max(0, (o.arm ?? 0) - dt * 3);
          if (o.tm >= (o.period ?? 1.8)) {
            o.tm -= o.period ?? 1.8;
            o.arm = 1;
            w.bullets.push({
              x: (o.dir ?? 1) < 0 ? o.px! - 14 : o.px! + T,
              y: o.py! + T - 24,
              w: 16,
              h: 14,
              vx: (o.dir ?? 1) * (o.speed ?? 270),
              rot: 0,
            });
            w.events.push({ t: 'shoot' });
          }
        }
        break;
    }
  }

  // update bullets
  for (let i = w.bullets.length - 1; i >= 0; i--) {
    const b = w.bullets[i];
    b.x += b.vx * dt;
    b.rot += dt * 14 * Math.sign(b.vx);
    const cx = Math.floor((b.vx < 0 ? b.x : b.x + b.w) / T);
    const cy = Math.floor((b.y + b.h / 2) / T);
    if (b.x < -20 || b.x > W + 20 || solidTile(w, cx, cy)) {
      w.bullets.splice(i, 1);
    }
  }
}
