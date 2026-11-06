import { T, ROWS, COLS, W, H } from './consts.ts';
import { doorRect, World, Player, Rect } from './engine.ts';
import { LevelSign, LevelThing } from './levels.ts';

interface ThemeColors {
  top: string;
  bot: string;
  ground: string;
  grass: string;
  wall: string;
  far: string;
  far2: string;
  sun: string;
}

const THEMES: Record<string, ThemeColors> = {
  school: { top: '#7ec8f0', bot: '#d9f1ff', ground: '#8a5a33', grass: '#3fae4a', wall: '#a9683a', far: '#9fd3a0', far2: '#7fbf86', sun: '#ffe36b' },
  bridge: { top: '#f7a35c', bot: '#ffe3a3', ground: '#7a4a2a', grass: '#8bb83a', wall: '#8f5a33', far: '#d98c5f', far2: '#c4744a', sun: '#fff1b0' },
  hartal: { top: '#6d6a72', bot: '#d4a373', ground: '#4e4a4f', grass: '#7a7d52', wall: '#5c565c', far: '#8a7f86', far2: '#6e656d', sun: '#ffb25b' },
  flood: { top: '#7aa7b8', bot: '#cfe6df', ground: '#6a5a45', grass: '#5e9a64', wall: '#7b6a55', far: '#8fb7ad', far2: '#76a39b', sun: '#f0f5d0' },
  night: { top: '#0a1030', bot: '#233a6b', ground: '#2d2a3d', grass: '#2f6b52', wall: '#3b3752', far: '#1b2850', far2: '#141e3f', sun: '#f4f1d0' },
  flip: { top: '#5a3d9c', bot: '#f5a4d8', ground: '#4b3a6b', grass: '#a56bd8', wall: '#5e4a86', far: '#8a62b8', far2: '#6d4a9b', sun: '#ffe6fb' },
  runaway: { top: '#ff8fb1', bot: '#ffe3d1', ground: '#7a3d4a', grass: '#59b36b', wall: '#8c4a58', far: '#e07a97', far2: '#c8627f', sun: '#fff3c4' },
  final: { top: '#3a0d14', bot: '#d9482e', ground: '#2a1317', grass: '#8b1d2c', wall: '#44212a', far: '#6a1a24', far2: '#4a121a', sun: '#ffd1a1' },
};

let darkOffscreenCanvas: HTMLCanvasElement | null = null;
function getDarkCanvas(): HTMLCanvasElement {
  if (!darkOffscreenCanvas && typeof document !== 'undefined') {
    darkOffscreenCanvas = document.createElement('canvas');
    darkOffscreenCanvas.width = W;
    darkOffscreenCanvas.height = H;
  }
  return darkOffscreenCanvas!;
}

