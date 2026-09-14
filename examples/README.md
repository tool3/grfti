# Examples

Every part of grfti, as a script you can run. Each one paints blocks of color into a real
terminal buffer, then hands that buffer to [shellfie](https://github.com/tool3/shellfie),
which writes it out as an SVG — so the pictures below are the actual escape sequences
grfti produced, not screenshots.

```bash
npm run examples                              # render all 21
npm run example examples/gradients/spaces.ts  # or just one
npx tsx examples/gradients/spaces.ts          # same thing, spelled out
```

Every example is TypeScript and runs against `src/`, so what you see is your working copy.

They need `tsx` (already a devDependency), or any other loader that resolves extensionless
imports. Plain `node examples/gradients/spaces.ts` does **not** work:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '…/grfti/src/index'
```

That is grfti's own rule showing through — its sources carry no file extensions in their
internal imports, and Node's native type stripping insists on exact specifiers. `tsup`
resolves them at build time; `tsx` resolves them here. `ts-node` cannot, for the reason the
main README gives.

Each script builds a few lines of terminal output and saves one SVG into `svgs/`:

```ts
import { gradient } from '../../src/index'
import { bar, heading, row, save } from '../support'

save('spaces', {
  title: 'interpolation spaces',
  lines: [
    heading('  five spaces, one pair of endpoints'),
    ...SPACES.map((space) => row(space, gradient('pink', 'cyan').space(space)(bar(44)))),
  ],
})
```

In your own project that first import is `from 'grfti'`; here it points at the source so
the examples run without a build.

## Layout

| Path | Contents |
| ---- | -------- |
| `gradients/` | One script per gradient feature |
| `colors/` | One script per color feature |
| `svgs/` | Output — one `<name>.svg` per example |
| `support.ts` | `save`, the block helpers and the row/label formatting, so each example stays about grfti |
| `run-all.ts` | Runs every script in both folders |

`support.ts` also sets `FORCE_COLOR=3`, because these render into a file rather than a
terminal and grfti would otherwise — correctly — drop every escape.

## Gradients

| Example | What it shows | |
| ------- | ------------- | --- |
| [`presets`](gradients/presets.ts) | All 52 presets, as ramps | <img src="svgs/presets.svg" width="260" alt="presets"> |
| [`dsl`](gradients/dsl.ts) | Every form the string DSL takes | <img src="svgs/dsl.svg" width="260" alt="dsl"> |
| [`directions`](gradients/directions.ts) | `horizontal`, `vertical`, `diagonal` | <img src="svgs/directions.svg" width="260" alt="directions"> |
| [`spaces`](gradients/spaces.ts) | oklab / oklch / hsl / hsv / rgb, same endpoints | <img src="svgs/spaces.svg" width="260" alt="spaces"> |
| [`hue-spin`](gradients/hue-spin.ts) | `short` vs `long` round the wheel | <img src="svgs/hue-spin.svg" width="260" alt="hue spin"> |
| [`stops`](gradients/stops.ts) | Explicit positions, and the object form | <img src="svgs/stops.svg" width="260" alt="stops"> |
| [`css-gradient`](gradients/css-gradient.ts) | `linear-gradient(...)` pasted straight in | <img src="svgs/css-gradient.svg" width="260" alt="css gradient"> |
| [`chaining`](gradients/chaining.ts) | Modifiers return new gradients | <img src="svgs/chaining.svg" width="260" alt="chaining"> |
| [`background`](gradients/background.ts) | `.bg`, on one line and on many | <img src="svgs/background.svg" width="260" alt="background"> |
| [`multiline`](gradients/multiline.ts) | Banners, painted three ways | <img src="svgs/multiline.svg" width="260" alt="multiline"> |
| [`depth`](gradients/depth.ts) | truecolor / ansi256 / ansi16 / none | <img src="svgs/depth.svg" width="260" alt="depth"> |
| [`sampling`](gradients/sampling.ts) | `at`, `sample`, `stops`, `colors` — and a chart | <img src="svgs/sampling.svg" width="260" alt="sampling"> |
| [`concat`](gradients/concat.ts) | Presets, colors and gradients composed | <img src="svgs/concat.svg" width="260" alt="concat"> |
| [`handoff`](gradients/handoff.ts) | `css()`, `svg()` and the `String()` round-trip | <img src="svgs/handoff.svg" width="260" alt="handoff"> |

## Colors

| Example | What it shows | |
| ------- | ------------- | --- |
| [`named`](colors/named.ts) | All 150 named colors | <img src="svgs/named.svg" width="260" alt="named colors"> |
| [`formats`](colors/formats.ts) | Every accepted input syntax | <img src="svgs/formats.svg" width="260" alt="formats"> |
| [`adjust`](colors/adjust.ts) | `lighten`, `darken`, `saturate`, `rotate`, `alpha` | <img src="svgs/adjust.svg" width="260" alt="adjust"> |
| [`mix`](colors/mix.ts) | `mix()` across all five spaces | <img src="svgs/mix.svg" width="260" alt="mix"> |
| [`inspect`](colors/inspect.ts) | Everything one color knows about itself | <img src="svgs/inspect.svg" width="260" alt="inspect"> |
| [`contrast`](colors/contrast.ts) | WCAG ratios, `isDark`, and darkening to pass AA | <img src="svgs/contrast.svg" width="260" alt="contrast"> |
| [`errors`](colors/errors.ts) | `GrftiError` and its suggestions | <img src="svgs/errors.svg" width="260" alt="errors"> |

## Why blocks

`█` is the widest thing a terminal can paint, so a run of them is the closest a text grid
gets to a swatch. Every ramp you see is one call — `gradient('sunset')('█'.repeat(40))` —
and the terminal fills each cell with a slightly different 24-bit color. Multi-line blocks
are how `vertical` and `diagonal` become visible at all.
