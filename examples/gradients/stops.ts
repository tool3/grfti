import { gradient } from '../../src/index'
import { backdrop, bar, blank, dim, heading, note, row, save } from '../support'

const RULER = `${dim('0%')}${' '.repeat(8)}${dim('25%')}${' '.repeat(29)}${dim('100%')}`

const SPECS = [
  'red, yellow, green',
  'red 0%, yellow 25%, green 100%',
  'red 0%, yellow 75%, green 100%',
  'red 0%, red 49%, green 51%, green 100%',
  'black 0%, white 20%, black 40%, white 60%, black 80%, white 100%',
] as const

save('stops', {
  title: 'explicit stops',
  background: backdrop('fire'),
  lines: [
    heading('  positions are optional — give them and the ramp bends where you say'),
    note('a position is a percentage or a 0–1 number, written after the color'),
    blank,
    ...SPECS.map((spec) => row(spec, gradient(spec)(bar(46)), 64)),
    blank,
    `  ${' '.repeat(64)}  ${RULER}`,
    blank,
    heading('  the object form does the same thing'),
    row(
      "{ color: 'red', position: 0 }, …",
      gradient(
        { color: 'red', position: 0 },
        { color: 'yellow', position: 0.25 },
        { color: 'green', position: 1 },
      )(bar(46)),
      64,
    ),
  ],
})