const font = (px: number, wt: number | string = 700) => `${wt} ${px}px "Hind Siliguri", "Plus Jakarta Sans", system-ui, sans-serif`;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground(ctx: CanvasRenderingContext2D, w: World, th: ThemeColors, t: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, th.top);
  g.addColorStop(1, th.bot);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // sun / moon
  ctx.fillStyle = th.sun;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(660, 90, 38, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // drifting clouds
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let i = 0; i < 4; i++) {
    const cx = ((i * 230 + t * 6 * (1 + i * 0.2)) % (W + 160)) - 80;
    const cy = 60 + i * 28;
    ctx.beginPath();
    ctx.arc(cx, cy, 20, 0, Math.PI * 2);
    ctx.arc(cx + 22, cy - 8, 25, 0, Math.PI * 2);
    ctx.arc(cx + 48, cy, 19, 0, Math.PI * 2);
    ctx.fill();
  }

  // far hills
  ctx.fillStyle = th.far;
  ctx.beginPath();
  ctx.moveTo(0, 400);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 330 + Math.sin(x * 0.011) * 26);
  ctx.lineTo(W, 420);
  ctx.lineTo(0, 420);
  ctx.fill();

  ctx.fillStyle = th.far2;
  ctx.beginPath();
  ctx.moveTo(0, 420);
  for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 366 + Math.sin(x * 0.017 + 2) * 18);
  ctx.lineTo(W, 430);
  ctx.lineTo(0, 430);
  ctx.fill();

  // tin-roof houses + palms silhouette
  ctx.fillStyle = th.far2;
  for (let i = 0; i < 6; i++) {
    const hx = 40 + i * 135 + ((i * 37) % 30);
    const hy = 372;
    ctx.fillRect(hx, hy, 46, 34);
    ctx.beginPath();
    ctx.moveTo(hx - 6, hy);
    ctx.lineTo(hx + 23, hy - 18);
    ctx.lineTo(hx + 52, hy);
    ctx.fill();
  }
  ctx.strokeStyle = th.far2;
  ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) {
    const px = 120 + i * 210;
    ctx.beginPath();
    ctx.moveTo(px, 410);
    ctx.quadraticCurveTo(px + 6, 360, px + 2, 330);
    ctx.stroke();
    ctx.beginPath();
    for (let k = -2; k <= 2; k++) {
      ctx.moveTo(px + 2, 330);
      ctx.quadraticCurveTo(px + 2 + k * 14, 316, px + 2 + k * 24, 338);
    }
    ctx.stroke();
  }

  // election bunting
  const cols = ['#e63946', '#ffd166', '#06a77d', '#ffffff', '#118ab2'];
  ctx.lineWidth = 1.5;
  for (let s = 0; s < 3; s++) {
    const x0 = s * (W / 3);
    const x1 = x0 + W / 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.moveTo(x0, 36);
    ctx.quadraticCurveTo((x0 + x1) / 2, 74, x1, 36);
    ctx.stroke();
    for (let i = 1; i < 11; i++) {
      const u = i / 11;
      const bx = x0 + (x1 - x0) * u;
      const by = 36 + 2 * (1 - u) * u * 38 + Math.sin(t * 2 + i + s) * 1.2;
      ctx.fillStyle = cols[(i + s) % cols.length];
      ctx.beginPath();
      ctx.moveTo(bx - 7, by);
      ctx.lineTo(bx + 7, by);
      ctx.lineTo(bx, by + 15);
      ctx.fill();
    }
  }
}

function drawTiles(ctx: CanvasRenderingContext2D, w: World, th: ThemeColors): void {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const c = w.tiles[y][x];
      const px = x * T;
      const py = y * T;
      if (c === '#') {
        const border = x === 0 || x === COLS - 1 || y === 0;
        ctx.fillStyle = border ? th.wall : th.ground;
        ctx.fillRect(px, py, T, T);
        ctx.fillStyle = 'rgba(0,0,0,0.12)';
        ctx.fillRect(px, py + T - 3, T, 3);
        ctx.fillRect(px + T - 2, py, 2, T);
        ctx.fillStyle = 'rgba(255,255,255,0.07)';
        ctx.fillRect(px + 3, py + 6, 6, 3);
        ctx.fillRect(px + 17, py + 18, 8, 3);
        const above = y > 0 ? w.tiles[y - 1][x] : '#';
        if (above !== '#' && !border) {
          ctx.fillStyle = th.grass;
          ctx.fillRect(px, py, T, 7);
          ctx.fillStyle = 'rgba(255,255,255,0.18)';
          ctx.fillRect(px, py, T, 2);
        }
      } else if (c === '^') {
        ctx.fillStyle = '#e9edf2';
        for (let i = 0; i < 3; i++) {
          const sx = px + 3 + i * 9;
          ctx.beginPath();
          ctx.moveTo(sx, py + T);
          ctx.lineTo(sx + 5, py + 12);
          ctx.lineTo(sx + 10, py + T);
          ctx.fill();
        }
        ctx.fillStyle = '#d32f3f';
        ctx.fillRect(px + 2, py + T - 5, T - 4, 5);
      }
    }
  }
}

