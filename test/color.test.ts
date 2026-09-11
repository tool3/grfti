import { describe, expect, test } from 'vitest';
import {
  ansi256ToRgb,
  color,
  depthFromEnvironment,
  isColor,
  isNamedColor,
  NAMED_COLOR_NAMES,
  parseRgb,
  GrftiError,
  rgb,
  rgbToAnsi16,
  rgbToAnsi256,
  tryParseRgb,
} from '../src/index';

const ESC = String.fromCharCode(27);

describe('parsing', () => {
  test.each([
    ['pink', '#ffc0cb'],
    ['PINK', '#ffc0cb'],
    ['  rebeccapurple  ', '#663399'],
    ['#f0a', '#ff00aa'],
    ['#FF00AA', '#ff00aa'],
    ['#ff00aa80', '#ff00aa80'],
    ['#0f08', '#00ff0088'],
    ['rgb(255, 0, 170)', '#ff00aa'],
    ['rgb(255 0 170)', '#ff00aa'],
    ['rgba(255, 0, 170, 0.5)', '#ff00aa80'],
    ['rgb(255 0 170 / 50%)', '#ff00aa80'],
    ['rgb(100%, 0%, 66.67%)', '#ff00aa'],
    ['hsl(360, 100%, 50%)', '#ff0000'],
    ['hsl(210 80% 60%)', '#4799eb'],
    ['hsv(120, 100%, 50%)', '#008000'],
    ['oklch(0.7 0.15 250)', '#4ba3f7'],
    ['ansi256(196)', '#ff0000'],
    ['ansi(9)', '#ff0000'],
    ['transparent', '#00000000'],
  ])('parses %s', (input, hex) => {
    expect(color(input).hex).toBe(hex);
  });

  test('parses ansi escape sequences', () => {
    expect(color(`${ESC}[38;2;255;0;170m`).hex).toBe('#ff00aa');
    expect(color(`${ESC}[38;5;196m`).hex).toBe('#ff0000');
    expect(color(`${ESC}[31m`).hex).toBe('#800000');
    expect(color(`${ESC}[91m`).hex).toBe('#ff0000');
    expect(color(`${ESC}[104m`).hex).toBe('#0000ff');
  });

  test('accepts rgb objects and colors', () => {
    expect(color({ r: 255, g: 0, b: 170, alpha: 1 }).hex).toBe('#ff00aa');
    expect(color(color('pink')).hex).toBe('#ffc0cb');
    expect(rgb(255, 0, 170).hex).toBe('#ff00aa');
  });

  test('clamps out-of-range channels', () => {
    expect(rgb(300, -20, 170).hex).toBe('#ff00aa');
  });

  test('tryParseRgb returns undefined instead of throwing', () => {
    expect(tryParseRgb('#nothex')).toBeUndefined();
    expect(tryParseRgb('pinkish')).toBeUndefined();
  });

  test('throws a GrftiError with suggestions', () => {
    expect(() => parseRgb('pinkk')).toThrow(GrftiError);
    expect(() => parseRgb('pinkk')).toThrow(/Did you mean pink/);

    try {
      parseRgb('greeen');
    } catch (error) {
      expect((error as GrftiError).input).toBe('greeen');
      expect((error as GrftiError).suggestions).toContain('green');
    }
  });

  test('every named color parses', () => {
    expect(NAMED_COLOR_NAMES.length).toBeGreaterThan(140);
    expect(NAMED_COLOR_NAMES.every((name) => tryParseRgb(name) !== undefined)).toBe(true);
    expect(isNamedColor('hotpink')).toBe(true);
    expect(isNamedColor('hotpinkk')).toBe(false);
  });
});

describe('conversion', () => {
  test('round-trips through every space', () => {
    const original = color('#3d7fb3');
    expect(color(original.rgb).hex).toBe('#3d7fb3');
    expect(
      color(`hsl(${original.hsl.h} ${original.hsl.s * 100}% ${original.hsl.l * 100}%)`).hex,
    ).toBe('#3d7fb3');
    expect(color(`oklch(${original.oklch.l} ${original.oklch.c} ${original.oklch.h})`).hex).toBe(
      '#3d7fb3',
    );
  });

  test('reports luminance and darkness', () => {
    expect(color('white').luminance).toBeCloseTo(1, 5);
    expect(color('black').luminance).toBeCloseTo(0, 5);
    expect(color('#101010').isDark).toBe(true);
    expect(color('#f0f0f0').isDark).toBe(false);
  });

  test('computes wcag contrast', () => {
    expect(color('white').contrast('black')).toBeCloseTo(21, 2);
    expect(color('white').contrast('white')).toBeCloseTo(1, 5);
  });

  test('reverse-looks-up names', () => {
    expect(color('#ffc0cb').name).toBe('pink');
    expect(color('#123456').name).toBeUndefined();
  });
});

