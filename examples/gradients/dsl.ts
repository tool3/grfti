import { gradient } from '../../src/index'
import { backdrop, bar, blank, heading, note, row, save } from '../support'

const SPECS = [
  'pink, cyan',
  'gradient(pink, cyan)',
  'gradient(pink, cyan):reverse',
  'sunset',
  'sunset:reverse',
  'sunset:rgb',
  'red 0%, yellow 25%, green 100%',
  'linear-gradient(135deg, #ff7a59, #7c2bff)',
  '#ff7a59, #7c2bff:oklch',
  'pink, cyan:hsl:long',
  'rgb(255 122 89), oklch(0.6 0.24 295)',
  'ansi256(196), ansi256(51)',
  'hotpink, transparent, cyan',
] as const

save('dsl', {
  title: 'the string dsl',
  background: backdrop('stripe'),
  lines: [
    heading('  one string says everything: colors first, then :flags in any order'),
    note('the same syntax works in a shell flag, a config file and a TypeScript call'),
    blank,
    ...SPECS.map((spec) => row(spec, gradient(spec)(bar(26)), 44)),
  ],
})
