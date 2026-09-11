import type { ColorDepth } from './types';

const FORCED_DEPTHS: Record<string, ColorDepth> = {
  '0': 'none',
  '1': 'ansi16',
  '2': 'ansi256',
  '3': 'truecolor',
  false: 'none',
  true: 'truecolor',
  none: 'none',
  ansi16: 'ansi16',
  ansi256: 'ansi256',
  truecolor: 'truecolor',
};

export const depthFromEnvironment = (
  env: Record<string, string | undefined>,
  isTty: boolean,
): ColorDepth => {
  const requested = [env.GRFTI_DEPTH, env.FORCE_COLOR]
    .map((value) => (value === undefined ? undefined : FORCED_DEPTHS[value.trim().toLowerCase()]))
    .find((depth) => depth !== undefined);
  if (requested !== undefined) return requested;

  if (env.NO_COLOR !== undefined && env.NO_COLOR !== '') return 'none';

  const term = env.TERM ?? '';
  if (term === 'dumb') return 'none';
  if (!isTty && env.CI === undefined) return 'none';

  if (/^(truecolor|24bit)$/i.test(env.COLORTERM ?? '')) return 'truecolor';
  if (env.TERM_PROGRAM === 'iTerm.app' || env.TERM_PROGRAM === 'vscode') return 'truecolor';
  if (/(truecolor|direct)/i.test(term)) return 'truecolor';
  if (/256(color)?$/i.test(term)) return 'ansi256';

  return term === '' ? 'none' : 'ansi16';
};

export const detectDepth = (): ColorDepth =>
  depthFromEnvironment(process.env, process.stdout?.isTTY === true);
