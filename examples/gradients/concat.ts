import { gradient } from '../../src/index'
import { backdrop, bar, blank, heading, note, row, save } from '../support'

const COMBINATIONS = [
  ["gradient('sunset')", gradient('sunset')],
  ["gradient('ice')", gradient('ice')],
  ["gradient('sunset', 'ice')", gradient('sunset', 'ice')],
  ["gradient('sunset:reverse', 'midnight')", gradient('sunset:reverse', 'midnight')],
  ["gradient('fire', 'abyss', 'toxic')", gradient('fire', 'abyss', 'toxic')],
  ["gradient('sunset', '#000000')", gradient('sunset', '#000000')],
  ["gradient('matrix', gradient('amber'))", gradient('matrix', gradient('amber'))],
] as const

save('concat', {
  title: 'composing sources',
  background: backdrop('ember'),
  lines: [
    heading('  presets, colors and whole gradients concatenate into one ramp'),
    note('anything gradient() accepts as one argument, it accepts as several'),
    blank,
    ...COMBINATIONS.map(([source, value]) => row(source, value(bar(38)), 40)),
  ],
})
