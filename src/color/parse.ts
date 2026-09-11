import { GrftiError, suggestFrom } from '../errors';
import type { Rgb } from '../types';
import { ansi16ToRgb, ansi256ToRgb, CSI } from './depth';
import { isNamedColor, NAMED_COLOR_NAMES, NAMED_COLORS } from './named';
import { hslToRgb, hsvToRgb, oklabToRgb, oklchToRgb, rgb } from './space';

const expand = (hex: string): string =>
  hex.length <= 5 ? `#${[...hex.slice(1)].map((digit) => digit + digit).join('')}` : hex;

const channelAt = (hex: string, index: number): number =>
  Number.parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);

const fromHex = (input: string): Rgb => {
  const hex = expand(input);
  const alpha = hex.length === 9 ? channelAt(hex, 3) / 255 : 1;
  return rgb(channelAt(hex, 0), channelAt(hex, 1), channelAt(hex, 2), alpha);
};

const args = (body: string): readonly string[] =>
  body
    .split(/[\s,/]+/)
    .map((part) => part.trim().replace(/deg$/, ''))
    .filter((part) => part.length > 0);

const scaled = (raw: string | undefined, scale: number, fallback = 0): number => {
  if (raw === undefined) return fallback;
  const value = Number.parseFloat(raw);
  if (Number.isNaN(value)) return fallback;
  return raw.endsWith('%') ? (value / 100) * scale : value;
};

const alphaOf = (raw: string | undefined): number => (raw === undefined ? 1 : scaled(raw, 1, 1));

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/;
const CALL = /^(rgba?|hsla?|hsva?|hsb|oklab|oklch)\(([^)]*)\)$/;
const ANSI_INDEX = /^ansi(?:256)?[(:\s]\s*(\d{1,3})\s*\)?$/;
const ANSI_TRUECOLOR = /\[[34]8;2;(\d{1,3});(\d{1,3});(\d{1,3})m/;
const ANSI_256 = /\[[34]8;5;(\d{1,3})m/;
const ANSI_BASIC = /\[(\d{1,3})m/;

const fromCall = (kind: string, body: string): Rgb => {
  const parts = args(body);
  const [first, second, third, fourth] = parts;
  const alpha = alphaOf(fourth);

  switch (kind) {
    case 'rgb':
    case 'rgba':
      return rgb(scaled(first, 255), scaled(second, 255), scaled(third, 255), alpha);
    case 'hsl':
    case 'hsla':
      return hslToRgb({ h: scaled(first, 360), s: scaled(second, 1), l: scaled(third, 1), alpha });
    case 'hsv':
    case 'hsva':
    case 'hsb':
      return hsvToRgb({ h: scaled(first, 360), s: scaled(second, 1), v: scaled(third, 1), alpha });
    case 'oklab':
      return oklabToRgb({ l: scaled(first, 1), a: scaled(second, 0.4), b: scaled(third, 0.4), alpha });
    default:
      return oklchToRgb({ l: scaled(first, 1), c: scaled(second, 0.4), h: scaled(third, 360), alpha });
  }
};

const fromAnsiSequence = (input: string): Rgb | undefined => {
  const truecolor = input.match(ANSI_TRUECOLOR);
  if (truecolor) {
    const [, r, g, b] = truecolor;
    return rgb(Number(r), Number(g), Number(b));
  }

  const indexed = input.match(ANSI_256);
  if (indexed) return ansi256ToRgb(Number(indexed[1]));

  const basic = input.match(ANSI_BASIC);
  if (basic) {
    const code = Number(basic[1]);
    const offset =
      code >= 30 && code <= 37
        ? code - 30
        : code >= 40 && code <= 47
          ? code - 40
          : code >= 90 && code <= 97
            ? code - 90 + 8
            : code >= 100 && code <= 107
              ? code - 100 + 8
              : undefined;
    return offset === undefined ? undefined : ansi16ToRgb(offset);
  }

  return undefined;
};

export const tryParseRgb = (input: string): Rgb | undefined => {
  const trimmed = input.trim();
  const lower = trimmed.toLowerCase();

  if (isNamedColor(lower)) return fromHex(NAMED_COLORS[lower]);
  if (HEX.test(lower)) return fromHex(lower);

  const call = lower.match(CALL);
  if (call) return fromCall(call[1] as string, call[2] as string);

  const indexed = lower.match(ANSI_INDEX);
  if (indexed) return ansi256ToRgb(Number(indexed[1]));

  if (trimmed.includes(CSI)) return fromAnsiSequence(trimmed);

  return undefined;
};

export const parseRgb = (input: string): Rgb => {
  const parsed = tryParseRgb(input);
  if (parsed !== undefined) return parsed;

  throw new GrftiError(
    `Unknown color ${JSON.stringify(input)}.`,
    input,
    suggestFrom(NAMED_COLOR_NAMES, input),
  );
};
