import { gradient } from '../../src/index'
import { backdrop, blank, call, grid, heading, save, stack } from '../support'

const brand = gradient('#ff7a59', '#c860a8', '#7c2bff')

save('directions', {
  title: 'directions',
  background: backdrop('sunset'),
  lines: [
    heading('  the same gradient, run three ways'),
    call(`const brand = gradient('#ff7a59', '#c860a8', '#7c2bff')`),
    blank,
    stack('brand.horizontal', brand.horizontal(grid(4, 56))),
    blank,
    stack('brand.vertical', brand.vertical(grid(8, 56))),
    blank,
    stack('brand.diagonal', brand.diagonal(grid(8, 56))),
  ],
})
