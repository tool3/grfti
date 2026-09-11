import { describe, expect, test } from 'vitest';
import { color, gradient, isGradient, GrftiError } from '../src/index';

const ESC = String.fromCharCode(27);
const plain = (text: string): string => text.replaceAll(new RegExp(`${ESC}\\[[0-9;]*m`, 'g'), '');
const hexes = (text: string): readonly string[] =>
  Array.from(text.matchAll(new RegExp(`${ESC}\\[[34]8;2;(\\d+);(\\d+);(\\d+)m`, 'g')), ([, r, g, b]) =>
    color({ r: Number(r), g: Number(g), b: Number(b), alpha: 1 }).hex,
  );

const paint = (value: ReturnType<typeof gradient>, text: string): string =>
  value.depth('truecolor')(text);

describe('call shapes', () => {
  const expected = gradient('red', 'blue').at(0.5).hex;

  test('accepts varargs, arrays and stop objects', () => {
    expect(gradient('red', 'blue').at(0.5).hex).toBe(expected);
    expect(gradient(['red', 'blue']).at(0.5).hex).toBe(expected);
    expect(gradient([color('red'), color('blue')]).at(0.5).hex).toBe(expected);
    expect(gradient([{ color: 'red', pos: 0 }, { color: 'blue', pos: 1 }]).at(0.5).hex).toBe(expected);
    expect(gradient({ r: 255, g: 0, b: 0, alpha: 1 }, 'blue').at(0.5).hex).toBe(expected);
  });

  test('accepts a single dsl string', () => {
    expect(gradient('red, blue').at(0.5).hex).toBe(expected);
    expect(gradient('gradient(red, blue)').at(0.5).hex).toBe(expected);
  });

  test('accepts a trailing options object', () => {
    expect(gradient(['red', 'blue'], { space: 'rgb' }).at(0.5).hex).toBe('#800080');
    expect(gradient(['red', 'blue'], { interpolation: 'rgb' }).at(0.5).hex).toBe('#800080');
  });

  test('accepts a single color', () => {
    expect(gradient('red').at(0).hex).toBe('#ff0000');
    expect(gradient('red').at(1).hex).toBe('#ff0000');
  });

  test('composes existing gradients', () => {
    expect(gradient(gradient('red', 'blue')).colors.map((c) => c.hex)).toEqual(['#ff0000', '#0000ff']);
  });

  test('rejects an empty gradient', () => {
    expect(() => gradient([])).toThrow(GrftiError);
  });
});

describe('the string dsl', () => {
  test('reads flags inside the parentheses', () => {
    expect(gradient('gradient(pink, cyan:vertical)').direction).toBe('vertical');
    expect(gradient('gradient(pink, cyan:diagonal:reverse)').colors[0]?.hex).toBe('#00ffff');
  });

  test('reads flags after the parentheses', () => {
    const value = gradient('gradient(green, yellow):reverse:vertical');
    expect(value.direction).toBe('vertical');
    expect(value.colors[0]?.hex).toBe('#ffff00');
  });

  test('reads flags on a bare color list', () => {
    expect(gradient('pink, cyan:vertical').direction).toBe('vertical');
  });

  test('reads flags carried by any argument', () => {
    const value = gradient('pink', 'blue:horizontal:reverse');
    expect(value.direction).toBe('horizontal');
    expect(value.colors[0]?.hex).toBe('#0000ff');
  });

  test.each([
    ['h', 'horizontal'],
    ['v', 'vertical'],
    ['d', 'diagonal'],
    ['diag', 'diagonal'],
    ['column', 'vertical'],
  ])('accepts the %s direction alias', (flag, direction) => {
    expect(gradient(`pink, cyan:${flag}`).direction).toBe(direction);
  });

  test.each(['rgb', 'hsl', 'hsv', 'hsb', 'oklab', 'oklch'])('accepts the %s space flag', (space) => {
    expect(() => gradient(`pink, cyan:${space}`)).not.toThrow();
  });

  test('accepts depth and background flags', () => {
    expect(gradient('pink, cyan:none')('hi')).toBe('hi');
    expect(gradient('pink, cyan:bg:truecolor')('hi')).toContain(`${ESC}[48;2;`);
  });

  test('keeps commas inside functional colors', () => {
    expect(gradient('rgb(255, 0, 0), rgb(0, 0, 255)').colors.map((c) => c.hex)).toEqual([
      '#ff0000',
      '#0000ff',
    ]);
  });

  test('reads explicit stop positions', () => {
    expect(gradient('red 0%, yellow 25%, green 100%').stops.map((s) => s.position)).toEqual([
      0, 0.25, 1,
    ]);
    expect(gradient('red 0, yellow .25, green 1').stops.map((s) => s.position)).toEqual([0, 0.25, 1]);
    expect(gradient('rgb(255 0 0) 0%, blue 80%').stops.map((s) => s.position)).toEqual([0, 0.8]);
  });

  test('spreads unpositioned stops between the anchored ones', () => {
    expect(gradient('red, orange, yellow, green').stops.map((s) => s.position)).toEqual([
      0, 1 / 3, 2 / 3, 1,
    ]);
    expect(
      gradient('red 0%, orange, yellow, green 60%').stops.map((s) => Number(s.position.toFixed(4))),
    ).toEqual([0, 0.2, 0.4, 0.6]);
  });

  test('reads css angles and sides', () => {
    expect(gradient('linear-gradient(180deg, red, blue)').direction).toBe('vertical');
    expect(gradient('linear-gradient(90deg, red, blue)').direction).toBe('horizontal');
    expect(gradient('linear-gradient(135deg, red, blue)').direction).toBe('diagonal');
    expect(gradient('linear-gradient(to right, red, blue)').direction).toBe('horizontal');
  });

  test('rejects unknown flags with a suggestion', () => {
    expect(() => gradient('pink, cyan:verticle')).toThrow(/Did you mean vertical/);
    expect(() => gradient('pink, cyan:sideways')).toThrow(GrftiError);
  });

  test('round-trips through toString', () => {
    const value = gradient('pink, cyan:vertical');
    expect(String(value)).toBe('gradient(#ffc0cb 0%, #00ffff 100%):vertical:oklab');
    expect(gradient(String(value)).direction).toBe('vertical');
  });
});

