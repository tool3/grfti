import { color, gradient } from '../../src/index'
import { backdrop, blank, call, heading, note, save, stack } from '../support'

const brand = gradient('#00d4ff', '#635bff')

const pad = (text: string, width = 58): string => ` ${text} `.padEnd(width)

const STEPS = ['BUILD', 'TEST', 'SIGN', 'UPLOAD', 'RELEASE']

save('background', {
  title: 'painting the background',
  background: backdrop('stripe'),
  lines: [
    heading('  .bg paints behind the text instead of the glyphs'),
    call(`const brand = gradient('#00d4ff', '#635bff')`),
    blank,
    stack('brand.bg', brand.bg(pad('deploying to production'))),
    blank,
    stack('brand.reverse.bg', brand.reverse.bg(pad('rolling back'))),
    blank,
    heading('  vertical, so every line gets its own band'),
    stack('brand.vertical.bg', brand.vertical.bg(STEPS.map((step) => pad(step)).join('\n'))),
    blank,
    heading('  a single color works the same way'),
    stack("color('#ff2e97').bg", color('#ff2e97').bg(pad('one solid color'))),
    note('foreground and background compose — paint the text, then the block it sits in'),
  ],
})
