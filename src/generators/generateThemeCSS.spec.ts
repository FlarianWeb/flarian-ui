import { defaultThemeConfig } from '../config/themes';

import { generateThemeCSS } from './generateThemeCSS';

describe('generateThemeCSS', () => {
	it('генерирует CSS с дефолтными значениями (snapshot)', () => {
		expect(generateThemeCSS(defaultThemeConfig)).toMatchSnapshot();
	});

	it('генерирует :root из list[default] (fallback без атрибута/до JS)', () => {
		const css = generateThemeCSS(defaultThemeConfig);

		expect(css).toContain(':root {');
		expect(css).toContain('--ui-theme-base: #2eb82e;');
	});

	it('default не совпадает ни с одним ключом list — :root не эмитится (не крашится)', () => {
		const config = { ...defaultThemeConfig, list: { ocean: { base: '#0ea5e9' } } };
		const css = generateThemeCSS(config);

		expect(css).not.toContain(':root {');
		expect(css).toContain("[data-theme='ocean']");
	});

	it('default: null — :root не эмитится', () => {
		const config = {
			...defaultThemeConfig,
			list: { ocean: { base: '#0ea5e9' } },
			default: null,
		};

		expect(generateThemeCSS(config)).not.toContain(':root {');
	});

	it('добавляет блок темы с base цветом', () => {
		const config = { ...defaultThemeConfig, list: { ocean: { base: '#0ea5e9' } } };
		const css = generateThemeCSS(config);

		expect(css).toContain("[data-theme='ocean']");
		expect(css).toContain('--ui-theme-base: #0ea5e9;');
	});

	it('onBase auto: тёмный base получает светлый on-цвет', () => {
		const config = { ...defaultThemeConfig, list: { forest: { base: '#2eb82e' } } };

		expect(generateThemeCSS(config)).toContain('--ui-theme-on-base: var(--ui-color-white);');
	});

	it('onBase auto: светлый base получает тёмный on-цвет', () => {
		const config = { ...defaultThemeConfig, list: { banana: { base: '#facc15' } } };

		expect(generateThemeCSS(config)).toContain('--ui-theme-on-base: var(--ui-color-black);');
	});

	it('onBase auto: непарсибельный base — переменная не эмитится (откат к scheme)', () => {
		const config = {
			...defaultThemeConfig,
			list: { fancy: { base: 'oklch(70% 0.1 150)' } },
		};

		expect(generateThemeCSS(config)).not.toContain('--ui-theme-on-base');
	});

	it('onBase scheme: переменная не эмитится', () => {
		const config = {
			...defaultThemeConfig,
			list: { classic: { base: '#2eb82e', onBase: 'scheme' as const } },
		};

		expect(generateThemeCSS(config)).not.toContain('--ui-theme-on-base');
	});

	it('onBase цветом: пишется как есть', () => {
		const config = {
			...defaultThemeConfig,
			list: { banana: { base: '#facc15', onBase: '#1f1f1f' } },
		};

		expect(generateThemeCSS(config)).toContain('--ui-theme-on-base: #1f1f1f;');
	});

	it('onBase уровня зоны — дефолт для тем без собственного', () => {
		const config = {
			...defaultThemeConfig,
			onBase: 'scheme' as const,
			list: { a: { base: '#2eb82e' }, b: { base: '#facc15', onBase: 'auto' as const } },
		};
		const css = generateThemeCSS(config);

		/** a наследует scheme (нет переменной), b — auto (есть) */
		expect(css.match(/--ui-theme-on-base/g)).toHaveLength(1);
	});

	it('использует кастомный attribute', () => {
		const config = {
			...defaultThemeConfig,
			attribute: 'data-color-theme',
			list: { red: { base: '#f00' } },
		};

		expect(generateThemeCSS(config)).toContain("[data-color-theme='red']");
	});

	it('пустой list — пустая строка, без пустого @layer', () => {
		const config = { ...defaultThemeConfig, list: {}, default: null };

		expect(generateThemeCSS(config)).toBe('');
	});

	it('генерирует несколько тем', () => {
		const config = {
			...defaultThemeConfig,
			list: { ocean: { base: '#0ea5e9' }, forest: { base: '#22c55e' } },
		};
		const css = generateThemeCSS(config);

		expect(css).toContain("[data-theme='ocean']");
		expect(css).toContain("[data-theme='forest']");
	});
});
