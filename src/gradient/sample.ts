import { mixRgb } from '../color/mix';
import { fromRgb } from '../color/create';
import { clamp } from '../color/space';
import type { Color } from '../types';
import type { GradientSpec } from './spec';

const bracket = (spec: GradientSpec, position: number) => {
  const before = spec.stops.filter((stop) => stop.position <= position).at(-1) ?? spec.stops[0];
  const after = spec.stops.find((stop) => stop.position >= position) ?? spec.stops.at(-1);
  return [before, after] as const;
};

export const colorAt = (spec: GradientSpec, position: number): Color => {
  const first = spec.stops[0];
  if (first === undefined) throw new Error('Gradient has no stops');
  if (spec.stops.length === 1) return first.color;

  const target = clamp(position);
  const [before, after] = bracket(spec, target);
  if (before === undefined || after === undefined) return first.color;

  const span = after.position - before.position;
  const local = span <= 0 ? 0 : (target - before.position) / span;

  return fromRgb(
    mixRgb(before.color.rgb, after.color.rgb, local, spec.space, spec.spin),
    spec.depth,
  );
};

export const sampleColors = (spec: GradientSpec, count: number): readonly Color[] =>
  count <= 1
    ? [colorAt(spec, 0)]
    : Array.from({ length: count }, (_, index) => colorAt(spec, index / (count - 1)));