describe('chaining', () => {
  test('direction getters return callable gradients', () => {
    expect(gradient('pink', 'cyan').vertical.direction).toBe('vertical');
    expect(gradient('pink', 'cyan').vertical.reverse.direction).toBe('vertical');
    expect(typeof gradient('pink', 'cyan').vertical('hi')).toBe('string');
  });

  test('direction factories set direction up front', () => {
    expect(gradient.vertical('pink', 'cyan').direction).toBe('vertical');
    expect(gradient.diagonal('pink', 'cyan').direction).toBe('diagonal');
    expect(gradient.horizontal('pink', 'cyan').direction).toBe('horizontal');
  });

  test('reverse flips the stops and is its own inverse', () => {
    const value = gradient('pink', 'cyan');
    expect(value.reverse.colors.map((c) => c.hex)).toEqual(['#00ffff', '#ffc0cb']);
    expect(value.reverse.reverse.colors.map((c) => c.hex)).toEqual(value.colors.map((c) => c.hex));
  });

  test('reverse mirrors uneven stop positions', () => {
    expect(gradient('red 0%, yellow 25%, green 100%').reverse.stops.map((s) => s.position)).toEqual([
      0, 0.75, 1,
    ]);
  });

  test('never mutates the gradient it came from', () => {
    const value = gradient('pink', 'cyan');
    value.vertical.reverse.bg.space('rgb').depth('none');
    expect(value.direction).toBe('horizontal');
    expect(value.colors[0]?.hex).toBe('#ffc0cb');
  });

  test('is recognisable', () => {
    expect(isGradient(gradient('pink', 'cyan'))).toBe(true);
    expect(isGradient(color('pink'))).toBe(false);
    expect(isGradient('pink, cyan')).toBe(false);
  });
});

describe('sampling', () => {
  test('at clamps to the endpoints', () => {
    const value = gradient('red', 'blue');
    expect(value.at(-1).hex).toBe('#ff0000');
    expect(value.at(2).hex).toBe('#0000ff');
  });

  test('sample spans the endpoints', () => {
    const samples = gradient('red', 'blue').sample(5);
    expect(samples).toHaveLength(5);
    expect(samples[0]?.hex).toBe('#ff0000');
    expect(samples[4]?.hex).toBe('#0000ff');
    expect(gradient('red', 'blue').sample(1).map((c) => c.hex)).toEqual(['#ff0000']);
  });

  test('honours explicit stop positions', () => {
    const value = gradient('red 0%, red 50%, blue 100%');
    expect(value.at(0.25).hex).toBe('#ff0000');
  });

  test('keeps oklab midpoints out of the mud', () => {
    expect(gradient('pink', 'cyan').space('rgb').at(0.5).hex).toBe('#80e0e5');
    expect(gradient('pink', 'cyan').at(0.5).hex).toBe('#bbe2e5');
  });

  test('stays inside the srgb gamut through oklab', () => {
    const inside = gradient('blue', 'yellow')
      .sample(50)
      .every(({ rgb }) => [rgb.r, rgb.g, rgb.b].every((v) => v >= 0 && v <= 255));
    expect(inside).toBe(true);
  });
});

