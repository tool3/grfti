import { gradient } from '../../src/index'
import { backdrop, bar, blank, call, heading, note, row, save } from '../support'

const brand = gradient('#ff7a59', '#7c2bff')

const VARIANTS = [
  ['brand', brand],
  ['brand.reverse', brand.reverse],
  ['brand.reverse.reverse', brand.reverse.reverse],
  ['brand.space("oklch")', brand.space('oklch')],
  ['brand.space("rgb")', brand.space('rgb')],
  ['brand.depth("ansi256")', brand.depth('ansi256')],
  ['brand.depth("ansi16")', brand.depth('ansi16')],
] as const

save('chaining', {
  title: 'chaining',
  background: backdrop('royal'),
  lines: [
    heading('  every modifier returns a new gradient — the original is never touched'),
    call(`const brand = gradient('#ff7a59', '#7c2bff')`),
    note('chain as far as you like; nothing mutates'),
    blank,
    ...VARIANTS.map(([name, value]) => row(name, value(bar(44)), 24)),
    blank,
    heading('  the base gradient, still exactly as it started'),
    row('brand', brand(bar(44)), 24),
  ],
})
