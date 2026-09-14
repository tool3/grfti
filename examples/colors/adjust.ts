import { color } from '../../src/index'
import type { Color } from '../../src/index'
import { BLOCK, backdrop, blank, call, dim, heading, note, row, save } from '../support'

const accent = color('#3d7fb3')

const STEPS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] as const
const DEGREES = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324, 360] as const

const ramp = (make: (amount: number) => Color, amounts: readonly number[] = STEPS): string =>
  amounts.map((amount) => make(amount)(BLOCK.repeat(5))).join('')

const ruler = (amounts: readonly number[]): string =>
  dim(amounts.map((amount) => String(amount).padEnd(5)).join(''))

save('adjust', {
  title: 'adjusting a color',
  background: backdrop('abyss'),
  lines: [
    heading('  every adjustment is perceptual, done in oklch, and returns a new color'),
    call(`const accent = color('#3d7fb3')`),
    blank,
    row('lighten', ramp((amount) => accent.lighten(amount)), 12),
    row('darken', ramp((amount) => accent.darken(amount)), 12),
    row('saturate', ramp((amount) => accent.saturate(amount)), 12),
    row('desaturate', ramp((amount) => accent.desaturate(amount)), 12),
    row('', ruler(STEPS), 12),
    blank,
    heading('  rotate walks the hue wheel, 0 through 360'),
    row('rotate', ramp((degrees) => accent.rotate(degrees), DEGREES), 12),
    row('', ruler(DEGREES), 12),
    blank,
    heading('  alpha rides along on the color'),
    note('terminals have nowhere to put it, so it shows up in hex, css() and svg() instead'),
    blank,
    ...[1, 0.8, 0.5, 0.2].map((amount) =>
      row(
        `accent.alpha(${amount})`,
        `${accent.alpha(amount)(BLOCK.repeat(10))}  ${dim(accent.alpha(amount).hex)}  ${dim(accent.alpha(amount).css())}`,
        22,
      ),
    ),
  ],
})
