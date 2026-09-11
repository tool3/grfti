import { color as toColor } from '../color/create';
import { clamp } from '../color/space';
import type { ColorInput, Stop } from '../types';

export interface RawStop {
  readonly color: ColorInput;
  readonly position: number | undefined;
}

const anchored = (raw: readonly RawStop[]): readonly (number | undefined)[] =>
  raw.map((stop, index) =>
    stop.position !== undefined
      ? clamp(stop.position)
      : index === 0
        ? 0
        : index === raw.length - 1
          ? 1
          : undefined,
  );

const neighbours = (
  positions: readonly (number | undefined)[],
  index: number,
): readonly [{ at: number; value: number }, { at: number; value: number }] => {
  const known = positions
    .map((value, at) => ({ at, value }))
    .filter((entry): entry is { at: number; value: number } => entry.value !== undefined);

  const before = known.filter((entry) => entry.at < index).at(-1) ?? { at: 0, value: 0 };
  const after = known.find((entry) => entry.at > index) ?? { at: positions.length - 1, value: 1 };

  return [before, after];
};

export const normalizeStops = (raw: readonly RawStop[]): readonly Stop[] => {
  if (raw.length === 0) return [];

  const positions = anchored(raw);

  const spread = positions.map((value, index) => {
    if (value !== undefined) return value;
    const [before, after] = neighbours(positions, index);
    const span = after.at - before.at;
    return span === 0
      ? before.value
      : before.value + ((after.value - before.value) * (index - before.at)) / span;
  });

  return raw
    .map((stop, index) => ({
      color: toColor(stop.color),
      position: clamp(spread[index] ?? 0),
    }))
    .sort((a, b) => a.position - b.position);
};
