import { GrftiError, suggestFrom } from '../errors';
import type { ColorDepth, ColorSpace, Direction, HueSpin } from '../types';
import type { RawStop } from './stops';

export interface GradientFlags {
  readonly direction?: Direction | undefined;
  readonly space?: ColorSpace | undefined;
  readonly spin?: HueSpin | undefined;
  readonly depth?: ColorDepth | undefined;
  readonly background?: boolean | undefined;
  readonly reverse?: boolean | undefined;
}

export interface ParsedGradient {
  readonly stops: readonly RawStop[];
  readonly flags: GradientFlags;
}

const DIRECTIONS: Record<string, Direction> = {
  horizontal: 'horizontal',
  h: 'horizontal',
  row: 'horizontal',
  vertical: 'vertical',
  v: 'vertical',
  column: 'vertical',
  diagonal: 'diagonal',
  diag: 'diagonal',
  d: 'diagonal',
};

const SPACES: Record<string, ColorSpace> = {
  rgb: 'rgb',
  hsl: 'hsl',
  hsv: 'hsv',
  hsb: 'hsv',
  oklab: 'oklab',
  oklch: 'oklch',
};

const SPINS: Record<string, HueSpin> = { short: 'short', long: 'long' };

const DEPTHS: Record<string, ColorDepth> = {
  truecolor: 'truecolor',
  '24bit': 'truecolor',
  ansi256: 'ansi256',
  '256': 'ansi256',
  ansi16: 'ansi16',
  '16': 'ansi16',
  none: 'none',
  plain: 'none',
};

const REVERSE = ['reverse', 'reversed', 'rev', 'r'];
const BACKGROUND = ['bg', 'background', 'on'];

const FLAG_NAMES = [
  ...Object.keys(DIRECTIONS),
  ...Object.keys(SPACES),
  ...Object.keys(SPINS),
  ...Object.keys(DEPTHS),
  ...REVERSE,
  ...BACKGROUND,
];

const flagOf = (token: string, source: string): GradientFlags => {
  const flag = token.trim().toLowerCase();

  const direction = DIRECTIONS[flag];
  if (direction) return { direction };

  const space = SPACES[flag];
  if (space) return { space };

  const spin = SPINS[flag];
  if (spin) return { spin };

  const depth = DEPTHS[flag];
  if (depth) return { depth };

  if (REVERSE.includes(flag)) return { reverse: true };
  if (BACKGROUND.includes(flag)) return { background: true };

  throw new GrftiError(
    `Unknown gradient flag ${JSON.stringify(token)} in ${JSON.stringify(source)}.`,
    token,
    suggestFrom(FLAG_NAMES, flag),
  );
};

const flush = (state: { readonly parts: readonly string[]; readonly current: string }): readonly string[] => [
  ...state.parts,
  state.current,
];

const splitTop = (input: string, separator: string): readonly string[] =>
  flush(
    [...input].reduce<{ readonly parts: readonly string[]; readonly current: string; readonly depth: number }>(
      (state, char) => {
        const depth =
          char === '(' ? state.depth + 1 : char === ')' ? Math.max(0, state.depth - 1) : state.depth;
        return char === separator && depth === 0
          ? { parts: [...state.parts, state.current], current: '', depth }
          : { ...state, current: state.current + char, depth };
      },
      { parts: [], current: '', depth: 0 },
    ),
  )
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

const WRAPPER = /^(?:linear-|radial-|conic-)?gradient\s*\((.*)\)\s*(.*)$/is;
const POSITION = /^(?<color>.+?)\s+(?<position>[+-]?(?:\d*\.\d+|\d+)%?)$/;
const ANGLE = /^(?:(?<degrees>[+-]?\d*\.?\d+)deg|to\s+(?<side>[a-z\s]+))$/i;

const balanced = (text: string): boolean =>
  [...text].filter((char) => char === '(').length === [...text].filter((char) => char === ')').length;

const positionOf = (raw: string): number => {
  const value = Number.parseFloat(raw);
  return raw.endsWith('%') ? value / 100 : value <= 1 ? value : value / 100;
};

const toStop = (token: string): RawStop => {
  const match = token.match(POSITION);
  const captured = match?.groups;

  return captured !== undefined && balanced(captured.color as string)
    ? { color: captured.color as string, position: positionOf(captured.position as string) }
    : { color: token, position: undefined };
};

const directionFromAngle = (token: string): Direction | undefined => {
  const match = token.match(ANGLE);
  if (!match?.groups) return undefined;

  const { degrees, side } = match.groups;
  if (side !== undefined) {
    const edge = side.trim().toLowerCase();
    return edge === 'right' || edge === 'left'
      ? 'horizontal'
      : edge === 'top' || edge === 'bottom'
        ? 'vertical'
        : 'diagonal';
  }

  const angle = ((Number(degrees) % 360) + 360) % 360;
  return angle === 90 || angle === 270
    ? 'horizontal'
    : angle === 0 || angle === 180
      ? 'vertical'
      : 'diagonal';
};

const defined = (flags: GradientFlags): GradientFlags =>
  Object.fromEntries(Object.entries(flags).filter(([, value]) => value !== undefined));

export const mergeFlags = (flags: readonly GradientFlags[]): GradientFlags =>
  flags.reduce<GradientFlags>((merged, flag) => ({ ...merged, ...defined(flag) }), {});

export const parseGradientSource = (input: string): ParsedGradient => {
  const trimmed = input.trim();
  const wrapped = trimmed.match(WRAPPER);
  const [inner, trailing] = wrapped ? [wrapped[1] ?? '', wrapped[2] ?? ''] : [trimmed, ''];

  const [body, ...innerFlags] = splitTop(inner, ':');
  const segments = splitTop(body ?? '', ',');
  const angle = segments[0] === undefined ? undefined : directionFromAngle(segments[0]);

  const stops = (angle === undefined ? segments : segments.slice(1)).map(toStop);
  const flags = [...innerFlags, ...splitTop(trailing, ':')].map((token) => flagOf(token, input));

  return {
    stops,
    flags: mergeFlags(angle === undefined ? flags : [{ direction: angle }, ...flags]),
  };
};
