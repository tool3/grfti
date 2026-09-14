import { color } from '../../src/index'
import { BLOCK, RESET, backdrop, blank, dim, heading, note, row, save } from '../support'

const SAMPLES = [
  '#3d7fb3',
  '#ff7a59',
  '#7c2bff',
  '#fcee0a',
  '#05ffa1',
  '#1a1a2e',
  'slategray',
  'papayawhip',
] as const

const round = (value: number): number => Number(value.toFixed(2))

const grade = (ratio: number): string =>
  (ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA large' : 'fail').padEnd(8)

const report = (input: string): string => {
  const sample = color(input)
  const onWhite = sample.contrast('white')
  const onBlack = sample.contrast('black')
  const swatch = sample.bg(` ${input.padEnd(11)} `)
  const readable = sample.isDark ? color('white') : color('black')
  const chip = `${readable.ansi}${sample.bg.ansi} Aa ${RESET}`

  return row(
    input,
    [
      swatch,
      ` ${chip} `,
      dim(`white ${String(round(onWhite)).padStart(5)}:1 ${grade(onWhite)}`),
      dim(`  black ${String(round(onBlack)).padStart(5)}:1 ${grade(onBlack)}`),
      dim(`  isDark ${String(sample.isDark).padEnd(5)}`),
    ].join(''),
    12,
  )
}

save('contrast', {
  title: 'contrast and legibility',
  background: backdrop('mono'),
  lines: [
    heading('  WCAG contrast ratios, straight off the color'),
    note('isDark picks the readable foreground; contrast() grades the pair'),
    blank,
    ...SAMPLES.map(report),
    blank,
    heading('  darkening until a color passes AA on white'),
    ...[0, 0.1, 0.2, 0.3, 0.4].map((amount) => {
      const shade = color('#5ee7df').darken(amount)
      const ratio = shade.contrast('white')
      return row(
        `darken(${amount})`,
        `${shade(BLOCK.repeat(10))}  ${dim(shade.hex)}  ${dim(`${String(round(ratio)).padStart(5)}:1  ${grade(ratio)}`)}`,
        14,
      )
    }),
  ],
})
