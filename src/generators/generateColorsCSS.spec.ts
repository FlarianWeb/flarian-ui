import { defaultSchemeConfig } from '../config/scheme';

import { generateColorsCSS } from './generateColorsCSS';

const mockColorsConfig = {
	light: {
		bg: 'var(--ui-color-white)',
		fg: 'var(--ui-color-black)',
		caption: 'color-mix(in srgb, var(--ui-color-fg) 40%, transparent)',
		shadow: 'rgb(0 0 0 / 25%)',
	},
	dark: {
		bg: 'var(--ui-color-black)',
		fg: 'var(--ui-color-white)',
		caption: 'color-mix(in srgb, var(--ui-color-fg) 40%, transparent)',
		shadow: 'rgb(0 0 0 / 75%)',
	},
	black: '#000000',
	white: '#ffffff',
};

describe('generateColorsCSS', () => {
	it('Генерирует CSS с дефолтными значениями (snapshot)', () => {
		expect(generateColorsCSS(mockColorsConfig, defaultSchemeConfig)).toMatchSnapshot();
	});

	it('Включает :root с black и white', () => {
		const css = generateColorsCSS(mockColorsConfig, defaultSchemeConfig);

		expect(css).toContain('--ui-color-black: #000000;');
		expect(css).toContain('--ui-color-white: #ffffff;');
	});

	it('Генерирует блоки для dark и light схем', () => {
		const css = generateColorsCSS(mockColorsConfig, defaultSchemeConfig);

		expect(css).toContain("[data-scheme='dark']");
		expect(css).toContain("[data-scheme='light']");
	});

	it('Генерирует переменные с префиксом --ui-color- внутри scheme-блока', () => {
		const css = generateColorsCSS(mockColorsConfig, defaultSchemeConfig);

		expect(css).toContain('--ui-color-bg: var(--ui-color-black);');
		expect(css).toContain('--ui-color-shadow: rgb(0 0 0 / 75%);');
	});

	it('[no-transparency] заменяет transparent на var(--ui-color-bg) с префиксом', () => {
		const css = generateColorsCSS(mockColorsConfig, defaultSchemeConfig);

		expect(css).toContain(
			'--ui-color-caption: color-mix(in srgb, var(--ui-color-fg) 40%, var(--ui-color-bg));'
		);
	});

	it('не создаёт [no-transparency] когда нет transparent-токенов', () => {
		expect(
			generateColorsCSS(
				{ light: {}, dark: {}, black: '#000000', white: '#ffffff' },
				defaultSchemeConfig
			)
		).not.toContain('[no-transparency]');
	});

	it('[no-transparency] не содержит transparent в цветах', () => {
		const css = generateColorsCSS(mockColorsConfig, defaultSchemeConfig);

		const noTransparencyBlocks = css
			.split('\n\n')
			.filter(block => block.startsWith('[no-transparency]'));

		expect(noTransparencyBlocks.length).toBeGreaterThan(0);

		for (const block of noTransparencyBlocks) {
			expect(block).not.toContain(' transparent');
		}
	});

	it('использует кастомный attribute из schemeConfig', () => {
		const schemeConfig = { ...defaultSchemeConfig, attribute: 'data-color-scheme' };
		const css = generateColorsCSS(mockColorsConfig, schemeConfig);

		expect(css).toContain("[data-color-scheme='dark']");
		expect(css).toContain("[data-color-scheme='light']");
	});

	it('использует кастомные значения dark/light из schemeConfig', () => {
		const schemeConfig = { ...defaultSchemeConfig, dark: 'night', light: 'day' };
		const css = generateColorsCSS(mockColorsConfig, schemeConfig);

		expect(css).toContain("[data-scheme='night']");
		expect(css).toContain("[data-scheme='day']");
	});

	it('кастомные black и white отражаются в :root', () => {
		const colors = { ...mockColorsConfig, black: '#0a0a0a', white: '#f5f5f5' };
		const css = generateColorsCSS(colors, defaultSchemeConfig);

		expect(css).toContain('--ui-color-black: #0a0a0a;');
		expect(css).toContain('--ui-color-white: #f5f5f5;');
	});

	describe('guard: --ui-color-* зарезервирован для статусных цветов surface', () => {
		it('падает при попытке задать статусное имя через colors', () => {
			const colors = {
				...mockColorsConfig,
				dark: { ...mockColorsConfig.dark, error: '#ff0000' },
			};

			expect(() => generateColorsCSS(colors, defaultSchemeConfig)).toThrow(
				/зарезервированные для surface имена: error/
			);
		});

		it('падает при попытке задать on-вариант статусного имени через colors', () => {
			const colors = {
				...mockColorsConfig,
				light: { ...mockColorsConfig.light, onError: '#ffffff' },
			};

			expect(() => generateColorsCSS(colors, defaultSchemeConfig)).toThrow(
				/зарезервированные для surface имена: onError/
			);
		});

		it('не падает на обычных семантических именах', () => {
			expect(() => generateColorsCSS(mockColorsConfig, defaultSchemeConfig)).not.toThrow();
		});
	});
});