describe('manipulation', () => {
  test('lighten and darken move perceptual lightness', () => {
    const base = color('teal');
    expect(base.lighten(0.2).oklch.l).toBeGreaterThan(base.oklch.l);
    expect(base.darken(0.2).oklch.l).toBeLessThan(base.oklch.l);
    expect(color('white').lighten(0.5).hex).toBe('#ffffff');
    expect(color('black').darken(0.5).hex).toBe('#000000');
  });

  test('saturate and desaturate move chroma', () => {
    const base = color('#7f9fbf');
    expect(base.saturate(0.5).oklch.c).toBeGreaterThan(base.oklch.c);
    expect(base.desaturate(1).oklch.c).toBeCloseTo(0, 3);
  });

  test('rotate moves hue', () => {
    expect(color('red').rotate(180).oklch.h).toBeCloseTo((color('red').oklch.h + 180) % 360, 0);
  });

  test('mix defaults to the oklab midpoint', () => {
    expect(color('red').mix('blue').hex).toBe(color('red').mix('blue', 0.5, 'oklab').hex);
    expect(color('red').mix('blue', 0).hex).toBe('#ff0000');
    expect(color('red').mix('blue', 1).hex).toBe('#0000ff');
    expect(color('black').mix('white', 0.5, 'rgb').hex).toBe('#808080');
  });

  test('alpha sets opacity and shows up in hex and css', () => {
    expect(color('red').alpha(0.5).hex).toBe('#ff000080');
    expect(color('red').alpha(0.5).css()).toBe('rgb(255 0 0 / 0.5)');
    expect(color('red').css()).toBe('#ff0000');
  });

  test('is immutable under chaining', () => {
    const base = color('teal');
    base.lighten(0.4).rotate(90).alpha(0.2);
    expect(base.hex).toBe('#008080');
  });
});

describe('painting', () => {
  test('emits truecolor foreground and background', () => {
    expect(color('red').depth('truecolor')('hi')).toBe(`${ESC}[38;2;255;0;0mhi${ESC}[39m`);
    expect(color('red').bg.depth('truecolor')('hi')).toBe(`${ESC}[48;2;255;0;0mhi${ESC}[49m`);
  });

  test('honours lower depths', () => {
    expect(color('#ff0000').depth('ansi256')('hi')).toBe(`${ESC}[38;5;196mhi${ESC}[39m`);
    expect(color('#ff0000').depth('ansi16')('hi')).toBe(`${ESC}[91mhi${ESC}[39m`);
    expect(color('#ff0000').depth('none')('hi')).toBe('hi');
  });

  test('leaves empty input untouched', () => {
    expect(color('red').depth('truecolor')('')).toBe('');
  });

  test('is a callable color', () => {
    expect(isColor(color('red'))).toBe(true);
    expect(isColor('red')).toBe(false);
    expect(String(color('red'))).toBe('#ff0000');
  });
});

describe('depth quantization', () => {
  test('maps the 256 palette round-trip', () => {
    expect(rgbToAnsi256(ansi256ToRgb(196))).toBe(196);
    expect(rgbToAnsi256(ansi256ToRgb(240))).toBe(240);
    expect(rgbToAnsi256(color('black').rgb)).toBe(16);
    expect(rgbToAnsi256(color('white').rgb)).toBe(231);
  });

  test('picks grayscale ramp entries over the cube when closer', () => {
    expect(rgbToAnsi256(color('#8a8a8a').rgb)).toBeGreaterThan(231);
  });

  test('maps to the nearest of the 16 base colors', () => {
    expect(rgbToAnsi16(color('#ff0000').rgb)).toBe(9);
    expect(rgbToAnsi16(color('#800000').rgb)).toBe(1);
    expect(rgbToAnsi16(color('#000000').rgb)).toBe(0);
    expect(rgbToAnsi16(color('#ffffff').rgb)).toBe(15);
  });

  test('searches the palette perceptually, not by raw rgb distance', () => {
    expect(rgbToAnsi16(color('hotpink').rgb)).toBe(13);
    expect(rgbToAnsi16(color('teal').rgb)).toBe(6);
    expect(rgbToAnsi16(color('navy').rgb)).toBe(4);
  });
});

describe('depth detection', () => {
  test.each([
    [{ NO_COLOR: '1', COLORTERM: 'truecolor' }, true, 'none'],
    [{ FORCE_COLOR: '0' }, true, 'none'],
    [{ FORCE_COLOR: '3' }, false, 'truecolor'],
    [{ GRFTI_DEPTH: 'ansi256' }, false, 'ansi256'],
    [{ COLORTERM: 'truecolor', TERM: 'xterm' }, true, 'truecolor'],
    [{ TERM: 'xterm-256color' }, true, 'ansi256'],
    [{ TERM: 'xterm-direct' }, true, 'truecolor'],
    [{ TERM: 'dumb', COLORTERM: 'truecolor' }, true, 'none'],
    [{ TERM: 'xterm' }, false, 'none'],
    [{ COLORTERM: 'truecolor', TERM: 'xterm-256color' }, false, 'none'],
    [{ COLORTERM: 'truecolor', TERM: 'xterm', CI: 'true' }, false, 'truecolor'],
    [{ TERM: 'xterm', CI: 'true' }, false, 'ansi16'],
    [{}, true, 'none'],
  ])('resolves %j', (env, isTty, expected) => {
    expect(depthFromEnvironment(env, isTty)).toBe(expected);
  });
});
