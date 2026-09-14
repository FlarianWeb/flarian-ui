import { defineUIPluginOptions } from './defineUIPluginOptions';

describe('defineUIPluginOptions', () => {
	it('возвращает переданный объект как есть (identity)', () => {
		const options = {
			theme: { list: { ocean: { base: '#0ea5e9' } }, default: 'ocean' as const },
		};

		expect(defineUIPluginOptions(options)).toBe(options);
	});

	it('без опций — возвращает пустой объект', () => {
		expect(defineUIPluginOptions({})).toEqual({});
	});

	it('typecheck: default сужается до ключей list (theme)', () => {
		defineUIPluginOptions({
			theme: {
				list: { ocean: { base: '#0ea5e9' }, forest: { base: '#22c55e' } },
				default: 'forest',
			},
		});

		defineUIPluginOptions({
			theme: {
				list: { ocean: { base: '#0ea5e9' } },
				// @ts-expect-error — 'unknown' не является ключом list
				default: 'unknown',
			},
		});
	});

	it('typecheck: default сужается до ключей list (surface)', () => {
		defineUIPluginOptions({
			surface: { list: { warm: { 500: '#a08968' } }, default: 'warm' },
		});

		defineUIPluginOptions({
			surface: {
				list: { warm: { 500: '#a08968' } },
				// @ts-expect-error — 'unknown' не является ключом list
				default: 'unknown',
			},
		});
	});

	it('typecheck: лишний ключ в list/extend темы — ошибка компиляции', () => {
		defineUIPluginOptions({
			theme: {
				// @ts-expect-error — 'bogus' не является ключом ConfigTheme
				list: { ocean: { base: '#0ea5e9', bogus: 'x' } },
			},
		});

		defineUIPluginOptions({
			theme: {
				// @ts-expect-error — 'bogus' не является ключом ConfigTheme
				extend: { forest: { base: '#22c55e', bogus: 'x' } },
			},
		});
	});

	it('typecheck: лишний ключ в list/extend поверхности — ошибка компиляции (в т.ч. числовые ключи шкалы)', () => {
		defineUIPluginOptions({
			surface: {
				// @ts-expect-error — 'bogus' не является ключом ConfigSurface
				list: { warm: { 500: '#a08968', bogus: 'x' } },
			},
		});

		defineUIPluginOptions({
			surface: {
				// @ts-expect-error — 'bogus' не является ключом ConfigSurface
				extend: { cold: { 500: '#3d3d3d', bogus: 'x' } },
			},
		});
	});
});
