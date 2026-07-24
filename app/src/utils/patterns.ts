import { mulberry32, fbm } from './math';
import { getColor, getBgColor } from './color';
import type { Palette, PatternType } from './constants';

function drawPineTree(
  ctx: CanvasRenderingContext2D,
  x: number,
  bottomY: number,
  width: number,
  height: number,
  rng: () => number
) {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(x - width * 0.08, bottomY);
  ctx.lineTo(x - width * 0.08, bottomY - height * 0.15);
  ctx.lineTo(x + width * 0.08, bottomY - height * 0.15);
  ctx.lineTo(x + width * 0.08, bottomY);
  ctx.fill();

  const segments = 30;
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const topY = bottomY - height + (height * t * 0.45);
    const currBottomY = bottomY - height + (height * (t + 0.22));
    const currWidth = width * (0.25 + t * 0.75);

    ctx.beginPath();
    ctx.moveTo(x, topY);

    const jitterL = (rng() - 0.5) * (width * 0.08);
    const jitterR = (rng() - 0.5) * (width * 0.08);

    ctx.lineTo(x - currWidth / 2 + jitterL, currBottomY);
    ctx.lineTo(x + currWidth / 2 + jitterR, currBottomY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

export function drawFlowingHills(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: number | Palette,
  rng: () => number,
  seed: number,
  isInverted: boolean,
  customPalettes: Palette[] = []
) {
  const layers = 5;
  const isDesktop = w > h;

  for (let i = 0; i < layers; i++) {
    const t = (i + 1) / layers;
    const spacingFactor = isDesktop ? 0.40 : 0.33;
    const baseY = h * (0.5 + (i / layers) * spacingFactor);
    ctx.fillStyle = getColor(pal, t * 0.85 + 0.1, isInverted, customPalettes);

    ctx.beginPath();
    ctx.moveTo(0, h);

    const ridgePoints: { x: number; y: number }[] = [];
    const geometryStep = Math.max(4, Math.round(w / 120));

    for (let x = 0; x <= w + geometryStep; x += geometryStep) {
      const nx = x / w;
      let y: number;

      if (i < 2) {
        const mountainAmplitude = isDesktop ? 0.32 : 0.12;
        const mountainFreq = isDesktop ? 4.5 : 2.5;
        y = baseY + fbm(nx * mountainFreq + i * 4.5, seed) * h * mountainAmplitude - (isDesktop ? h * 0.12 : h * 0.05);
      } else {
        const hillAmplitude = isDesktop ? 0.16 : 0.06;
        const hillFreq = isDesktop ? 2.5 : 1.5;
        y = baseY + fbm(nx * hillFreq + i * 2.1, seed) * h * hillAmplitude - (isDesktop ? h * 0.01 : h * 0.02);
      }

      ridgePoints.push({ x, y });
      ctx.lineTo(x, y);
    }

    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    if (i >= 1) {
      let baseTreeWidth: number;
      let baseTreeHeight: number;

      if (isDesktop) {
        baseTreeWidth = h * (0.045 + i * 0.004);
        baseTreeHeight = baseTreeWidth * (1 + rng() * 0.2);
      } else {
        baseTreeWidth = w * (0.12 + i * 0.004);
        baseTreeHeight = baseTreeWidth * (1 + rng() * 0.2);
      }

      const stepX = baseTreeWidth * 0.35;

      for (let x = 0; x <= w; x += stepX) {
        const pct = x / w;
        const ptIndex = Math.floor(pct * (ridgePoints.length - 1));
        const pt = ridgePoints[ptIndex] || ridgePoints[ridgePoints.length - 1];

        const rowsDown = isDesktop
          ? (i === 1 ? 3 : 5 + (layers - i))
          : (i === 1 ? 1 : 2 + (layers - i));

        for (let row = 0; row < rowsDown; row++) {
          const yOffset = row * (baseTreeHeight * 0.22);
          const currentBottomY = pt.y + yOffset;

          if (currentBottomY > h + 20) continue;

          const scale = isDesktop ? (0.65 + rng() * 1.1) : (0.8 + rng() * 0.4);
          const currentWidth = baseTreeWidth * (isDesktop ? Math.min(scale, 1.1) : scale);
          const currentHeight = baseTreeHeight * scale;
          const currentX = x + (rng() - 0.5) * (stepX * 0.5);

          drawPineTree(ctx, currentX, currentBottomY, currentWidth, currentHeight, rng);
        }
      }
    }
  }
}

export function drawSmoothWave(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: number | Palette,
  rng: () => number,
  seed: number,
  isInverted: boolean,
  customPalettes: Palette[] = []
) {
  const layers = 8 + (rng() * 5 | 0);
  const centerX = w * (0.45 + rng() * 0.1);
  const baseY = h * (0.75 + rng() * 0.08);

  for (let i = layers; i >= 0; i--) {
    const t = i / layers;
    const spread = h * (0.8 + t * 1.8);
    const peakH = h * (0.05 + t * 0.3);
    const skew = rng() * 0.2 - 0.10;

    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(0, baseY + peakH * 0.5);

    const steps = 120;
    for (let s = 0; s <= steps; s++) {
      const st = s / steps;
      const x = st * w;
      const dist = (x - centerX) / spread;
      const bell = Math.exp(-dist * dist * 0.4);
      const asymmetry = 1 + skew * dist;
      const wave = bell * peakH * asymmetry;
      const micro = fbm((x / h) * 2 + i * 1.4, seed, 3) * h * 0.008;
      const y = baseY - wave + micro;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = getColor(pal, 0.1 + (1 - t) * 0.8, isInverted, customPalettes);
    ctx.fill();
  }
}

export function drawSandDunes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: number | Palette,
  rng: () => number,
  seed: number,
  isInverted: boolean,
  customPalettes: Palette[] = []
) {
  const layers = 7 + (rng() * 5 | 0);
  for (let i = 0; i < layers; i++) {
    const t = (i + 1) / layers;
    const baseY = h * (0.55 + t * 0.35);
    const freq = 0.5 + rng() * 0.8;
    const phase = rng() * 10;

    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const nx = x / h;
      const wave = Math.sin(nx * Math.PI * freq + phase) * h * 0.05;
      const n = fbm(nx * 0.8 + i * 2.1, seed, 3) * h * 0.05;
      const y = baseY + wave + n;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = getColor(pal, t * 0.8 + 0.15, isInverted, customPalettes);
    ctx.fill();
  }
}

export function drawMountains(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: number | Palette,
  rng: () => number,
  seed: number,
  isInverted: boolean,
  customPalettes: Palette[] = []
) {
  const layers = 5 + (rng() * 3 | 0);
  for (let i = 0; i < layers; i++) {
    const t = (i + 1) / layers;
    const baseY = h * (0.55 + t * 0.35);
    const peakCount = 2 + (rng() * 2 | 0);
    const offset = rng() * 50;

    ctx.beginPath();
    ctx.moveTo(-2, h + 2);

    const peaks: { cx: number; peakH: number; width: number }[] = [];
    for (let p = 0; p < peakCount; p++) {
      peaks.push({
        cx: w * (0.1 + rng() * 0.8),
        peakH: h * (0.1 + rng() * 0.15) * (1 - i * 0.08),
        width: h * (0.6 + rng() * 0.6),
      });
    }

    for (let x = -2; x <= w + 2; x += 2) {
      let y = baseY;
      for (const p of peaks) {
        const dist = Math.abs(x - p.cx);
        if (dist < p.width) {
          const rise = (1 - dist / p.width);
          const sharpness = 1.3 + rng() * 0.3;
          const peakY = Math.pow(rise, sharpness) * p.peakH;
          y = Math.min(y, baseY - peakY);
        }
      }
      const micro = fbm((x / h) * 1.5 + i * 2.3 + offset, seed, 3) * h * 0.008;
      ctx.lineTo(x, y + micro);
    }
    ctx.lineTo(w + 2, h + 2);
    ctx.closePath();
    ctx.fillStyle = getColor(pal, t * 0.8 + 0.12, isInverted, customPalettes);
    ctx.fill();
  }
}

export function drawConcentricArcs(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: number | Palette,
  rng: () => number,
  isInverted: boolean,
  customPalettes: Palette[] = []
) {
  const maxR = h * 1.0;
  const originX = w * (0.45 + rng() * 0.1);
  const originY = h * 1.5;
  const rings = 14 + (rng() * 6 | 0);

  for (let i = rings; i >= 0; i--) {
    const t = i / rings;
    const r = maxR * t;
    ctx.beginPath();
    ctx.arc(originX, originY, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = getColor(pal, 0.1 + (1 - t) * 0.8, isInverted, customPalettes);
    ctx.fill();
  }
}

export function drawDesertDunes(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pal: number | Palette,
  rng: () => number,
  isInverted: boolean,
  customPalettes: Palette[] = []
) {
  for (let i = 0; i < 15; i++) {
    const t = i / 15;
    ctx.beginPath();
    let x = w * rng();
    let y = h * (0.5 + rng() * 0.5);
    ctx.moveTo(x, y);
    for (let j = 0; j < 10; j++) {
      x += (rng() - 0.5) * w * 1;
      y += (rng() - 0.4) * h * 0.2;
      const cp1y = h * (0.5 + rng() * 0.5);
      const cp2y = h * (0.5 + rng() * 0.5);
      ctx.bezierCurveTo(w * rng(), cp1y, w * rng(), cp2y, x, y);
    }
    ctx.strokeStyle = getColor(pal, t, isInverted, customPalettes);
    ctx.lineWidth = rng() * 3;
    ctx.stroke();
  }
}

export function drawPattern(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  pattern: PatternType,
  palette: number | Palette,
  seed: number,
  zoomLevel = 100,
  fitMode: 'crop' | 'fit' = 'crop',
  isInverted = false,
  customPalettes: Palette[] = []
) {
  const rng = mulberry32(seed);
  ctx.fillStyle = getBgColor(palette, isInverted, customPalettes);
  ctx.fillRect(0, 0, w, h);

  const scale = (zoomLevel / 100) * (fitMode === 'fit' ? 0.78 : 1.0);

  ctx.save();
  if (scale !== 1.0) {
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);
  }

  switch (pattern) {
    case 'flowing-hills':
      drawFlowingHills(ctx, w, h, palette, rng, seed, isInverted, customPalettes);
      break;
    case 'smooth-wave':
      drawSmoothWave(ctx, w, h, palette, rng, seed, isInverted, customPalettes);
      break;
    case 'sand-dunes':
      drawSandDunes(ctx, w, h, palette, rng, seed, isInverted, customPalettes);
      break;
    case 'mountains':
      drawMountains(ctx, w, h, palette, rng, seed, isInverted, customPalettes);
      break;
    case 'concentric-arcs':
      drawConcentricArcs(ctx, w, h, palette, rng, isInverted, customPalettes);
      break;
    case 'desert-dunes':
      drawDesertDunes(ctx, w, h, palette, rng, isInverted, customPalettes);
      break;
    default:
      drawFlowingHills(ctx, w, h, palette, rng, seed, isInverted, customPalettes);
      break;
  }

  ctx.restore();
}
