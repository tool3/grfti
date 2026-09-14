import { color, rgbToAnsi16, rgbToAnsi256 } from '../../src/index'
import { backdrop, bar, blank, dim, heading, note, row, save } from '../support'

const round = (value: number, places = 3): number => Number(value.toFixed(places))

const accent = color('#3d7fb3')
const { rgb, hsl, hsv, oklab, oklch } = accent

const FACTS = [
  ['name', accent.name ?? '—'],
  ['hex', accent.hex],
  ['rgb', `rgb(${rgb.r} ${rgb.g} ${rgb.b})`],
  ['hsl', `hsl(${round(hsl.h, 1)} ${round(hsl.s * 100, 1)}% ${round(hsl.l * 100, 1)}%)`],
  ['hsv', `hsv(${round(hsv.h, 1)} ${round(hsv.s * 100, 1)}% ${round(hsv.v * 100, 1)}%)`],
  ['oklab', `oklab(${round(oklab.l)} ${round(oklab.a)} ${round(oklab.b)})`],
  ['oklch', `oklch(${round(oklch.l)} ${round(oklch.c)} ${round(oklch.h, 1)})`],
  ['css', accent.css()],
  ['ansi256', String(rgbToAnsi256(rgb))],
  ['ansi16', String(rgbToAnsi16(rgb))],
  ['luminance', String(round(accent.luminance))],
  ['isDark', String(accent.isDark)],
  ['on white', `${round(accent.contrast('white'), 2)}:1`],
  ['on black', `${round(accent.contrast('black'), 2)}:1`],
] as const

save('inspect', {
  title: 'inspecting a color',
  background: backdrop('falcon'),
  lines: [
    heading("  everything color('#3d7fb3') knows about itself"),
    blank,
    `  ${accent.bg(bar(46))}`,
    blank,
    ...FACTS.map(([name, value]) => row(name, dim(value), 12)),
    blank,
    note('the same readout the CLI prints for `grfti --info "#3d7fb3"`'),
  ],
})
