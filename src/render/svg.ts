import type { GradientSpec } from '../gradient/spec';
import type { Direction, Stop, SvgOptions } from '../types';

const COORDS: Record<Direction, readonly [string, string, string, string]> = {
  horizontal: ['0%', '0%', '100%', '0%'],
  vertical: ['0%', '0%', '0%', '100%'],
  diagonal: ['0%', '0%', '100%', '100%'],
};

const percent = (position: number): string => `${Number((position * 100).toFixed(2))}%`;

const opaqueHex = ({ color }: Stop): string => color.hex.slice(0, 7);

const stopElement = (stop: Stop): string => {
  const opacity = stop.color.rgb.alpha < 1 ? ` stop-opacity="${Number(stop.color.rgb.alpha.toFixed(3))}"` : '';
  return `<stop offset="${percent(stop.position)}" stop-color="${opaqueHex(stop)}"${opacity}/>`;
};

export const toSvg = (spec: GradientSpec, options: SvgOptions = {}): string => {
  const id = options.id ?? 'grfti-gradient';
  const stops = spec.stops.map(stopElement).join('\n    ');

  if (options.kind === 'radial') {
    return `<radialGradient id="${id}">\n    ${stops}\n  </radialGradient>`;
  }

  const [x1, y1, x2, y2] = COORDS[spec.direction];
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">\n    ${stops}\n  </linearGradient>`;
};
