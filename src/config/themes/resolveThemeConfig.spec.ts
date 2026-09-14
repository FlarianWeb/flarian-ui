import { defaultThemeConfig } from './defaults';
import { resolveThemeConfig } from './resolveThemeConfig';

describe('resolveThemeConfig', () => {
	it('без опций — зашитая base-тема', () => {
		const config = resolveThemeConfig();

		expect(config).toEqual(defaultThemeConfig);
	});

	it('list передан без default — берёт первый ключ', () => {
		const config = resolveThemeConfig({
			list: { ocean: { base: '#0ea5e9' }, forest: { base: '#22c55e' } },
		});

		expect(config.default).toBe('ocean');
	});

	it('list и default переданы вместе — оба уважаются', () => {
		const config = resolveThemeConfig({
			list: { ocean: { base: '#0ea5e9' }, forest: { base: '#22c55e' } },
			default: 'forest',
		});

		expect(config.default).toBe('forest');
		expect(config.list).toEqual({ ocean: { base: '#0ea5e9' }, forest: { base: '#22c55e' } });
	});

	it('list передан с явным default: null — остаётся null, не переезжает на первый ключ', () => {
		const config = resolveThemeConfig({
			list: { ocean: { base: '#0ea5e9' } },
			default: null,
		});

		expect(config.default).toBeNull();
	});

	it('зашитая base-тема отсутствует в результате при передаче своего списка (replace, не merge)', () => {
		const config = resolveThemeConfig({ list: { ocean: { base: '#0ea5e9' } } });

		expect(config.list).toEqual({ ocean: { base: '#0ea5e9' } });
		expect('base' in config.list).toBe(false);
	});

	it('attribute/onBase резолвятся обычным deepMerge независимо от list', () => {
		const config = resolveThemeConfig({
			attribute: 'data-color-theme',
			onBase: 'scheme',
			list: { ocean: { base: '#0ea5e9' } },
		});

		expect(config.attribute).toBe('data-color-theme');
		expect(config.onBase).toBe('scheme');
	});

	it('list не передан, но default передан — default применяется поверх зашитого list', () => {
		const config = resolveThemeConfig({ default: null });

		expect(config.list).toEqual(defaultThemeConfig.list);
		expect(config.default).toBeNull();
	});

	it('extend без list — встроенная base остаётся, новая тема добавляется', () => {
		const config = resolveThemeConfig({ extend: { ocean: { base: '#0ea5e9' } } });

		expect(Object.keys(config.list)).toEqual(['base', 'ocean']);
		/** Встроенный default остаётся валидным. */
		expect(config.default).toBe('base');
	});

	it('extend + default — дефолтом можно назначить добавленную тему', () => {
		const config = resolveThemeConfig({
			extend: { ocean: { base: '#0ea5e9' } },
			default: 'ocean',
		});

		expect(config.default).toBe('ocean');
	});

	it('list + extend — base удалена (replace), extend мержится поверх list', () => {
		const config = resolveThemeConfig({
			list: { ocean: { base: '#0ea5e9' } },
			extend: { forest: { base: '#22c55e' } },
		});

		expect(Object.keys(config.list)).toEqual(['ocean', 'forest']);
		/** default — первый ключ итогового списка (из list). */
		expect(config.default).toBe('ocean');
	});

	it('явный default: undefined трактуется как «не передан», а не как null', () => {
		const config = resolveThemeConfig({
			list: { ocean: { base: '#0ea5e9' } },
			default: undefined,
		});

		expect(config.default).toBe('ocean');
	});
});
