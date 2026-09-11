import type { ColorDepth, ColorSpace, Direction, HueSpin, Stop } from '../types';

export interface GradientSpec {
  readonly stops: readonly Stop[];
  readonly direction: Direction;
  readonly space: ColorSpace;
  readonly spin: HueSpin;
  readonly depth: ColorDepth | undefined;
  readonly background: boolean;
}

export const DEFAULT_SPEC = {
  direction: 'horizontal',
  space: 'oklab',
  spin: 'short',
  depth: undefined,
  background: false,
} as const satisfies Omit<GradientSpec, 'stops'>;

export const reverseStops = (stops: readonly Stop[]): readonly Stop[] =>
  stops.map(({ color, position }) => ({ color, position: 1 - position })).reverse();
