import { gradient } from '../../src/index'
import type { ColorDepth } from '../../src/index'
import { backdrop, bar, blank, heading, note, row, save } from '../support'

const DEPTHS: readonly ColorDepth[] = ['truecolor', 'ansi256', 'ansi16', 'none']

const LEGEND: Record<ColorDepth, string> = {
  truecolor: '24-bit, exactly the color asked for',
  ansi256: 'nearest of the 256 palette entries',
  ansi16: 'nearest of the 16 base colors',
  none: 'escapes stripped, text untouched',
}

const ramp = (source: string, depth: ColorDepth): string =>
  row(depth, `${gradient(source).depth(depth)(bar(44))}  ${LEGEND[depth]}`, 12)

save('depth', {
  title: 'color depth',
  background: backdrop('noir'),
  lines: [
    heading('  depth is detected per paint, or pinned — worth pinning in tests'),
    note('FORCE_COLOR, NO_COLOR, GRFTI_DEPTH, COLORTERM, TERM, TERM_PROGRAM, CI, isTTY'),
    blank,
    heading('  sunset'),
    ...DEPTHS.map((depth) => ramp('sunset', depth)),
    blank,
    heading('  rainbow'),
    ...DEPTHS.map((depth) => ramp('rainbow', depth)),
    blank,
    heading('  noir'),
    ...DEPTHS.map((depth) => ramp('noir', depth)),
  ],
})