function drawWater(ctx: CanvasRenderingContext2D, w: World, t: number): void {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (w.tiles[y][x] !== '~') continue;
      const px = x * T;
      const py = y * T;
      ctx.fillStyle = 'rgba(46,134,171,0.82)';
      ctx.fillRect(px, py + 8, T, T - 8);
      ctx.fillStyle = 'rgba(180,230,245,0.9)';
      ctx.beginPath();
      ctx.moveTo(px, py + 10);
      for (let i = 0; i <= 8; i++) {
        ctx.lineTo(px + i * 4, py + 8 + Math.sin(t * 3 + (px + i * 4) * 0.08) * 2.5);
      }
      ctx.lineTo(px + T, py + 14);
      ctx.lineTo(px, py + 14);
      ctx.fill();
    }
  }
}

export function drawVoter(ctx: CanvasRenderingContext2D, p: Player, t: number, dead: boolean, opts: { cheer?: boolean } = {}): void {
  const cx = p.x + p.w / 2;
  const fy = p.y + p.h;
  ctx.save();
  ctx.translate(cx, fy);
  if (dead) ctx.rotate(Math.sin(t * 14) * 0.5 + 0.6);
  const sq = p.squash || 0;
  ctx.scale(p.face * (1 - sq * 0.08), 1 + sq * 0.12);
  const run = p.onGround && Math.abs(p.vx) > 20;
  const sw = run ? Math.sin(p.anim) : 0;
  const air = !p.onGround;

  // shadow
  if (!dead) {
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // legs
  ctx.strokeStyle = '#2b3a67';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  const l1 = air ? -5 : sw * 6;
  const l2 = air ? 5 : -sw * 6;
  ctx.beginPath();
  ctx.moveTo(-3, -11);
  ctx.lineTo(-3 + l1, -2);
  ctx.moveTo(3, -11);
  ctx.lineTo(3 + l2, -2);
  ctx.stroke();

  // shoes
  ctx.fillStyle = '#222';
  ctx.fillRect(-6 + l1, -3, 7, 3);
  ctx.fillRect(0 + l2, -3, 7, 3);

  // body: white panjabi
  ctx.fillStyle = '#f7f4ea';
  roundRect(ctx, -8, -23, 16, 15, 5);
  ctx.fill();
  ctx.fillStyle = '#0a8f4a';
  ctx.fillRect(-8, -9, 16, 2);

  // arm
  ctx.strokeStyle = '#f7f4ea';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(5, -20);
  if (air || opts.cheer) ctx.lineTo(10, -30 + (opts.cheer ? Math.sin(t * 12) * 3 : 0));
  else ctx.lineTo(8 + sw * 2, -13);
  ctx.stroke();

  // inked purple finger!
  if (air || opts.cheer) {
    ctx.fillStyle = '#6a2bd9';
    ctx.beginPath();
    ctx.arc(10, -32 + (opts.cheer ? Math.sin(t * 12) * 3 : 0), 2.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#d9a37a';
    ctx.beginPath();
    ctx.arc(8 + sw * 2, -12, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // head
  ctx.fillStyle = '#d9a37a';
  ctx.beginPath();
  ctx.arc(0, -29, 8, 0, Math.PI * 2);
  ctx.fill();

  // hair
  ctx.fillStyle = '#17120f';
  ctx.beginPath();
  ctx.arc(0, -31, 8.2, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-8.2, -32, 3, 5);

  // eyes
  if (dead) {
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(1, -31);
    ctx.lineTo(5, -27);
    ctx.moveTo(5, -31);
    ctx.lineTo(1, -27);
    ctx.stroke();
  } else {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(3.2, -29.5, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(4, -29.5, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // mustache
  ctx.fillStyle = '#17120f';
  ctx.fillRect(1, -26, 6, 1.6);
  ctx.restore();
}

function drawCadre(ctx: CanvasRenderingContext2D, o: LevelThing, t: number): void {
  const cx = (o.px ?? 0) + (o.pw ?? 24) / 2;
  const fy = (o.py ?? 0) + (o.ph ?? 28);
  ctx.save();
  ctx.translate(cx, fy);
  if (!o.alive) {
    ctx.scale(1, Math.max(0.15, 1 - (o.deadT ?? 0) * 4));
    ctx.globalAlpha = Math.max(0, 1 - (o.deadT ?? 0) * 1.4);
  }
  ctx.scale(o.dir ?? 1, 1);
  const sw = Math.sin(t * 9 + (o.px ?? 0) * 0.05);
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-4, -11);
  ctx.lineTo(-4 + sw * 5, -1);
  ctx.moveTo(4, -11);
  ctx.lineTo(4 - sw * 5, -1);
  ctx.stroke();
  ctx.fillStyle = '#b3202e';
  roundRect(ctx, -10, -25, 20, 16, 5);
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.fillRect(-10, -17, 20, 2.5);

  // club
  ctx.strokeStyle = '#7a4a22';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(9, -16);
  ctx.lineTo(15, -30 + sw * 2);
  ctx.stroke();

  // head & sunglasses
  ctx.fillStyle = '#c98f66';
  ctx.beginPath();
  ctx.arc(0, -31, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(0, -33, 9.3, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(-1, -35, 12, 3);

  ctx.fillStyle = '#000';
  ctx.fillRect(0, -33, 10, 4.5);
  ctx.fillRect(-4, -32.5, 4, 1.2);

  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-1, -26);
  ctx.lineTo(6, -25);
  ctx.stroke();
  ctx.restore();
}

function drawThrower(ctx: CanvasRenderingContext2D, o: LevelThing): void {
  const cx = (o.px ?? 0) + 16;
  const fy = (o.py ?? 0) + T;
  ctx.save();
  ctx.translate(cx, fy);
  ctx.scale(-(o.dir ?? 1), 1);
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(-6, -12, 4, 12);
  ctx.fillRect(2, -12, 4, 12);
  ctx.fillStyle = '#e9a23b';
  roundRect(ctx, -9, -27, 18, 17, 5);
  ctx.fill();

  ctx.strokeStyle = '#e9a23b';
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(6, -23);
  ctx.lineTo(12 + (o.arm ?? 0) * 2, -30 + (o.arm ?? 0) * -14 + 10);
  ctx.stroke();

  ctx.fillStyle = '#c98f66';
  ctx.beginPath();
  ctx.arc(0, -34, 8.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#d62839';
  ctx.fillRect(-8.5, -33, 17, 6);
  ctx.fillStyle = '#fff';
  ctx.fillRect(1, -36, 5, 3);
  ctx.fillStyle = '#111';
  ctx.fillRect(3, -35.2, 2, 2);
  ctx.restore();
}

function drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, angry: boolean, rot: number = 0): void {
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot);
  ctx.fillStyle = '#b8472f';
  ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.strokeStyle = '#7e2c1b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-w / 2 + 0.75, -h / 2 + 0.75, w - 1.5, h - 1.5);
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.lineTo(w / 2, 0);
  ctx.moveTo(-w / 6, -h / 2);
  ctx.lineTo(-w / 6, 0);
  ctx.moveTo(w / 6, 0);
  ctx.lineTo(w / 6, h / 2);
  ctx.stroke();

  if (angry) {
    ctx.fillStyle = '#fff';
    ctx.fillRect(-9, -8, 6, 6);
    ctx.fillRect(3, -8, 6, 6);
    ctx.fillStyle = '#111';
    ctx.fillRect(-7, -6, 3, 4);
    ctx.fillRect(5, -6, 3, 4);
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, -11);
    ctx.lineTo(-2, -8);
    ctx.moveTo(10, -11);
    ctx.lineTo(2, -8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDoor(ctx: CanvasRenderingContext2D, r: Rect, t: number, real: boolean, poof: number): void {
  ctx.save();
  ctx.translate(r.x, r.y);
  ctx.fillStyle = '#2f6f5e';
  roundRect(ctx, 0, 6, 32, 42, 4);
  ctx.fill();
  ctx.fillStyle = '#e8f3ee';
  roundRect(ctx, 4, 12, 24, 30, 3);
  ctx.fill();

  ctx.fillStyle = '#17352c';
  ctx.fillRect(8, 16, 16, 4);

  // ballot sticking out
  ctx.fillStyle = '#fff';
  ctx.fillRect(12, 8 + Math.sin(t * 3) * 1, 8, 10);
  ctx.strokeStyle = '#6a2bd9';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(14, 12);
  ctx.lineTo(18, 15);
  ctx.moveTo(18, 12);
  ctx.lineTo(14, 15);
  ctx.stroke();

  ctx.fillStyle = '#17352c';
  ctx.font = font(10, 700);
  ctx.textAlign = 'center';
  ctx.fillText('ভোট', 16, 36);

  const lampOn = Math.sin(t * 5) > -0.3;
  ctx.fillStyle = real ? (lampOn ? '#22e06b' : '#14803d') : lampOn ? '#ff3b3b' : '#8a1d1d';
  ctx.beginPath();
  ctx.arc(16, 3, 4.5, 0, Math.PI * 2);
  ctx.fill();

  if (real) {
    ctx.fillStyle = 'rgba(34,224,107,0.18)';
    ctx.beginPath();
    ctx.arc(16, 3, 11 + Math.sin(t * 5) * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  if (poof > 0) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, poof * 2);
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9 + t * 3;
      const d = (0.6 - poof) * 60 + 6;
      ctx.beginPath();
      ctx.arc(r.x + 16 + Math.cos(a) * d, r.y + 24 + Math.sin(a) * d, 6 * poof + 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawSign(ctx: CanvasRenderingContext2D, s: LevelSign, lang: 'bn' | 'en'): void {
  const text = s[lang] || s.bn;
  const px = s.x * T + 16;
  const fy = (s.y + 1) * T;
  ctx.save();
  ctx.font = font(12.5, 600);
  const maxW = 150;
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const wd of words) {
    const test = line ? line + ' ' + wd : wd;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = wd;
    } else line = test;
  }
  lines.push(line);
  const bw = Math.min(maxW + 14, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 14);
  const bh = lines.length * 16 + 10;
  let bx = px - bw / 2;
  bx = Math.max(6, Math.min(W - bw - 6, bx));
  const by = fy - 46 - bh;
  ctx.fillStyle = '#6b4423';
  ctx.fillRect(px - 2, by + bh, 4, 46);
  ctx.fillStyle = '#f3dfb2';
  roundRect(ctx, bx, by, bw, bh, 5);
  ctx.fill();
  ctx.strokeStyle = '#6b4423';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#3a2410';
  ctx.textAlign = 'center';
  lines.forEach((l, i) => ctx.fillText(l, bx + bw / 2, by + 17 + i * 16));
  ctx.restore();
}

function drawPlank(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number, ph: number, th: ThemeColors, shake: number = 0): void {
  ctx.save();
  ctx.translate(shake, 0);
  ctx.fillStyle = '#b07a3f';
  ctx.fillRect(px, py, pw, ph);
  ctx.fillStyle = th.grass;
  ctx.fillRect(px, py, pw, 7);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fillRect(px, py + ph - 3, pw, 3);
  ctx.fillStyle = '#4a2f12';
  for (let x = px + 6; x < px + pw; x += T) {
    ctx.beginPath();
    ctx.arc(x, py + 17, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function draw(ctx: CanvasRenderingContext2D, w: World, opts: { tombs?: Array<{ x: number; y: number }>; lang?: 'bn' | 'en' }): void {
  const { tombs = [], lang = 'bn' } = opts;
  const th = THEMES[w.lv.theme] || THEMES.school;
  const t = w.t;
  ctx.save();
  if (w.shake > 0) {
    ctx.translate((Math.random() - 0.5) * 7 * w.shake * 3, (Math.random() - 0.5) * 7 * w.shake * 3);
  }

  drawBackground(ctx, w, th, t);
  drawTiles(ctx, w, th);

  for (const s of w.lv.signs) drawSign(ctx, s, lang);

  // tombstones
  for (const g of tombs) {
    ctx.save();
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = '#d6d2c8';
    roundRect(ctx, g.x - 6, g.y - 8, 12, 16, 5);
    ctx.fill();
    ctx.strokeStyle = '#7d786c';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.strokeStyle = '#a02b2b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(g.x - 3, g.y - 3);
    ctx.lineTo(g.x + 3, g.y + 3);
    ctx.moveTo(g.x + 3, g.y - 3);
    ctx.lineTo(g.x - 3, g.y + 3);
    ctx.stroke();
    ctx.restore();
  }

  // flip zones
  for (const o of w.things) {
    if (o.k !== 'flip') continue;
    ctx.save();
    const a = 0.16 + Math.sin(t * 3) * 0.04;
    ctx.fillStyle = `rgba(150,60,230,${a})`;
    ctx.fillRect(o.px!, o.py!, o.pw!, o.ph!);
    ctx.strokeStyle = 'rgba(180,90,255,0.55)';
    ctx.setLineDash([8, 6]);
    ctx.lineDashOffset = -t * 20;
    ctx.lineWidth = 2;
    ctx.strokeRect(o.px! + 1, o.py! + 1, o.pw! - 2, o.ph! - 2);
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(210,150,255,0.7)';
    ctx.font = font(26, 700);
    ctx.textAlign = 'center';
    for (let i = 0; i < Math.floor(o.pw! / 80) + 1; i++) {
      const ax = o.px! + 40 + i * 80;
      ctx.fillText('⇄', ax, o.py! + o.ph! - 14 + Math.sin(t * 2 + i) * 4);
    }
    ctx.restore();
  }

  // dynamic platforms and traps
  for (const o of w.things) {
    switch (o.k) {
      case 'crumble':
        if ((o.st ?? 0) < 3) {
          drawPlank(ctx, o.px!, o.py!, o.pw!, o.ph!, th, o.st === 1 ? Math.sin(t * 70) * 1.6 : 0);
        }
        break;
      case 'ghost':
        drawPlank(ctx, o.px!, o.py!, o.pw!, o.ph!, th);
        break;
      case 'hidden':
        if (o.revealed) {
          ctx.fillStyle = '#c1873a';
          ctx.fillRect(o.px!, o.py!, o.pw!, o.ph!);
          ctx.strokeStyle = '#6b4423';
          ctx.lineWidth = 2;
          ctx.strokeRect(o.px! + 1, o.py! + 1, o.pw! - 2, o.ph! - 2);
        }
        break;
      case 'pop':
        if ((o.up ?? 0) > 0) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(o.px!, o.py!, o.pw!, T);
          ctx.clip();
          const n = Math.round(o.pw! / 10);
          for (let i = 0; i < n; i++) {
            const sx = o.px! + (i * o.pw!) / n;
            const sw = o.pw! / n;
            const top = o.py! + T - o.up! * (T - 3);
            ctx.fillStyle = '#e9edf2';
            ctx.beginPath();
            ctx.moveTo(sx + 1, o.py! + T);
            ctx.lineTo(sx + sw / 2, top);
            ctx.lineTo(sx + sw - 1, o.py! + T);
            ctx.fill();
          }
          ctx.restore();
        }
        break;
      case 'drop':
        drawBrick(ctx, o.px!, o.py!, o.pw!, o.ph!, (o.st ?? 0) < 2);
        break;
      case 'walker':
        drawCadre(ctx, o, t);
        break;
      case 'mover': {
        const boat = o.axis === 'x';
        ctx.fillStyle = boat ? '#7a4f2a' : '#8d8d8d';
        roundRect(ctx, o.px!, o.py!, o.pw!, o.ph!, 6);
        ctx.fill();
        ctx.fillStyle = boat ? '#e0b46b' : '#c9c9c9';
        ctx.fillRect(o.px! + 3, o.py!, o.pw! - 6, 5);
        if (!boat) {
          ctx.strokeStyle = 'rgba(0,0,0,0.25)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(o.px! + o.pw! / 2, o.py! + o.ph!);
          ctx.lineTo(o.px! + o.pw! / 2, 416);
          ctx.stroke();
        }
        break;
      }
      case 'shooter':
        drawThrower(ctx, o);
        break;
    }
  }

  drawWater(ctx, w, t);

  // bullets
  for (const b of w.bullets) drawBrick(ctx, b.x, b.y, b.w, b.h, false, b.rot);

  // ballots
  for (const b of w.ballots) {
    if (b.got) continue;
    const bob = Math.sin(t * 3 + b.ph) * 3;
    ctx.save();
    ctx.translate(b.x, b.y + bob);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fffdf4';
    roundRect(ctx, -9, -11, 18, 22, 3);
    ctx.fill();
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.strokeStyle = '#9aa0a6';
    ctx.beginPath();
    ctx.moveTo(-5, -4);
    ctx.lineTo(5, -4);
    ctx.moveTo(-5, 1);
    ctx.lineTo(5, 1);
    ctx.stroke();
    ctx.fillStyle = '#d62839';
    ctx.beginPath();
    ctx.arc(0, 6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // doors
  for (const f of w.fakeDoors) drawDoor(ctx, f, t, false, 0);
  drawDoor(ctx, doorRect(w), t, true, w.door.poof);

  // player
  drawVoter(ctx, w.p, t, w.state === 'dead', { cheer: w.state === 'win' });

  // reversed controls indicator
  if (w.flipT > 0 && w.state === 'play') {
    ctx.fillStyle = '#d9a8ff';
    ctx.font = font(16, 700);
    ctx.textAlign = 'center';
    ctx.fillText('⇄', w.p.x + w.p.w / 2, w.p.y - 12);
  }

  // darkness flashlight effect
  if (w.darkAlpha > 0.02) {
    const d = getDarkCanvas();
    if (d) {
      const c2 = d.getContext('2d');
      if (c2) {
        c2.globalCompositeOperation = 'source-over';
        c2.clearRect(0, 0, W, H);
        c2.fillStyle = `rgba(2,3,12,${0.97 * w.darkAlpha})`;
        c2.fillRect(0, 0, W, H);
        c2.globalCompositeOperation = 'destination-out';
        const cx = w.p.x + w.p.w / 2;
        const cy = w.p.y + w.p.h / 2;
        const gr = c2.createRadialGradient(cx, cy, 20, cx, cy, 110);
        gr.addColorStop(0, 'rgba(0,0,0,1)');
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        c2.fillStyle = gr;
        c2.fillRect(0, 0, W, H);
        ctx.drawImage(d, 0, 0);
      }
    }
  }

  ctx.restore();

  // level intro title card
  if (w.intro > 0) {
    const a = Math.min(1, w.intro / 0.6, (2.4 - w.intro) / 0.3);
    ctx.save();
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = 'rgba(8,12,20,0.72)';
    roundRect(ctx, 120, 150, 560, 130, 16);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd166';
    ctx.font = font(18, 600);
    ctx.fillText(`${lang === 'bn' ? 'লেভেল' : 'LEVEL'} ${w.lv.id}`, 400, 188);
    ctx.fillStyle = '#fff';
    ctx.font = font(34, 700);
    ctx.fillText(w.lv.name[lang], 400, 228);
    ctx.fillStyle = '#cfe3ff';
    ctx.font = font(16, 500);
    ctx.fillText(w.lv.intro[lang], 400, 258);
    ctx.restore();
  }
}
