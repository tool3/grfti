import { GrftiError, color, gradient } from '../../src/index'
import { backdrop, blank, dim, heading, note, save } from '../support'

const ATTEMPTS = [
  () => color('stealblue'),
  () => color('#zzzzzz'),
  () => gradient('sunsett'),
  () => gradient('pink, cyan:vertcal'),
  () => gradient('pink, cyan:oklabb'),
  () => gradient(''),
] as const

const SOURCES = [
  "color('stealblue')",
  "color('#zzzzzz')",
  "gradient('sunsett')",
  "gradient('pink, cyan:vertcal')",
  "gradient('pink, cyan:oklabb')",
  "gradient('')",
] as const

const messageOf = (attempt: () => unknown): string => {
  try {
    attempt()
    return 'no error'
  } catch (error) {
    return error instanceof GrftiError ? error.message : String(error)
  }
}

const report = (attempt: () => unknown, index: number): readonly string[] => [
  `  ${color('#ff6363')('✗')} ${SOURCES[index] ?? ''}`,
  `    ${dim(messageOf(attempt))}`,
  '',
]

save('errors', {
  title: 'when it goes wrong',
  background: backdrop('passion'),
  lines: [
    heading('  a typo gets a GrftiError with the nearest match attached'),
    note('the same suggestions the CLI prints, because it is the same parser'),
    blank,
    ...ATTEMPTS.flatMap(report),
  ],
})
