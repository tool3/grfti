import type { GradientSpec } from '../gradient/spec';
import type { CssOptions, Direction, Stop } from '../types';

const ANGLES: Record<Direction, string> = {
  horizontal: '90deg',
  vertical: '180deg',
  diagonal: '135deg',
};

const percent = (position: number): string => `${Number((position * 100).toFixed(2))}%`;

const stopList = (stops: readonly Stop[]): string =>
  stops.map(({ color, position }) => `${color.css()} ${percent(position)}`).join(', ');

const angleOf = (angle: CssOptions['angle'], direction: Direction): string =>
  typeof angle === 'number' ? `${angle}deg` : (angle ?? ANGLES[direction]);

export const toCss = (spec: GradientSpec, options: CssOptions = {}): string => {
  const stops = stopList(spec.stops);
  const kind = options.kind ?? 'linear';

  return kind === 'linear'
    ? `linear-gradient(${angleOf(options.angle, spec.direction)}, ${stops})`
    : `${kind}-gradient(${stops})`;
};
