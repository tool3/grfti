import { gradient } from '../../src/index'
import { backdrop, bar, blank, dim, heading, note, row, save } from '../support'

const brand = gradient('#ff7a59', '#7c2bff')
const roundTripped = gradient(String(brand))

save('handoff', {
  title: 'css, svg and round-trips',
  background: backdrop('gemini'),
  lines: [
    heading('  the same ramp, handed to whatever renders next'),
    blank,
    row('brand.css()', dim(brand.css()), 30),
    row('brand.vertical.css()', dim(brand.vertical.css()), 30),
    row('brand.css({ angle: 45 })', dim(brand.css({ angle: 45 })), 30),
    row("brand.css({ kind: 'radial' })", dim(brand.css({ kind: 'radial' })), 30),
    blank,
    heading("  brand.svg({ id: 'hero' })"),
    ...brand.svg({ id: 'hero' }).split('\n').map((line) => `    ${dim(line)}`),
    blank,
    heading("  brand.svg({ id: 'hero', kind: 'radial' })"),
    ...brand
      .svg({ id: 'hero', kind: 'radial' })
      .split('\n')
      .map((line) => `    ${dim(line)}`),
    blank,
    heading('  String(brand) parses back into the same gradient'),
    row('String(brand)', dim(String(brand)), 26),
    row('brand', brand(bar(44)), 26),
    row('gradient(String(brand))', roundTripped(bar(44)), 26),
    note(`identical: ${String(brand) === String(roundTripped)}`),
  ],
})
