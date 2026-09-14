import { PRESETS, PRESET_NAMES, gradient } from '../../src/index'
import type { PresetName } from '../../src/index'
import { backdrop, bar, blank, call, heading, row, save } from '../support'

const swatch = (name: PresetName): string =>
  row(name, `${gradient(name)(bar(40))}  ${PRESETS[name].colors.join(' ')}`, 12)

save('presets', {
  title: 'presets',
  background: backdrop('vaporwave'),
  lines: [
    heading(`  ${PRESET_NAMES.length} presets, reachable by name or as a property`),
    call(`gradient.sunset('hello')  ·  gradient('sunset')('hello')`),
    blank,
    ...PRESET_NAMES.map(swatch),
  ],
})