describe('painting text', () => {
  test('spans the string and preserves the characters', () => {
    const painted = paint(gradient('red', 'blue'), 'hello world');
    expect(plain(painted)).toBe('hello world');
    expect(hexes(painted).at(0)).toBe('#ff0000');
    expect(hexes(painted).at(-1)).toBe('#0000ff');
  });

  test('paints each line across the widest line, so columns line up', () => {
    const painted = paint(gradient('red', 'blue'), 'ab\nabcd');
    const [first, second] = painted.split('\n') as [string, string];
    expect(hexes(first)).toEqual(hexes(second).slice(0, 2));
    expect(plain(painted)).toBe('ab\nabcd');
  });

  test('runs vertically down the lines', () => {
    const painted = paint(gradient('red', 'blue').vertical, 'aa\nbb\ncc');
    const lines = painted.split('\n');
    expect(lines.map((line) => hexes(line))).toEqual([['#ff0000'], ['#8c53a2'], ['#0000ff']]);
  });

  test('runs diagonally across both axes', () => {
    const painted = paint(gradient('red', 'blue').diagonal, 'ab\nab');
    const [first, second] = painted.split('\n') as [string, string];
    expect(hexes(first).at(0)).toBe('#ff0000');
    expect(hexes(second).at(-1)).toBe('#0000ff');
  });

  test('merges runs of identical color into one escape', () => {
    const painted = paint(gradient('red', 'red'), 'hello');
    expect(hexes(painted)).toEqual(['#ff0000']);
    expect(plain(painted)).toBe('hello');
  });

  test('keeps grapheme clusters whole', () => {
    const painted = paint(gradient('red', 'blue'), 'a\u{1F468}‍\u{1F469}‍\u{1F467}b');
    expect(plain(painted)).toBe('a\u{1F468}‍\u{1F469}‍\u{1F467}b');
    expect(hexes(painted)).toHaveLength(3);
  });

  test('passes existing escape sequences through untouched', () => {
    const painted = paint(gradient('red', 'blue'), `ab${ESC}[1mcd`);
    expect(painted).toContain(`${ESC}[1m`);
    expect(plain(painted)).toBe('abcd');
  });

  test('preserves blank lines', () => {
    expect(plain(paint(gradient('red', 'blue'), 'a\n\nb'))).toBe('a\n\nb');
  });

  test('coerces non-strings', () => {
    expect(plain(paint(gradient('red', 'blue'), 42 as unknown as string))).toBe('42');
    expect(paint(gradient('red', 'blue'), '')).toBe('');
  });

  test('paints the background instead when asked', () => {
    const painted = paint(gradient('red', 'blue').bg, 'hi');
    expect(painted).toContain(`${ESC}[48;2;`);
    expect(painted).toContain(`${ESC}[49m`);
  });

  test('emits nothing at depth none', () => {
    expect(gradient('red', 'blue').depth('none')('hello')).toBe('hello');
  });
});

describe('css and svg output', () => {
  test('emits a linear-gradient per direction', () => {
    expect(gradient('pink', 'cyan').css()).toBe('linear-gradient(90deg, #ffc0cb 0%, #00ffff 100%)');
    expect(gradient('pink', 'cyan').vertical.css()).toBe(
      'linear-gradient(180deg, #ffc0cb 0%, #00ffff 100%)',
    );
    expect(gradient('pink', 'cyan').diagonal.css()).toBe(
      'linear-gradient(135deg, #ffc0cb 0%, #00ffff 100%)',
    );
  });

  test('takes an explicit angle or kind', () => {
    expect(gradient('pink', 'cyan').css({ angle: 45 })).toContain('linear-gradient(45deg,');
    expect(gradient('pink', 'cyan').css({ kind: 'radial' })).toBe(
      'radial-gradient(#ffc0cb 0%, #00ffff 100%)',
    );
  });

  test('emits svg gradient definitions', () => {
    const svg = gradient('pink', 'cyan').svg({ id: 'bg' });
    expect(svg).toContain('<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">');
    expect(svg).toContain('<stop offset="0%" stop-color="#ffc0cb"/>');
    expect(svg).toContain('<stop offset="100%" stop-color="#00ffff"/>');
    expect(gradient('pink', 'cyan').vertical.svg()).toContain('x2="0%" y2="100%"');
    expect(gradient('pink', 'cyan').diagonal.svg()).toContain('x2="100%" y2="100%"');
  });

  test('splits alpha into stop-opacity', () => {
    expect(gradient(color('red').alpha(0.5), 'blue').svg()).toContain(
      '<stop offset="0%" stop-color="#ff0000" stop-opacity="0.5"/>',
    );
  });
});

describe('gradient-string compatibility', () => {
  test('exposes presets as properties on the factory', () => {
    expect(gradient.atlas.colors.map((c) => c.hex)).toEqual(['#feac5e', '#c779d0', '#4bc0c8']);
    expect(gradient.cristal.colors.map((c) => c.hex)).toEqual(['#bdfff3', '#4ac29a']);
  });

  test('multiline is the default, and the property still works', () => {
    const painted = gradient.atlas.depth('truecolor')('ab\nab');
    expect(gradient.atlas.multiline.depth('truecolor')('ab\nab')).toBe(painted);
  });

  test('honours the interpolation and hsvSpin options', () => {
    const hsv = gradient(['#ff0000', '#ff0100'], { interpolation: 'hsv', hsvSpin: 'long' });
    const hues = hsv.sample(7).map((c) => Math.round(c.oklch.h));
    expect(new Set(hues).size).toBeGreaterThan(4);
  });
});
