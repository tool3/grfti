# grfti

Spray color and gradients across your terminal. TypeScript-native, zero dependencies, perceptually smooth.

```ts
import { gradient, color } from 'grfti';

gradient('pink', 'cyan')('hello world');
gradient('sunset')(banner);
gradient('gradient(green, yellow):reverse:vertical')(banner);

color('pink')('just this color');
color('#3d7fb3').lighten(0.2).hex;
```

<p align="center">
  <a href="./examples/gradients/multiline.ts">
    <img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/multiline.svg" width="620" alt="a banner painted four ways">
  </a>
</p>

Everything below is a picture of a real terminal buffer — grfti painted it, and
[shellfie](https://github.com/tool3/shellfie) wrote it out as SVG. Each one links to the
script that made it.

## Install

```sh
npm install grfti
```

## Why grfti

| | grfti | gradient-string |
| --- | --- | --- |
| Dependencies | none | chalk, tinygradient, tinycolor2 |
| Written in | TypeScript | TypeScript |
| Multi-line strings | just work | need `.multiline()` |
| Direction | horizontal, vertical, diagonal | horizontal only |
| Interpolation | oklab (default), oklch, hsl, hsv, rgb | rgb, hsv |
| Out-of-gamut colors | mapped by chroma reduction | channel-clipped |
| Color input | names, hex, `rgb()`, `hsl()`, `hsv()`, `oklab()`, `oklch()`, ANSI escapes, 256-index | whatever tinycolor2 takes |
| Terminal depth | truecolor / 256 / 16 / none, auto-detected | truecolor only |
| Also renders | CSS, SVG, sampled color arrays | terminal text |
| Autocomplete | every color and preset name | none |
| Presets | 52 | 13 (all included here) |

Drop-in for the common cases — same `gradient(...)` call, same preset names on the factory:

```ts
import gradient from 'grfti';

gradient(['red', 'blue'])('hello');
gradient(['red', 'blue'], { interpolation: 'hsv', hsvSpin: 'long' })('hello');
gradient.atlas('hello');
gradient.atlas.multiline(banner);
```

## The string DSL

Every gradient is expressible as one string, so a terminal flag, a config file and a
TypeScript call all use the same syntax. Colors first, then `:flags` in any order.

```ts
gradient('pink, cyan');                            // bare list
gradient('gradient(pink, cyan)');                  // wrapped
gradient('gradient(pink, cyan:vertical)');         // flags inside
gradient('gradient(pink, cyan):vertical:reverse'); // flags outside
gradient('pink', 'cyan:vertical');                 // flags on any argument
gradient('sunset:reverse');                        // a preset, reversed
gradient('red 0%, yellow 25%, green 100%');        // explicit stops
gradient('linear-gradient(135deg, #ff7a59, #7c2bff)'); // pasted from CSS
```

<a href="./examples/gradients/dsl.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/dsl.svg" width="720" alt="dsl"></a>

| Flags | |
| --- | --- |
| Direction | `horizontal` `h` `row`, `vertical` `v` `column`, `diagonal` `diag` `d` |
| Reverse | `reverse` `reversed` `rev` `r` |
| Space | `oklab` `oklch` `hsl` `hsv` `hsb` `rgb` |
| Hue spin | `short` `long` |
| Depth | `truecolor` `24bit`, `ansi256` `256`, `ansi16` `16`, `none` `plain` |
| Background | `bg` `background` `on` |

Colors can be a CSS name, `#rgb` / `#rgba` / `#rrggbb` / `#rrggbbaa`, `rgb()` / `rgba()`,
`hsl()` / `hsla()`, `hsv()`, `oklab()`, `oklch()`, `ansi256(196)`, or a raw ANSI escape
sequence. An unknown color or flag throws a `GrftiError` that suggests the nearest match.

<a href="./examples/gradients/stops.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/stops.svg" width="380" alt="stops"></a> <a href="./examples/gradients/css-gradient.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/css-gradient.svg" width="380" alt="css-gradient"></a>

<a href="./examples/colors/errors.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/errors.svg" width="720" alt="errors"></a>

## Gradients

`gradient(...)` returns a callable, immutable gradient. Every modifier returns a new one.

```ts
const brand = gradient('#ff7a59', '#7c2bff');

brand('hello');                   // paint, horizontally
brand.vertical(banner);           // paint, down the lines
brand.diagonal(banner);           // paint, across both axes
brand.reverse.vertical(banner);   // chain as far as you like
brand.bg('  padded  ');           // paint the background instead
brand.space('oklch')(banner);     // pick the interpolation space
brand.depth('ansi256')(banner);   // pin the color depth

gradient.vertical('#ff7a59', '#7c2bff')(banner); // or set direction up front
```

<a href="./examples/gradients/directions.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/directions.svg" width="380" alt="directions"></a> <a href="./examples/gradients/chaining.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/chaining.svg" width="380" alt="chaining"></a>

<a href="./examples/gradients/background.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/background.svg" width="720" alt="background"></a>

Multi-line input is handled without asking. Each line is painted across the width of the
widest line, so columns line up — ASCII art and figlet banners come out straight.

```ts
gradient.atlas(`
 ___  ___  ___
|   ||   ||   |
|___||___||___|
`);
```

The banner at the top of this page is exactly that, painted four ways —
[`examples/gradients/multiline.ts`](./examples/gradients/multiline.ts).

Grapheme clusters stay whole (emoji and combining marks are never split), existing ANSI
escapes in the input pass through untouched, and runs of identical color share one escape.

### Reading the colors out

A gradient is a color ramp, not just a text painter:

```ts
brand.at(0.5).hex;                      // '#c860a8'
brand.sample(5).map((c) => c.hex);       // five evenly spaced stops
brand.stops;                             // [{ color, position }, ...]
brand.colors;                            // just the colors
```

<a href="./examples/gradients/sampling.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/sampling.svg" width="720" alt="sampling"></a>

That is what makes it shareable across renderers — a chart colors its bars with
`sample(bars.length)`, an SVG writer asks for `svg()`, a web preview asks for `css()`.

```ts
brand.css();                    // 'linear-gradient(90deg, #ff7a59 0%, #7c2bff 100%)'
brand.vertical.css();           // 'linear-gradient(180deg, ...)'
brand.css({ angle: 45 });
brand.svg({ id: 'bg' });        // '<linearGradient id="bg" x1="0%" ...>'
String(brand);                  // 'gradient(#ff7a59 0%, #7c2bff 100%):horizontal:oklab'
```

`String(gradient)` round-trips: the output parses back into an equivalent gradient.

<a href="./examples/gradients/handoff.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/handoff.svg" width="720" alt="handoff"></a>

## Colors

`color(...)` returns a callable, immutable color with the same shape.

```ts
const accent = color('#3d7fb3');

accent('hello');          // paint the text
accent.bg('hello');       // paint the background
accent.ansi;              // the raw escape sequence

accent.hex;               // '#3d7fb3'
accent.rgb;               // { r, g, b, alpha }
accent.hsl;               // { h, s, l, alpha }
accent.hsv;
accent.oklab;
accent.oklch;
accent.name;              // the CSS color name, when it has one
accent.luminance;
accent.isDark;

accent.lighten(0.1);      // perceptual, in oklch
accent.darken(0.1);
accent.saturate(0.3);
accent.desaturate(0.3);
accent.rotate(180);
accent.alpha(0.5);
accent.mix('pink');               // oklab midpoint
accent.mix('pink', 0.25, 'hsl');
accent.contrast('white');         // WCAG ratio
```

<a href="./examples/colors/formats.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/formats.svg" width="380" alt="formats"></a> <a href="./examples/colors/inspect.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/inspect.svg" width="380" alt="inspect"></a>

<a href="./examples/colors/adjust.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/adjust.svg" width="380" alt="adjust"></a> <a href="./examples/colors/mix.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/mix.svg" width="380" alt="mix"></a>

<a href="./examples/colors/contrast.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/contrast.svg" width="720" alt="contrast"></a>

Every name it answers to:

<a href="./examples/colors/named.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/named.svg" width="720" alt="named"></a>

Standalone helpers are exported too: `rgb()`, `hsl()`, `oklch()`, `parseRgb()`,
`tryParseRgb()`, `mixRgb()`, `rgbToOklab()`, `rgbToAnsi256()`, `ansi256ToRgb()`, and the
rest of the conversion set.

## Color depth

Depth is detected once per paint from `FORCE_COLOR`, `NO_COLOR`, `GRFTI_DEPTH`, `COLORTERM`,
`TERM`, `TERM_PROGRAM`, `CI` and whether stdout is a TTY. Truecolor terminals get 24-bit
escapes; 256-color terminals get the nearest palette entry, chosen by comparing the color
cube against the grayscale ramp; 16-color terminals get the nearest base color; everything
else gets plain text. Pin it explicitly with `.depth('truecolor')` — worth doing in tests.

<a href="./examples/gradients/depth.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/depth.svg" width="720" alt="depth"></a>

## Presets

Reach for one by property, by name, or from the DSL:

```ts
gradient.vaporwave('hello');
gradient('vaporwave')('hello');
gradient('vaporwave:vertical:reverse')(banner);
gradient('sunset', 'ice');            // presets concatenate
```

No preset name collides with a CSS color name, so the DSL is never ambiguous.

<a href="./examples/gradients/presets.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/presets.svg" width="720" alt="presets"></a>

<a href="./examples/gradients/concat.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/concat.svg" width="720" alt="concat"></a>

| Preset | Colors |
| --- | --- |
| `atlas` | #feac5e → #c779d0 → #4bc0c8 |
| `cristal` | #bdfff3 → #4ac29a |
| `teen` | #77a1d3 → #79cbca → #e684ae |
| `mind` | #473b7b → #3584a7 → #30d2be |
| `morning` | #ff5f6d → #ffc371 |
| `vice` | #5ee7df → #b490ca |
| `passion` | #f43b47 → #453a94 |
| `fruit` | #ff4e50 → #f9d423 |
| `instagram` | #833ab4 → #fd1d1d → #fcb045 |
| `retro` | #3f51b1 → … → #f7c978 |
| `summer` | #fdbb2d → #22c1c3 |
| `rainbow` | full hue sweep |
| `pastel` | full pastel sweep |
| `aurora` | #00c9a7 → #4aa3df → #845ec2 |
| `sunset` | #ff7a59 → #c860a8 → #7c2bff |
| `synthwave` | #ff2e97 → #7b2ff7 → #2de2e6 |
| `vaporwave` | #ff71ce → #01cdfe → #05ffa1 |
| `matrix` | #00ff41 → #008f11 |
| `amber` | #ffd166 → #ffb000 → #ff6a00 |
| `phosphor` | #00ff9f → #00d4ff |
| `midnight` | #a5b4fc → #6366f1 → #312e81 |
| `paper` | #f6f1e5 → #c9b99b |
| `hotdog` | #ff0000 → #ffff00 |
| `breeze` | #cf2f98 → #6a3dec |
| `candy` | #a58efb → #e9bff8 |
| `ember` | #ff6363 → #733434 |
| `falcon` | #bde3ec → #363654 |
| `meadow` | #59d499 → #a0872d |
| `raindrop` | #8ec7fb → #1c55aa |
| `noir` | #e6e6e6 → #4a4a4a |
| `ice` | #ffffff → #80deea |
| `sand` | #eed5b6 → #af8856 |
| `forest` | #83c98d → #2f4f38 |
| `mono` | #e0e0e0 → #3a3a3a |
| `fire` | #ffe259 → #ff6b35 → #c1121f |
| `neon` | #00f5d4 → #f15bb5 |
| `toxic` | #d8ff3e → #56ab2f |
| `royal` | #8e2de2 → #4a00e0 |
| `peach` | #ffecd2 → #fcb69f |
| `abyss` | #00c6ff → #0072ff |
| `bubblegum` | #ffafbd → #ffc3a0 |
| `cyberpunk` | #fcee0a → #00f0ff → #ff003c |
| `vercel` | #ffffff → #7a7a7a |
| `supabase` | #6ee7b7 → #3ecf8e → #12805c |
| `openai` | #74aa9c → #10a37f |
| `prisma` | #71e8df → #5a67d8 |
| `stripe` | #00d4ff → #635bff |
| `cloudflare` | #faad3f → #f6821f |
| `nuxt` | #36e4da → #00dc82 |
| `gemini` | #4285f4 → #9b72cb → #d96570 |
| `tailwind` | #38bdf8 → #818cf8 |
| `firecrawl` | #fbbf24 → #f97316 → #dc2626 |

## Types

Everything is typed, and the names autocomplete. `NamedColor` is the union of all 148 CSS
color names plus `marine` and `transparent`; `PresetName` is the union of all 52 presets. Both flow into
`gradient()` and `color()` through a literal union that still accepts arbitrary DSL
strings, so you get suggestions without losing expressiveness.

```ts
import type { Color, ColorDepth, ColorSpace, Direction, Gradient, NamedColor, PresetName, Rgb, Stop } from 'grfti';
```

## Interpolation

Default is **oklab** — perceptually uniform, so pink → cyan does not sag through grey and
blue → yellow does not dip through mud. Where a straight oklab line leaves the sRGB gamut,
grfti reduces chroma at constant lightness and hue until the color fits, instead of clipping
each channel (which shifts hue).

`oklch` interpolates hue directly, for deliberate hue sweeps. `hsl` and `hsv` are there for
compatibility and for vivid wheel spins — pair them with `long` to sweep the whole wheel.
`rgb` matches what gradient-string and most other tools do.

```ts
gradient('pink', 'cyan').at(0.5).hex;                  // '#bbe2e5'  oklab
gradient('pink', 'cyan').space('rgb').at(0.5).hex;     // '#80e0e5'  rgb
gradient('pink', 'cyan').space('oklch').at(0.5).hex;   // '#ccd1ff'  oklch
```

<a href="./examples/gradients/spaces.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/spaces.svg" width="720" alt="spaces"></a>

<a href="./examples/gradients/hue-spin.ts"><img src="https://raw.githubusercontent.com/tool3/grfti/master/examples/svgs/hue-spin.svg" width="720" alt="hue-spin"></a>

## Examples

Every picture on this page is a script in [`examples/`](./examples), and every one of them
runs:

```sh
npm run examples                     # render all 21
npx tsx examples/gradients/spaces.ts # or just one
```

`█` is the widest thing a terminal can paint, so a run of them is the closest a text grid
gets to a swatch — every ramp above is one call, `gradient('sunset')('█'.repeat(40))`, with
the terminal filling each cell with a slightly different 24-bit color. Multi-line blocks are
how `vertical` and `diagonal` become visible at all.

[`gradients/`](./examples/gradients) holds 14 scripts and [`colors/`](./examples/colors)
seven; [examples/README.md](./examples/README.md) has the full table.

## CLI

```sh
npm install -g grfti-cli
grfti sunset "hello world"
```

See [grfti-cli](https://github.com/tool3/grfti-cli).

## Development

Sources are pure TypeScript: no `.js` anywhere outside `dist`, and no file extensions in
internal imports. `tsup` resolves them at build time and emits ESM, CJS and declarations.

```sh
npm run typecheck   # tsc, noEmit — it can never scatter .js next to sources
npm test            # vitest, runs the .ts directly
npm run build       # dist/index.js (esm), dist/index.cjs, dist/index.d.ts, dist/index.d.cts
```

Because the package is `"type": "module"`, `ts-node` cannot run these sources directly —
its ESM loader does no extension resolution. Use `vitest` for anything you want to execute
against the source. The CLI in `grfti-cli` is CommonJS and does run under `ts-node`.

## License

MIT
