import { gradient } from '../../src/index'
import { BLOCK, backdrop, bar, blank, call, dim, heading, note, row, save } from '../support'

const brand = gradient('#ff7a59', '#c860a8', '#7c2bff')

const USAGE = [
  ['gzip', 92],
  ['esbuild', 78],
  ['swc', 64],
  ['rollup', 51],
  ['terser', 37],
  ['babel', 22],
] as const

const bars = brand.sample(USAGE.length)

const chart = USAGE.map(([name, value], index) =>
  row(name, `${bars[index]?.(BLOCK.repeat(Math.round(value / 2))) ?? ''} ${dim(String(value))}`, 10),
)

save('sampling', {
  title: 'reading the colors out',
  background: backdrop('atlas'),
  lines: [
    heading('  a gradient is a color ramp, not only a text painter'),
    call(`const brand = gradient('#ff7a59', '#c860a8', '#7c2bff')`),
    blank,
    row('brand.at(0)', brand.at(0).hex, 22),
    row('brand.at(0.5)', brand.at(0.5).hex, 22),
    row('brand.at(1)', brand.at(1).hex, 22),
    row('brand.colors', brand.colors.map((each) => each.hex).join(' '), 22),
    row('brand.stops', brand.stops.map((stop) => `${stop.color.hex}@${stop.position}`).join(' '), 22),
    blank,
    heading('  brand.sample(5)'),
    row('', brand.sample(5).map((each) => each(bar(10))).join(''), 2),
    row('', dim(brand.sample(5).map((each) => each.hex.padEnd(10)).join('')), 2),
    blank,
    heading('  which is all a chart needs — sample(bars.length), one color per bar'),
    note('same ramp, shared by the terminal painter, a chart, a CSS string and an SVG def'),
    blank,
    ...chart,
  ],
})
