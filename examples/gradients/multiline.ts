import { gradient } from '../../src/index'
import { backdrop, blank, heading, note, save, stack } from '../support'

const BANNER = [
  ' ██████╗ ██████╗ ███████╗████████╗██╗',
  '██╔════╝ ██╔══██╗██╔════╝╚══██╔══╝██║',
  '██║  ███╗██████╔╝█████╗     ██║   ██║',
  '██║   ██║██╔══██╗██╔══╝     ██║   ██║',
  '╚██████╔╝██║  ██║██║        ██║   ██║',
  ' ╚═════╝ ╚═╝  ╚═╝╚═╝        ╚═╝   ╚═╝',
].join('\n')

save('multiline', {
  title: 'multi-line input',
  background: backdrop('synthwave'),
  lines: [
    heading('  multi-line strings just work — no .multiline() call needed'),
    note('every line is painted across the width of the widest one, so columns stay straight'),
    blank,
    stack("gradient('synthwave')", gradient('synthwave')(BANNER)),
    blank,
    stack("gradient.vertical('atlas')", gradient.vertical('atlas')(BANNER)),
    blank,
    stack("gradient('cyberpunk:diagonal')", gradient('cyberpunk:diagonal')(BANNER)),
    blank,
    stack("gradient('vaporwave:vertical:reverse')", gradient('vaporwave:vertical:reverse')(BANNER)),
  ],
})
