import type { Hsl, Hsv, Oklab, Oklch, Rgb } from '../types';

export const clamp = (value: number, min = 0, max = 1): number =>
  value < min ? min : value > max ? max : value;

export const clamp255 = (value: number): number => clamp(value, 0, 255);

export const wrapHue = (hue: number): number => ((hue % 360) + 360) % 360;

export const rgb = (r: number, g: number, b: number, alpha = 1): Rgb => ({
  r: Math.round(clamp255(r)),
  g: Math.round(clamp255(g)),
  b: Math.round(clamp255(b)),
  alpha: clamp(alpha),
});

const linearize = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const delinearize = (channel: number): number =>
  255 * (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055);

export const rgbToOklab = ({ r, g, b, alpha }: Rgb): Oklab => {
  const [lr, lg, lb] = [linearize(r), linearize(g), linearize(b)];

  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);

  return {
    l: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    alpha,
  };
};

export const oklabToOklch = ({ l, a, b, alpha }: Oklab): Oklch => ({
  l,
  c: Math.hypot(a, b),
  h: wrapHue((Math.atan2(b, a) * 180) / Math.PI),
  alpha,
});

export const oklchToOklab = ({ l, c, h, alpha }: Oklch): Oklab => ({
  l,
  a: c * Math.cos((h * Math.PI) / 180),
  b: c * Math.sin((h * Math.PI) / 180),
  alpha,
});

type Channels = readonly [number, number, number];

const oklabToChannels = ({ l: L, a, b }: Oklab): Channels => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    delinearize(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    delinearize(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    delinearize(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ];
};

const TOLERANCE = 0.5;
const FIT_STEPS = 12;

const inGamut = (channels: Channels): boolean =>
  channels.every((value) => value >= -TOLERANCE && value <= 255 + TOLERANCE);

// Clipping each channel shifts hue, so shrink chroma at constant lightness and hue instead.
const fitToGamut = (value: Oklab): Channels => {
  const { l, c, h, alpha } = oklabToOklch(value);
  const lightness = clamp(l);

  const fitted = Array.from({ length: FIT_STEPS }).reduce<{ low: number; high: number }>(
    ({ low, high }) => {
      const mid = (low + high) / 2;
      return inGamut(oklabToChannels(oklchToOklab({ l: lightness, c: mid, h, alpha })))
        ? { low: mid, high }
        : { low, high: mid };
    },
    { low: 0, high: c },
  );

  return oklabToChannels(oklchToOklab({ l: lightness, c: fitted.low, h, alpha }));
};

export const oklabToRgb = (value: Oklab): Rgb => {
  const channels = oklabToChannels(value);
  const [r, g, b] = inGamut(channels) ? channels : fitToGamut(value);
  return rgb(r, g, b, value.alpha);
};

export const rgbToOklch = (value: Rgb): Oklch => oklabToOklch(rgbToOklab(value));
export const oklchToRgb = (value: Oklch): Rgb => oklabToRgb(oklchToOklab(value));

const hueOf = (max: number, min: number, r: number, g: number, b: number): number => {
  const span = max - min;
  if (span === 0) return 0;
  const raw =
    max === r ? (g - b) / span + (g < b ? 6 : 0) : max === g ? (b - r) / span + 2 : (r - g) / span + 4;
  return raw * 60;
};

export const rgbToHsl = ({ r, g, b, alpha }: Rgb): Hsl => {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const span = max - min;

  return {
    h: hueOf(max, min, rn, gn, bn),
    s: span === 0 ? 0 : span / (1 - Math.abs(2 * l - 1)),
    l,
    alpha,
  };
};

export const hslToRgb = ({ h, s, l, alpha }: Hsl): Rgb => {
  const chroma = (1 - Math.abs(2 * clamp(l) - 1)) * clamp(s);
  const hue = wrapHue(h) / 60;
  const second = chroma * (1 - Math.abs((hue % 2) - 1));
  const base = clamp(l) - chroma / 2;

  const [r, g, b] =
    hue < 1
      ? [chroma, second, 0]
      : hue < 2
        ? [second, chroma, 0]
        : hue < 3
          ? [0, chroma, second]
          : hue < 4
            ? [0, second, chroma]
            : hue < 5
              ? [second, 0, chroma]
              : [chroma, 0, second];

  return rgb((r + base) * 255, (g + base) * 255, (b + base) * 255, alpha);
};

export const rgbToHsv = ({ r, g, b, alpha }: Rgb): Hsv => {
  const [rn, gn, bn] = [r / 255, g / 255, b / 255];
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);

  return {
    h: hueOf(max, min, rn, gn, bn),
    s: max === 0 ? 0 : (max - min) / max,
    v: max,
    alpha,
  };
};

export const hsvToRgb = ({ h, s, v, alpha }: Hsv): Rgb => {
  const chroma = clamp(v) * clamp(s);
  const hue = wrapHue(h) / 60;
  const second = chroma * (1 - Math.abs((hue % 2) - 1));
  const base = clamp(v) - chroma;

  const [r, g, b] =
    hue < 1
      ? [chroma, second, 0]
      : hue < 2
        ? [second, chroma, 0]
        : hue < 3
          ? [0, chroma, second]
          : hue < 4
            ? [0, second, chroma]
            : hue < 5
              ? [second, 0, chroma]
              : [chroma, 0, second];

  return rgb((r + base) * 255, (g + base) * 255, (b + base) * 255, alpha);
};

export const relativeLuminance = ({ r, g, b }: Rgb): number =>
  0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
