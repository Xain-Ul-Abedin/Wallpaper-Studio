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
