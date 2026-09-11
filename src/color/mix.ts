import type { ColorSpace, HueSpin, Rgb } from '../types';
import {
  hslToRgb,
  hsvToRgb,
  oklabToRgb,
  oklchToRgb,
  rgbToHsl,
  rgbToHsv,
  rgbToOklab,
  rgbToOklch,
  wrapHue,
} from './space';

const lerp = (from: number, to: number, amount: number): number => from + (to - from) * amount;

const mixHue = (from: number, to: number, amount: number, spin: HueSpin): number => {
  const short = ((to - from + 540) % 360) - 180;
  const delta = spin === 'long' ? (short > 0 ? short - 360 : short + 360) : short;
  return wrapHue(from + delta * amount);
};

const hueOrFallback = (chroma: number, hue: number, fallback: number): number =>
  chroma === 0 ? fallback : hue;

const mixRgbSpace = (from: Rgb, to: Rgb, amount: number): Rgb => ({
  r: Math.round(lerp(from.r, to.r, amount)),
  g: Math.round(lerp(from.g, to.g, amount)),
  b: Math.round(lerp(from.b, to.b, amount)),
  alpha: lerp(from.alpha, to.alpha, amount),
});

const mixHsl = (from: Rgb, to: Rgb, amount: number, spin: HueSpin): Rgb => {
  const a = rgbToHsl(from);
  const b = rgbToHsl(to);
  return hslToRgb({
    h: mixHue(hueOrFallback(a.s, a.h, b.h), hueOrFallback(b.s, b.h, a.h), amount, spin),
    s: lerp(a.s, b.s, amount),
    l: lerp(a.l, b.l, amount),
    alpha: lerp(a.alpha, b.alpha, amount),
  });
};

const mixHsv = (from: Rgb, to: Rgb, amount: number, spin: HueSpin): Rgb => {
  const a = rgbToHsv(from);
  const b = rgbToHsv(to);
  return hsvToRgb({
    h: mixHue(hueOrFallback(a.s, a.h, b.h), hueOrFallback(b.s, b.h, a.h), amount, spin),
    s: lerp(a.s, b.s, amount),
    v: lerp(a.v, b.v, amount),
    alpha: lerp(a.alpha, b.alpha, amount),
  });
};

const mixOklab = (from: Rgb, to: Rgb, amount: number): Rgb => {
  const a = rgbToOklab(from);
  const b = rgbToOklab(to);
  return oklabToRgb({
    l: lerp(a.l, b.l, amount),
    a: lerp(a.a, b.a, amount),
    b: lerp(a.b, b.b, amount),
    alpha: lerp(a.alpha, b.alpha, amount),
  });
};

const mixOklch = (from: Rgb, to: Rgb, amount: number, spin: HueSpin): Rgb => {
  const a = rgbToOklch(from);
  const b = rgbToOklch(to);
  return oklchToRgb({
    l: lerp(a.l, b.l, amount),
    c: lerp(a.c, b.c, amount),
    h: mixHue(hueOrFallback(a.c, a.h, b.h), hueOrFallback(b.c, b.h, a.h), amount, spin),
    alpha: lerp(a.alpha, b.alpha, amount),
  });
};

export const mixRgb = (
  from: Rgb,
  to: Rgb,
  amount: number,
  space: ColorSpace = 'oklab',
  spin: HueSpin = 'short',
): Rgb => {
  if (amount <= 0) return from;
  if (amount >= 1) return to;

  switch (space) {
    case 'rgb':
      return mixRgbSpace(from, to, amount);
    case 'hsl':
      return mixHsl(from, to, amount, spin);
    case 'hsv':
      return mixHsv(from, to, amount, spin);
    case 'oklch':
      return mixOklch(from, to, amount, spin);
    case 'oklab':
      return mixOklab(from, to, amount);
  }
};
