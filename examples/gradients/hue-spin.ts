import { gradient } from '../../src/index'
import type { ColorSpace, HueSpin } from '../../src/index'
import { backdrop, bar, blank, heading, note, row, save } from '../support'

const WHEEL_SPACES: readonly ColorSpace[] = ['hsl', 'hsv', 'oklch']
const SPINS: readonly HueSpin[] = ['short', 'long']

const ramp = (space: ColorSpace, spin: HueSpin): string =>
  row(`${space} ${spin}`, gradient('#e63946', '#2a9d8f').space(space, spin)(bar(52)))

save('hue-spin', {
  title: 'hue spin',
  background: backdrop('rainbow'),
  lines: [
    heading('  red → teal, taking the short way round the wheel or the long way'),
    note("short picks the smaller arc, long forces the sweep the whole way around"),
    blank,
    ...WHEEL_SPACES.flatMap((space) => SPINS.map((spin) => ramp(space, spin))),
    blank,
    heading('  a full sweep from one color back to itself'),
    row('hsl long', gradient('red', 'red').space('hsl', 'long')(bar(52))),
    row('rainbow', gradient('rainbow')(bar(52))),
  ],
})
