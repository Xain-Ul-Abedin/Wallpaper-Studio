import { PALETTES } from './constants';
import type { Palette } from './constants';

export function lerpColor(c1: string, c2: string, t: number): string {
  const r1 = parseInt(c1.slice(1, 3), 16);
  const g1 = parseInt(c1.slice(3, 5), 16);
  const b1 = parseInt(c1.slice(5, 7), 16);

  const r2 = parseInt(c2.slice(1, 3), 16);
  const g2 = parseInt(c2.slice(3, 5), 16);
  const b2 = parseInt(c2.slice(5, 7), 16);

  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

export function resolvePaletteColors(palette: number | Palette, customPalettes: Palette[] = []): string[] {
  if (palette && typeof palette === 'object' && Array.isArray(palette.colors)) {
    return palette.colors;
  }
  if (typeof palette === 'number') {
    if (customPalettes[palette] && customPalettes[palette].colors) {
      return customPalettes[palette].colors;
    }
    if (PALETTES[palette] && PALETTES[palette].colors) {
      return PALETTES[palette].colors;
    }
  }
  return PALETTES[0].colors;
}

export function getColor(palette: number | Palette, t: number, isInverted: boolean, customPalettes: Palette[] = []): string {
  const colors = resolvePaletteColors(palette, customPalettes);
  const ct = isInverted ? 1 - t : t;
  const idx = ct * (colors.length - 1);
  const i = Math.floor(idx);
  const f = idx - i;
  if (i >= colors.length - 1) return colors[colors.length - 1];
  if (i < 0) return colors[0];
  return lerpColor(colors[i], colors[i + 1], f);
}

export function getBgColor(palette: number | Palette, isInverted: boolean, customPalettes: Palette[] = []): string {
  const colors = resolvePaletteColors(palette, customPalettes);
  return isInverted ? colors[colors.length - 1] : colors[0];
}

export function generate10ShadePalette(c1: string, c2: string, c3: string): string[] {
  const hexToRgb = (hex: string): [number, number, number] => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16)
  ];

  const rgbToHex = (r: number, g: number, b: number): string =>
    `#${[r, g, b]
      .map(x => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, '0'))
      .join('')}`;

  const blend = (colorA: string, colorB: string, factor: number): string => {
    const a = hexToRgb(colorA);
    const b = hexToRgb(colorB);
    return rgbToHex(
      a[0] + (b[0] - a[0]) * factor,
      a[1] + (b[1] - a[1]) * factor,
      a[2] + (b[2] - a[2]) * factor
    );
  };

  return [
    c1,
    blend(c1, c2, 0.35),
    blend(c1, c2, 0.70),
    c2,
    blend(c2, c3, 0.35),
    blend(c2, c3, 0.70),
    c3,
    blend(c3, '#ffffff', 0.35),
    blend(c3, '#ffffff', 0.70),
    '#ffffff'
  ];
}

