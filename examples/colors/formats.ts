import { BLOCK, backdrop, blank, dim, heading, note, row, save } from '../support'
import { color } from '../../src/index'

const INPUTS = [
  ['#3d7fb3', 'six-digit hex'],
  ['#38b', 'three-digit hex'],
  ['#3d7fb3cc', 'hex with alpha'],
  ['rgb(61 127 179)', 'css rgb, space separated'],
  ['rgba(61, 127, 179, 0.8)', 'css rgba, comma separated'],
  ['hsl(206.4 49.2% 47.1%)', 'css hsl'],
  ['hsv(206.4 65.9% 70.2%)', 'hsv'],
  ['oklab(0.577 -0.044 -0.095)', 'oklab'],
  ['oklch(0.577 0.105 244.9)', 'oklch'],
  ['ansi256(67)', '256-color palette index'],
  ['steelblue', 'a css color name'],
  ['\x1b[38;2;61;127;179m', 'a raw ansi escape sequence'],
] as const

const shown = (input: string): string =>
  input.startsWith('\x1b') ? input.replace('\x1b', '\\x1b') : input

const swatch = ([input, description]: readonly [string, string]): string =>
  row(
    shown(input),
    `${color(input)(BLOCK.repeat(6))}  ${dim(color(input).hex.padEnd(10))}${dim(description)}`,
    30,
  )

save('formats', {
  title: 'color input formats',
  background: backdrop('raindrop'),
  lines: [
    heading('  every input syntax grfti accepts'),
    note('most of these land on exactly #3d7fb3; a palette index and a name land nearby'),
    blank,
    ...INPUTS.map(swatch),
  ],
})
