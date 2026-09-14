import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { shellfie, themes } from 'shellfie'
import type { Theme } from 'shellfie'
import { color, gradient } from '../src/index'
import type { GradientSource } from '../src/types'

// examples render into a file, never a tty, so grfti would drop every escape without this
process.env.FORCE_COLOR = '3'

const outputs = join(dirname(fileURLToPath(import.meta.url)), 'svgs')

export const RESET = '\x1b[0m'
const LABEL_WIDTH = 14

export const BLOCK = '█'
export const SHADES = ['░', '▒', '▓', '█'] as const

export const bar = (width = 52): string => BLOCK.repeat(width)

export const grid = (rows: number, columns = 52): string =>
  Array.from({ length: rows }, () => bar(columns)).join('\n')

export const dim = (text: string): string => `\x1b[38;5;243m${text}${RESET}`
export const bright = (text: string): string => `\x1b[1;97m${text}${RESET}`

export const blank = ''
export const heading = (text: string): string => bright(text)
export const note = (text: string): string => `  ${dim(text)}`
export const rule = (width = 66): string => dim('─'.repeat(width))

export const label = (text: string, width = LABEL_WIDTH): string => dim(text.padEnd(width))

export const row = (text: string, painted: string, width = LABEL_WIDTH): string =>
  `  ${label(text, width)}  ${painted}`

export const stack = (text: string, painted: string): string =>
  [`  ${dim(text)}`, ...painted.split('\n').map((line) => `  ${line}`)].join('\n')

export const call = (source: string): string => `  ${color('#5ee7df')('❯')} ${dim(source)}`

export const backdrop = (source: GradientSource, direction = 'diagonal'): string =>
  `gradient(${gradient(source)
    .sample(3)
    .map((sampled) => sampled.hex.slice(0, 7))
    .join(', ')}:${direction})`

export interface Example {
  readonly title: string
  readonly lines: readonly string[]
  readonly background?: string
  readonly theme?: Theme
}

export const save = (name: string, example: Example): void => {
  const svg = shellfie(example.lines.join('\n'), {
    template: 'macos',
    theme: example.theme ?? themes.dark,
    title: `grfti — ${example.title}`,
    language: false,
    fontSize: 14,
    lineHeight: 1.45,
    padding: 22,
    customGlyphs: true,
    background: {
      color: example.background ?? backdrop('midnight'),
      padding: 44,
      borderRadius: 18,
    },
    watermark: dim('grfti + shellfie'),
  })

  mkdirSync(outputs, { recursive: true })
  writeFileSync(join(outputs, `${name}.svg`), svg)
  console.log(`  ${name.padEnd(18)} svgs/${name}.svg`)
}
