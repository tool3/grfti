import { escapeFor, ESC, resetFor } from '../color/depth';
import { detectDepth } from '../env';
import { colorAt } from '../gradient/sample';
import type { GradientSpec } from '../gradient/spec';
import type { ColorDepth } from '../types';

const ANSI_SPLIT = new RegExp(`(${ESC}\\[[0-9;]*m)`);
const ANSI_EXACT = new RegExp(`^${ESC}\\[[0-9;]*m$`);

const segmenter =
  typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : undefined;

const graphemes = (text: string): readonly string[] =>
  segmenter === undefined ? [...text] : Array.from(segmenter.segment(text), (entry) => entry.segment);

interface Part {
  readonly ansi: boolean;
  readonly graphemes: readonly string[];
}

interface Cell {
  readonly char: string;
  readonly column: number;
}

const partsOf = (line: string): readonly Part[] =>
  line
    .split(ANSI_SPLIT)
    .filter((part) => part.length > 0)
    .map((part) =>
      ANSI_EXACT.test(part)
        ? { ansi: true, graphemes: [part] }
        : { ansi: false, graphemes: graphemes(part) },
    );

const printableWidth = (parts: readonly Part[]): number =>
  parts.reduce((total, part) => total + (part.ansi ? 0 : part.graphemes.length), 0);

const cellsOf = (parts: readonly Part[]): readonly Cell[] => {
  const offsets = parts.map((_, index) => printableWidth(parts.slice(0, index)));

  return parts.flatMap((part, index) =>
    part.ansi
      ? [{ char: part.graphemes[0] as string, column: -1 }]
      : part.graphemes.map((char, offset) => ({ char, column: (offsets[index] ?? 0) + offset })),
  );
};

const axis = (index: number, size: number): number => (size <= 1 ? 0 : index / (size - 1));

type EscapeAt = (column: number, row: number) => string;

const escapeResolver = (
  spec: GradientSpec,
  depth: ColorDepth,
  width: number,
  rows: number,
): EscapeAt => {
  const escape = (position: number): string =>
    escapeFor(colorAt(spec, position).rgb, depth, spec.background);

  switch (spec.direction) {
    case 'horizontal': {
      const byColumn = Array.from({ length: width }, (_, column) => escape(axis(column, width)));
      return (column) => byColumn[column] ?? '';
    }
    case 'vertical': {
      const byRow = Array.from({ length: rows }, (_, row) => escape(axis(row, rows)));
      return (_column, row) => byRow[row] ?? '';
    }
    case 'diagonal':
      return (column, row) =>
        escape(
          rows <= 1
            ? axis(column, width)
            : width <= 1
              ? axis(row, rows)
              : (axis(column, width) + axis(row, rows)) / 2,
        );
  }
};

const renderLine = (
  cells: readonly Cell[],
  row: number,
  escapeAt: EscapeAt,
  reset: string,
): string => {
  const keys = cells.map((cell) => (cell.column < 0 ? undefined : escapeAt(cell.column, row)));
  const starts = keys
    .map((_, index) => index)
    .filter((index) => index === 0 || keys[index] === undefined || keys[index] !== keys[index - 1]);

  return starts
    .map((start, order) => {
      const body = cells
        .slice(start, starts[order + 1] ?? cells.length)
        .map((cell) => cell.char)
        .join('');
      const escape = keys[start];
      return escape === undefined || escape === '' ? body : `${escape}${body}${reset}`;
    })
    .join('');
};

export const paintText = (spec: GradientSpec, input: unknown): string => {
  const text = String(input ?? '');
  const depth = spec.depth ?? detectDepth();
  if (depth === 'none' || text.length === 0) return text;

  const lines = text.split('\n').map(partsOf);
  const width = Math.max(1, ...lines.map(printableWidth));
  const escapeAt = escapeResolver(spec, depth, width, lines.length);
  const reset = resetFor(spec.background);

  return lines.map((parts, row) => renderLine(cellsOf(parts), row, escapeAt, reset)).join('\n');
};
