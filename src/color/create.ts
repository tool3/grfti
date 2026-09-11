import { detectDepth } from '../env';
import { withGetters } from '../internal/define';
import type { Color, ColorDepth, ColorInput, ColorSpace, Rgb } from '../types';
import { escapeFor, resetFor } from './depth';
import { mixRgb } from './mix';
import type { NamedColor } from './named';
import { NAMED_COLORS } from './named';
import { parseRgb } from './parse';
import {
  clamp,
  hslToRgb,
  oklchToRgb,
  relativeLuminance,
  rgb as makeRgb,
  rgbToHsl,
  rgbToHsv,
  rgbToOklab,
  rgbToOklch,
} from './space';

const COLOR = Symbol.for('grfti.color');

type ColorSpec = {
  readonly rgb: Rgb;
  readonly depth: ColorDepth | undefined;
  readonly background: boolean;
};

const NAMES_BY_HEX: Record<string, NamedColor> = Object.fromEntries(
  Object.entries(NAMED_COLORS)
    .filter(([, hex]) => hex.length === 7)
    .map(([name, hex]) => [hex, name as NamedColor]),
);

export const isColor = (value: unknown): value is Color =>
  typeof value === 'function' && COLOR in value;

const isRgbObject = (value: unknown): value is Rgb =>
  typeof value === 'object' && value !== null && 'r' in value && 'g' in value && 'b' in value;

export const toRgb = (input: ColorInput): Rgb =>
  isColor(input)
    ? input.rgb
    : isRgbObject(input)
      ? makeRgb(input.r, input.g, input.b, input.alpha ?? 1)
      : parseRgb(String(input));

const channelHex = (value: number): string => value.toString(16).padStart(2, '0');

const toHex = ({ r, g, b, alpha }: Rgb): string =>
  `#${channelHex(r)}${channelHex(g)}${channelHex(b)}${alpha < 1 ? channelHex(Math.round(alpha * 255)) : ''}`;

const paint = (spec: ColorSpec, input: unknown): string => {
  const text = String(input ?? '');
  const depth = spec.depth ?? detectDepth();
  return depth === 'none' || text.length === 0
    ? text
    : `${escapeFor(spec.rgb, depth, spec.background)}${text}${resetFor(spec.background)}`;
};

const createColor = (spec: ColorSpec): Color => {
  const derive = (patch: Partial<ColorSpec>): Color => createColor({ ...spec, ...patch });
  const shift = (next: Rgb): Color => derive({ rgb: next });

  const painter = (input: unknown): string => paint(spec, input);

  const methods = {
    [COLOR]: true,
    alpha: (value: number): Color => shift({ ...spec.rgb, alpha: clamp(value) }),
    lighten: (amount: number): Color => {
      const { l, c, h, alpha } = rgbToOklch(spec.rgb);
      return shift(oklchToRgb({ l: clamp(l + amount), c, h, alpha }));
    },
    darken: (amount: number): Color => {
      const { l, c, h, alpha } = rgbToOklch(spec.rgb);
      return shift(oklchToRgb({ l: clamp(l - amount), c, h, alpha }));
    },
    saturate: (amount: number): Color => {
      const { l, c, h, alpha } = rgbToOklch(spec.rgb);
      return shift(oklchToRgb({ l, c: Math.max(0, c * (1 + amount)), h, alpha }));
    },
    desaturate: (amount: number): Color => {
      const { l, c, h, alpha } = rgbToOklch(spec.rgb);
      return shift(oklchToRgb({ l, c: Math.max(0, c * (1 - amount)), h, alpha }));
    },
    rotate: (degrees: number): Color => {
      const { l, c, h, alpha } = rgbToOklch(spec.rgb);
      return shift(oklchToRgb({ l, c, h: h + degrees, alpha }));
    },
    mix: (other: ColorInput, amount = 0.5, space: ColorSpace = 'oklab'): Color =>
      shift(mixRgb(spec.rgb, toRgb(other), amount, space)),
    contrast: (other: ColorInput): number => {
      const [bright, dark] = [relativeLuminance(spec.rgb), relativeLuminance(toRgb(other))].sort(
        (a, b) => b - a,
      ) as [number, number];
      return (bright + 0.05) / (dark + 0.05);
    },
    depth: (depth: ColorDepth): Color => derive({ depth }),
    css: (): string =>
      spec.rgb.alpha < 1
        ? `rgb(${spec.rgb.r} ${spec.rgb.g} ${spec.rgb.b} / ${Number(spec.rgb.alpha.toFixed(3))})`
        : toHex(spec.rgb),
    toString: (): string => toHex(spec.rgb),
  };

  return withGetters(Object.assign(painter, methods), {
    hex: () => toHex(spec.rgb),
    rgb: () => spec.rgb,
    hsl: () => rgbToHsl(spec.rgb),
    hsv: () => rgbToHsv(spec.rgb),
    oklab: () => rgbToOklab(spec.rgb),
    oklch: () => rgbToOklch(spec.rgb),
    luminance: () => relativeLuminance(spec.rgb),
    isDark: () => relativeLuminance(spec.rgb) < 0.179,
    ansi: () => escapeFor(spec.rgb, spec.depth ?? detectDepth(), spec.background),
    bg: () => derive({ background: true }),
    name: () => NAMES_BY_HEX[toHex(spec.rgb)],
  }) as unknown as Color;
};

export const fromRgb = (value: Rgb, depth?: ColorDepth): Color =>
  createColor({ rgb: value, depth, background: false });

export const color = (input: ColorInput): Color =>
  isColor(input) ? input : fromRgb(toRgb(input));

export const rgb = (r: number, g: number, b: number, alpha = 1): Color =>
  fromRgb(makeRgb(r, g, b, alpha));

export const hsl = (h: number, s: number, l: number, alpha = 1): Color =>
  fromRgb(hslToRgb({ h, s, l, alpha }));

export const oklch = (l: number, c: number, h: number, alpha = 1): Color =>
  fromRgb(oklchToRgb({ l, c, h, alpha }));
