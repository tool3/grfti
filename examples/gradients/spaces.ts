import { gradient } from '../../src/index'
import type { ColorSpace } from '../../src/index'
import { backdrop, bar, blank, heading, note, row, save } from '../support'

const SPACES: readonly ColorSpace[] = ['oklab', 'oklch', 'hsl', 'hsv', 'rgb']

const PAIRS = [
  ['pink', 'cyan'],
  ['blue', 'yellow'],
  ['#ff0000', '#00ff00'],
] as const

const ramp = ([from, to]: readonly [string, string], space: ColorSpace): string =>
  row(space, `${gradient(from, to).space(space)(bar(44))}  ${gradient(from, to).space(space).at(0.5).hex}`)

const block = (pair: readonly [string, string]): readonly string[] => [
  heading(`  ${pair[0]} → ${pair[1]}`),
  ...SPACES.map((space) => ramp(pair, space)),
  blank,
]

save('spaces', {
  title: 'interpolation spaces',
  background: backdrop('prisma'),
  lines: [
    heading('  five spaces, one pair of endpoints — the midpoint hex is on the right'),
    note('oklab is the default: no grey sag, no muddy dip, no hue drift'),
    blank,
    ...PAIRS.flatMap(block),
  ],
})
