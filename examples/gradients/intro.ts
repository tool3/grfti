import type { PresetName } from '../../src/index'
import { PRESET_NAMES, gradient } from '../../src/index'
import { backdrop, bar, blank, row, save, stack } from '../support'

const swatch = (name: PresetName): string =>
  row(name, `${gradient(name)(bar(40))}`, 12)

const BANNER = [
  '        ██████╗ ██████╗ ███████╗████████╗██╗',
  '       ██╔════╝ ██╔══██╗██╔════╝╚══██╔══╝██║',
  '       ██║  ███╗██████╔╝█████╗     ██║   ██║',
  '       ██║   ██║██╔══██╗██╔══╝     ██║   ██║',
  '       ╚██████╔╝██║  ██║██║        ██║   ██║',
  '        ╚═════╝ ╚═╝  ╚═╝╚═╝        ╚═╝   ╚═╝',
].join('\n')

save('intro', {
  title: 'grfti',
  background: backdrop('vaporwave'),
  lines: [
    stack("", gradient('vaporwave')(BANNER)),
    blank,
    ...PRESET_NAMES.slice(0, 10).map(swatch),
    blank,
    stack(`...and ${PRESET_NAMES.length - 10} more`, ''),
  ],
})
