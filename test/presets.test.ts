import { describe, expect, test } from 'vitest';
import {
  gradient,
  isNamedColor,
  isPresetName,
  NAMED_COLOR_NAMES,
  PRESET_NAMES,
  PRESETS,
  tryParseRgb,
} from '../src/index';

describe('presets', () => {
  test('ships a healthy library of them', () => {
    expect(PRESET_NAMES.length).toBeGreaterThan(40);
  });

  test('every name is a single lowercase word', () => {
    expect(PRESET_NAMES.filter((name) => !/^[a-z]+$/.test(name))).toEqual([]);
  });

  test('no name collides with a css color name, so the dsl stays unambiguous', () => {
    expect(PRESET_NAMES.filter((name) => isNamedColor(name))).toEqual([]);
    expect(NAMED_COLOR_NAMES.filter((name) => isPresetName(name))).toEqual([]);
  });

  test('every color in every preset parses', () => {
    const broken = Object.entries(PRESETS).flatMap(([name, preset]) =>
      preset.colors.filter((value) => tryParseRgb(value) === undefined).map((value) => `${name}: ${value}`),
    );
    expect(broken).toEqual([]);
  });

  test('every preset has at least two stops', () => {
    expect(Object.values(PRESETS).filter((preset) => preset.colors.length < 2)).toEqual([]);
  });

  test('every preset is reachable by name, property and dsl', () => {
    const unreachable = PRESET_NAMES.filter((name) => {
      const byProperty = gradient[name];
      const byName = gradient(name);
      const byDsl = gradient(`${name}:vertical`);
      return (
        byProperty.colors.length !== PRESETS[name].colors.length ||
        byName.colors[0]?.hex !== byProperty.colors[0]?.hex ||
        byDsl.direction !== 'vertical'
      );
    });
    expect(unreachable).toEqual([]);
  });

  test('preset names are case insensitive', () => {
    expect(gradient('Sunset').colors[0]?.hex).toBe(gradient.sunset.colors[0]?.hex);
  });

  test('every preset paints without throwing and keeps the text intact', () => {
    const ESC = String.fromCharCode(27);
    const strip = (text: string): string => text.replaceAll(new RegExp(`${ESC}\\[[0-9;]*m`, 'g'), '');
    const broken = PRESET_NAMES.filter(
      (name) => strip(gradient[name].depth('truecolor')('the quick brown fox')) !== 'the quick brown fox',
    );
    expect(broken).toEqual([]);
  });

  test('composes with plain colors and with other presets', () => {
    expect(gradient('sunset', 'ice').colors.map((c) => c.hex)).toEqual([
      ...gradient.sunset.colors.map((c) => c.hex),
      ...gradient.ice.colors.map((c) => c.hex),
    ]);
    expect(gradient('sunset', 'black').colors.at(-1)?.hex).toBe('#000000');
  });

  test('takes dsl flags on a preset name', () => {
    expect(gradient('sunset:vertical:reverse').direction).toBe('vertical');
    expect(gradient('sunset:reverse').colors[0]?.hex).toBe(
      gradient.sunset.colors.at(-1)?.hex,
    );
  });

  test('lets an explicit flag override the space the preset asks for', () => {
    expect(gradient('rainbow:oklab').at(0.5).hex).not.toBe(gradient.rainbow.at(0.5).hex);
  });

  test('carries its own space and spin where the palette needs it', () => {
    expect(PRESETS.rainbow.space).toBe('hsv');
    expect(PRESETS.rainbow.spin).toBe('long');
    expect(gradient.rainbow.sample(8).map((c) => c.hex)).not.toContain('#ff0000'.repeat(1) + 'x');
    expect(new Set(gradient.rainbow.sample(12).map((c) => c.hex)).size).toBeGreaterThan(8);
  });
});
