import { isColor } from '../color/create';
import { GrftiError } from '../errors';
import { withGetters } from '../internal/define';
import type { PresetDefinition, PresetName } from '../presets';
import { isPresetName, PRESET_NAMES, PRESETS } from '../presets';
import { toCss } from '../render/css';
import { toSvg } from '../render/svg';
import { paintText } from '../render/text';
import type {
  ColorDepth,
  ColorSpace,
  CssOptions,
  Gradient,
  GradientOptions,
  GradientSource,
  HueSpin,
  Rgb,
  StopInput,
  SvgOptions,
} from '../types';
import type { GradientFlags, ParsedGradient } from './parse';
import { mergeFlags, parseGradientSource } from './parse';
import { colorAt, sampleColors } from './sample';
import type { GradientSpec } from './spec';
import { DEFAULT_SPEC, reverseStops } from './spec';
import type { RawStop } from './stops';
import { normalizeStops } from './stops';

const GRADIENT = Symbol.for('grfti.gradient');

export const isGradient = (value: unknown): value is Gradient =>
  typeof value === 'function' && GRADIENT in value;

const canonical = (spec: GradientSpec): string => {
  const stops = spec.stops
    .map(({ color, position }) => `${color.hex} ${Number((position * 100).toFixed(2))}%`)
    .join(', ');
  const flags = [spec.direction, spec.space, ...(spec.background ? ['bg'] : [])].join(':');
  return `gradient(${stops}):${flags}`;
};

const createGradient = (spec: GradientSpec): Gradient => {
  const derive = (patch: Partial<GradientSpec>): Gradient => createGradient({ ...spec, ...patch });

  const methods = {
    [GRADIENT]: true,
    at: (position: number) => colorAt(spec, position),
    sample: (count: number) => sampleColors(spec, count),
    space: (space: ColorSpace, spin?: HueSpin) =>
      derive(spin === undefined ? { space } : { space, spin }),
    depth: (depth: ColorDepth) => derive({ depth }),
    css: (options?: CssOptions) => toCss(spec, options),
    svg: (options?: SvgOptions) => toSvg(spec, options),
    toString: () => canonical(spec),
  };

  return withGetters(
    Object.assign((input: unknown): string => paintText(spec, input), methods),
    {
      horizontal: () => derive({ direction: 'horizontal' }),
      vertical: () => derive({ direction: 'vertical' }),
      diagonal: () => derive({ direction: 'diagonal' }),
      reverse: () => derive({ stops: reverseStops(spec.stops) }),
      multiline: () => derive({}),
      bg: () => derive({ background: true }),
      stops: () => spec.stops,
      colors: () => spec.stops.map((stop) => stop.color),
      direction: () => spec.direction,
    },
  ) as unknown as Gradient;
};

const fromPreset = (name: PresetName): ParsedGradient => {
  const preset: PresetDefinition = PRESETS[name];
  return {
    stops: preset.colors.map((color) => ({ color, position: undefined })),
    flags: { space: preset.space, spin: preset.spin, direction: preset.direction },
  };
};

const isStopInput = (value: object): value is StopInput => 'color' in value;

const presetKey = (stop: RawStop): PresetName | undefined => {
  if (typeof stop.color !== 'string') return undefined;
  const key = stop.color.trim().toLowerCase();
  return isPresetName(key) ? key : undefined;
};

const expandPresets = (parsed: ParsedGradient): ParsedGradient => {
  const expanded = parsed.stops.map((stop) => {
    const key = presetKey(stop);
    return key === undefined ? { stops: [stop], flags: {} } : fromPreset(key);
  });

  return {
    stops: expanded.flatMap((entry) => entry.stops),
    flags: mergeFlags([...expanded.map((entry) => entry.flags), parsed.flags]),
  };
};

const resolveSource = (source: GradientSource): ParsedGradient => {
  if (isGradient(source)) {
    return {
      stops: source.stops.map(({ color, position }) => ({ color, position })),
      flags: { direction: source.direction },
    };
  }

  if (isColor(source)) return { stops: [{ color: source, position: undefined }], flags: {} };

  if (typeof source === 'object' && source !== null) {
    return isStopInput(source)
      ? { stops: [{ color: source.color, position: source.position ?? source.pos }], flags: {} }
      : { stops: [{ color: source as Rgb, position: undefined }], flags: {} };
  }

  return expandPresets(parseGradientSource(String(source).trim()));
};

const flagsFromOptions = (options: GradientOptions | undefined): GradientFlags =>
  options === undefined
    ? {}
    : {
        direction: options.direction,
        space: options.space ?? options.interpolation,
        spin: options.spin ?? options.hsvSpin,
        depth: options.depth,
        background: options.background,
        reverse: options.reverse,
      };

const buildSpec = (
  sources: readonly GradientSource[],
  options: GradientOptions | undefined,
): GradientSpec => {
  const parsed = sources.map(resolveSource);
  const raw: readonly RawStop[] = parsed.flatMap((entry) => entry.stops);

  if (raw.length === 0) {
    throw new GrftiError('A gradient needs at least one color.', String(sources.join(', ')));
  }

  const flags = mergeFlags([...parsed.map((entry) => entry.flags), flagsFromOptions(options)]);
  const stops = normalizeStops(raw);

  return {
    stops: flags.reverse === true ? reverseStops(stops) : stops,
    direction: flags.direction ?? DEFAULT_SPEC.direction,
    space: flags.space ?? DEFAULT_SPEC.space,
    spin: flags.spin ?? DEFAULT_SPEC.spin,
    depth: flags.depth,
    background: flags.background ?? DEFAULT_SPEC.background,
  };
};

const isOptionsObject = (value: unknown): value is GradientOptions =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  !('r' in value) &&
  !('color' in value);

const create = (args: readonly unknown[]): Gradient => {
  const options = isOptionsObject(args.at(-1)) ? (args.at(-1) as GradientOptions) : undefined;
  const positional = options === undefined ? args : args.slice(0, -1);
  const sources = positional.flatMap((item) =>
    Array.isArray(item) ? (item as readonly GradientSource[]) : [item as GradientSource],
  );

  return createGradient(buildSpec(sources, options));
};

type PresetGradients = { readonly [Name in PresetName]: Gradient };

export interface GradientFactory extends PresetGradients {
  (source: GradientSource | readonly GradientSource[], options?: GradientOptions): Gradient;
  (...sources: readonly [GradientSource, GradientSource, ...GradientSource[]]): Gradient;

  readonly horizontal: (...sources: readonly GradientSource[]) => Gradient;
  readonly vertical: (...sources: readonly GradientSource[]) => Gradient;
  readonly diagonal: (...sources: readonly GradientSource[]) => Gradient;
  readonly parse: (input: string) => Gradient;
}

const factoryGetters = {
  horizontal: () => (...sources: readonly GradientSource[]) => create(sources).horizontal,
  vertical: () => (...sources: readonly GradientSource[]) => create(sources).vertical,
  diagonal: () => (...sources: readonly GradientSource[]) => create(sources).diagonal,
  parse: () => (input: string) => create([input]),
  ...Object.fromEntries(PRESET_NAMES.map((name) => [name, () => create([name])])),
};

export const gradient = withGetters(
  (...args: readonly unknown[]): Gradient => create(args),
  factoryGetters,
) as unknown as GradientFactory;
