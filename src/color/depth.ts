import type { ColorDepth, Rgb } from '../types';
import { rgb, rgbToOklab } from './space';

export const ESC = String.fromCharCode(27);
export const CSI = ESC + '[';

export const ANSI16_PALETTE = [
  '#000000', '#800000', '#008000', '#808000',
  '#000080', '#800080', '#008080', '#c0c0c0',
  '#808080', '#ff0000', '#00ff00', '#ffff00',
  '#0000ff', '#ff00ff', '#00ffff', '#ffffff',
] as const;

const CUBE_LEVELS = [0, 95, 135, 175, 215, 255] as const;

const hexToChannels = (hex: string): readonly [number, number, number] => [
  Number.parseInt(hex.slice(1, 3), 16),
  Number.parseInt(hex.slice(3, 5), 16),
  Number.parseInt(hex.slice(5, 7), 16),
];

export const ansi16ToRgb = (index: number): Rgb => {
  const [r, g, b] = hexToChannels(ANSI16_PALETTE[index & 15] ?? '#000000');
  return rgb(r, g, b);
};

export const ansi256ToRgb = (index: number): Rgb => {
  const clamped = Math.max(0, Math.min(255, Math.round(index)));

  if (clamped < 16) return ansi16ToRgb(clamped);

  if (clamped > 231) {
    const gray = 8 + (clamped - 232) * 10;
    return rgb(gray, gray, gray);
  }

  const offset = clamped - 16;
  const level = (position: number): number => CUBE_LEVELS[position] ?? 0;
  return rgb(level(Math.floor(offset / 36)), level(Math.floor(offset / 6) % 6), level(offset % 6));
};

// In oklab, not rgb: raw rgb distance pulls saturated colours towards mid-grey.
const distance = (a: Rgb, b: Rgb): number => {
  const from = rgbToOklab(a);
  const to = rgbToOklab(b);
  return (from.l - to.l) ** 2 + (from.a - to.a) ** 2 + (from.b - to.b) ** 2;
};

const ANSI16_RGB = ANSI16_PALETTE.map((_hex, index) => ansi16ToRgb(index));

const nearestCubeLevel = (channel: number): number =>
  CUBE_LEVELS.reduce<number>(
    (best, level, index) =>
      Math.abs(level - channel) < Math.abs((CUBE_LEVELS[best] ?? 0) - channel) ? index : best,
    0,
  );

const nearestGrayIndex = (value: Rgb): number => {
  const average = (value.r + value.g + value.b) / 3;
  return Math.max(0, Math.min(23, Math.round((average - 8) / 10)));
};

export const rgbToAnsi256 = (value: Rgb): number => {
  const cube =
    16 + 36 * nearestCubeLevel(value.r) + 6 * nearestCubeLevel(value.g) + nearestCubeLevel(value.b);
  const gray = 232 + nearestGrayIndex(value);

  return distance(value, ansi256ToRgb(gray)) < distance(value, ansi256ToRgb(cube)) ? gray : cube;
};

export const rgbToAnsi16 = (value: Rgb): number =>
  ANSI16_RGB.reduce<number>(
    (best, candidate, index) =>
      distance(value, candidate) < distance(value, ANSI16_RGB[best] as Rgb) ? index : best,
    0,
  );

export const resetFor = (background: boolean): string => `${CSI}${background ? 49 : 39}m`;

export const escapeFor = (value: Rgb, depth: ColorDepth, background: boolean): string => {
  const layer = background ? 48 : 38;

  switch (depth) {
    case 'none':
      return '';
    case 'ansi16': {
      const index = rgbToAnsi16(value);
      const base = index < 8 ? (background ? 40 : 30) : background ? 100 : 90;
      return `${CSI}${base + (index % 8)}m`;
    }
    case 'ansi256':
      return `${CSI}${layer};5;${rgbToAnsi256(value)}m`;
    case 'truecolor':
      return `${CSI}${layer};2;${value.r};${value.g};${value.b}m`;
  }
};
