import type { NamedColor } from './color/named';
import type { PresetName } from './presets';

export type Primitive = string | number | bigint | boolean;

export type LiteralUnion<Literals extends Primitive, Base extends Primitive = string> =
  | Literals
  | (Base & Record<never, never>);

export type Rgb = { readonly r: number; readonly g: number; readonly b: number; readonly alpha: number };
export type Hsl = { readonly h: number; readonly s: number; readonly l: number; readonly alpha: number };
export type Hsv = { readonly h: number; readonly s: number; readonly v: number; readonly alpha: number };
export type Oklab = { readonly l: number; readonly a: number; readonly b: number; readonly alpha: number };
export type Oklch = { readonly l: number; readonly c: number; readonly h: number; readonly alpha: number };

export type ColorSpace = 'rgb' | 'hsl' | 'hsv' | 'oklab' | 'oklch';
export type ColorDepth = 'truecolor' | 'ansi256' | 'ansi16' | 'none';
export type Direction = 'horizontal' | 'vertical' | 'diagonal';
export type HueSpin = 'short' | 'long';

export type ColorName = LiteralUnion<NamedColor>;

export type ColorInput = ColorName | Rgb | Color;

export type StopInput = {
  readonly color: ColorInput;
  readonly position?: number | undefined;
  readonly pos?: number | undefined;
};

export type GradientSource = LiteralUnion<NamedColor | PresetName> | Rgb | Color | StopInput | Gradient;

export interface GradientOptions {
  readonly space?: ColorSpace | undefined;
  readonly spin?: HueSpin | undefined;
  readonly direction?: Direction | undefined;
  readonly reverse?: boolean | undefined;
  readonly depth?: ColorDepth | undefined;
  readonly background?: boolean | undefined;
  readonly interpolation?: 'rgb' | 'hsv' | undefined;
  readonly hsvSpin?: HueSpin | undefined;
}

export interface CssOptions {
  readonly angle?: number | string | undefined;
  readonly kind?: 'linear' | 'radial' | 'conic' | undefined;
}

export interface SvgOptions {
  readonly id?: string | undefined;
  readonly kind?: 'linear' | 'radial' | undefined;
}

export interface Color {
  (input: unknown): string;

  readonly hex: string;
  readonly rgb: Rgb;
  readonly hsl: Hsl;
  readonly hsv: Hsv;
  readonly oklab: Oklab;
  readonly oklch: Oklch;
  readonly luminance: number;
  readonly isDark: boolean;
  readonly ansi: string;
  readonly bg: Color;
  readonly name: NamedColor | undefined;

  alpha(value: number): Color;
  lighten(amount: number): Color;
  darken(amount: number): Color;
  saturate(amount: number): Color;
  desaturate(amount: number): Color;
  rotate(degrees: number): Color;
  mix(other: ColorInput, amount?: number, space?: ColorSpace): Color;
  contrast(other: ColorInput): number;
  depth(depth: ColorDepth): Color;
  css(): string;
  toString(): string;
}

export interface Stop {
  readonly color: Color;
  readonly position: number;
  /** The colour exactly as written, for consumers that resolve names themselves. */
  readonly source?: string | undefined;
}

export interface Gradient {
  (input: unknown): string;

  readonly horizontal: Gradient;
  readonly vertical: Gradient;
  readonly diagonal: Gradient;
  readonly reverse: Gradient;
  readonly multiline: Gradient;
  readonly bg: Gradient;

  readonly stops: readonly Stop[];
  readonly colors: readonly Color[];
  readonly direction: Direction;

  at(position: number): Color;
  sample(count: number): readonly Color[];
  space(space: ColorSpace, spin?: HueSpin): Gradient;
  depth(depth: ColorDepth): Gradient;
  css(options?: CssOptions): string;
  svg(options?: SvgOptions): string;
  toString(): string;
}
