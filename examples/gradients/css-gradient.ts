import { gradient } from '../../src/index'
import { backdrop, bar, blank, heading, note, row, save } from '../support'

const PASTED = [
  'linear-gradient(135deg, #ff7a59, #7c2bff)',
  'linear-gradient(90deg, #00d4ff 0%, #635bff 100%)',
  'linear-gradient(to right, hotpink, cyan)',
  'radial-gradient(#fcee0a, #ff003c)',
] as const

save('css-gradient', {
  title: 'pasted from css',
  background: backdrop('tailwind'),
  lines: [
    heading('  paste a CSS gradient straight in, no rewriting'),
    note('the angle and the stop list survive; the terminal renders what the browser would'),
    blank,
    ...PASTED.map((spec) => row(spec, gradient(spec)(bar(24)), 50)),
    blank,
    heading('  and it comes back out as CSS'),
    ...PASTED.map((spec) => row('', gradient(spec).css(), 2)),
  ],
})
