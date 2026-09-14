import { NAMED_COLOR_NAMES, color } from '../../src/index'
import { BLOCK, backdrop, blank, dim, heading, note, save } from '../support'

const COLUMNS = 4

const cell = (name: string): string => `${color(name)(BLOCK.repeat(3))} ${dim(name.padEnd(22))}`

const rows = NAMED_COLOR_NAMES.reduce<readonly string[]>(
  (lines, name, index) =>
    index % COLUMNS === 0
      ? [...lines, `  ${cell(name)}`]
      : [...lines.slice(0, -1), `${lines.at(-1) ?? ''}${cell(name)}`],
  [],
).map((line) => line.trimEnd())

save('named', {
  title: 'named colors',
  background: backdrop('pastel'),
  lines: [
    heading(`  ${NAMED_COLOR_NAMES.length} names, every one of them autocompleting`),
    note("the CSS set, plus 'marine' and 'transparent' — and no name collides with a preset"),
    blank,
    ...rows,
  ],
})
