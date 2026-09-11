export { gradient, gradient as default, isGradient } from './gradient/create';
export type { GradientFactory } from './gradient/create';

export { color, fromRgb, hsl, isColor, oklch, rgb, toRgb } from './color/create';
export { parseRgb, tryParseRgb } from './color/parse';
export { NAMED_COLOR_NAMES, NAMED_COLORS, isNamedColor } from './color/named';
export type { NamedColor } from './color/named';

export { PRESET_NAMES, PRESETS, isPresetName } from './presets';
export type { PresetDefinition, PresetName } from './presets';

export { ansi16ToRgb, ansi256ToRgb, rgbToAnsi16, rgbToAnsi256 } from './color/depth';
export { mixRgb } from './color/mix';
export {
  hslToRgb,
  hsvToRgb,
  oklabToRgb,
  oklchToRgb,
  relativeLuminance,
  rgbToHsl,
  rgbToHsv,
  rgbToOklab,
  rgbToOklch,
} from './color/space';

export { depthFromEnvironment, detectDepth } from './env';
export { GrftiError } from './errors';

export type {
  Color,
  ColorDepth,
  ColorInput,
  ColorName,
  ColorSpace,
  CssOptions,
  Direction,
  Gradient,
  GradientOptions,
  GradientSource,
  Hsl,
  Hsv,
  HueSpin,
  LiteralUnion,
  Oklab,
  Oklch,
  Rgb,
  Stop,
  StopInput,
  SvgOptions,
} from './types';
