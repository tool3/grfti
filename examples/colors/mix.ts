import { color } from '../../src/index'
import type { ColorSpace } from '../../src/index'
import { BLOCK, backdrop, blank, call, dim, heading, note, row, save } from '../support'

const SPACES: readonly ColorSpace[] = ['oklab', 'oklch', 'hsl', 'hsv', 'rgb']
const AMOUNTS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] as const

const accent = color('#3d7fb3')

const blend = (space: ColorSpace): string =>
  row(
    space,
    AMOUNTS.map((amount) => accent.mix('pink', amount, space)(BLOCK.repeat(5))).join(''),
    12,
  )

save('mix', {
  title: 'mixing colors',
  background: backdrop('breeze'),
  lines: [
    heading('  #3d7fb3 mixed into pink, eleven steps, five spaces'),
    call(`accent.mix('pink', 0.25, 'oklab')`),
    blank,
    ...SPACES.map(blend),
    row('', dim(AMOUNTS.map((amount) => String(amount).padEnd(5)).join('')), 12),
    blank,
    heading('  the default is an oklab midpoint'),
    row("accent.mix('pink')", `${accent.mix('pink')(BLOCK.repeat(10))}  ${dim(accent.mix('pink').hex)}`, 32),
    row("accent.mix('gold', 0.5, 'rgb')", `${accent.mix('gold', 0.5, 'rgb')(BLOCK.repeat(10))}  ${dim(accent.mix('gold', 0.5, 'rgb').hex)}`, 32),
    note('mixRgb() is exported too, for when you already have raw channels'),
  ],
})
