import type { ColorSpace, Direction, HueSpin } from './types';

export interface PresetDefinition {
  readonly colors: readonly [string, string, ...string[]];
  readonly space?: ColorSpace;
  readonly spin?: HueSpin;
  readonly direction?: Direction;
}

export const PRESETS = {
  atlas: { colors: ['#feac5e', '#c779d0', '#4bc0c8'] },
  cristal: { colors: ['#bdfff3', '#4ac29a'] },
  teen: { colors: ['#77a1d3', '#79cbca', '#e684ae'] },
  mind: { colors: ['#473b7b', '#3584a7', '#30d2be'] },
  morning: { colors: ['#ff5f6d', '#ffc371'] },
  vice: { colors: ['#5ee7df', '#b490ca'] },
  passion: { colors: ['#f43b47', '#453a94'] },
  fruit: { colors: ['#ff4e50', '#f9d423'] },
  instagram: { colors: ['#833ab4', '#fd1d1d', '#fcb045'] },
  retro: {
    colors: [
      '#3f51b1', '#5a55ae', '#7b5fac', '#8f6aae', '#a86aa4',
      '#cc6b8e', '#f18271', '#f3a469', '#f7c978',
    ],
  },
  summer: { colors: ['#fdbb2d', '#22c1c3'] },
  rainbow: { colors: ['#ff0000', '#ff0100'], space: 'hsv', spin: 'long' },
  pastel: { colors: ['#74ebd5', '#74ecd5'], space: 'hsv', spin: 'long' },

  aurora: { colors: ['#00c9a7', '#4aa3df', '#845ec2'] },
  sunset: { colors: ['#ff7a59', '#c860a8', '#7c2bff'] },
  synthwave: { colors: ['#ff2e97', '#7b2ff7', '#2de2e6'] },
  vaporwave: { colors: ['#ff71ce', '#01cdfe', '#05ffa1'] },
  matrix: { colors: ['#00ff41', '#008f11'] },
  amber: { colors: ['#ffd166', '#ffb000', '#ff6a00'] },
  phosphor: { colors: ['#00ff9f', '#00d4ff'] },
  midnight: { colors: ['#a5b4fc', '#6366f1', '#312e81'] },
  paper: { colors: ['#f6f1e5', '#c9b99b'] },
  hotdog: { colors: ['#ff0000', '#ffff00'] },

  breeze: { colors: ['#cf2f98', '#6a3dec'] },
  candy: { colors: ['#a58efb', '#e9bff8'] },
  ember: { colors: ['#ff6363', '#733434'] },
  falcon: { colors: ['#bde3ec', '#363654'] },
  meadow: { colors: ['#59d499', '#a0872d'] },
  raindrop: { colors: ['#8ec7fb', '#1c55aa'] },
  noir: { colors: ['#e6e6e6', '#4a4a4a'] },
  ice: { colors: ['#ffffff', '#80deea'] },
  sand: { colors: ['#eed5b6', '#af8856'] },
  forest: { colors: ['#83c98d', '#2f4f38'] },
  mono: { colors: ['#e0e0e0', '#3a3a3a'] },

  fire: { colors: ['#ffe259', '#ff6b35', '#c1121f'] },
  neon: { colors: ['#00f5d4', '#f15bb5'] },
  toxic: { colors: ['#d8ff3e', '#56ab2f'] },
  royal: { colors: ['#8e2de2', '#4a00e0'] },
  peach: { colors: ['#ffecd2', '#fcb69f'] },
  abyss: { colors: ['#00c6ff', '#0072ff'] },
  bubblegum: { colors: ['#ffafbd', '#ffc3a0'] },
  cyberpunk: { colors: ['#fcee0a', '#00f0ff', '#ff003c'] },

  vercel: { colors: ['#ffffff', '#7a7a7a'] },
  supabase: { colors: ['#6ee7b7', '#3ecf8e', '#12805c'] },
  openai: { colors: ['#74aa9c', '#10a37f'] },
  prisma: { colors: ['#71e8df', '#5a67d8'] },
  stripe: { colors: ['#00d4ff', '#635bff'] },
  cloudflare: { colors: ['#faad3f', '#f6821f'] },
  nuxt: { colors: ['#36e4da', '#00dc82'] },
  gemini: { colors: ['#4285f4', '#9b72cb', '#d96570'] },
  tailwind: { colors: ['#38bdf8', '#818cf8'] },
  firecrawl: { colors: ['#fbbf24', '#f97316', '#dc2626'] },
} as const satisfies Record<string, PresetDefinition>;

export type PresetName = keyof typeof PRESETS;

export const PRESET_NAMES = Object.keys(PRESETS) as readonly PresetName[];

export const isPresetName = (value: string): value is PresetName => Object.hasOwn(PRESETS, value);
