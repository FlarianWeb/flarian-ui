import { resolveUIConfig } from '../config/resolveUIConfig';
import type { UIPluginOptions } from '../plugin/types';

import { generateInject, type InjectTarget } from './generateInject';

/**
 * Генератор принимает resolved-конфиг — резолвим опции как это делает плагин.
 */
const inject = (options: UIPluginOptions, target: InjectTarget): string =>
	generateInject(resolveUIConfig(options), target);

describe('generateInject', () => {
	it('vite-dev: дефолтные опции (snapshot)', () => {
		expect(inject({}, { mode: 'vite-dev', sprite: '<svg id="s"></svg>' })).toMatchSnapshot();
	});

	it('vite-build: спрайт через ROLLUP_FILE_URL', () => {
		const code = inject({}, { mode: 'vite-build', spriteRefId: 'ref123' });

		expect(code).toContain('import.meta.ROLLUP_FILE_URL_ref123');
		expect(code).toContain('provideConfig(');
		expect(code).toContain("'\\0flarian-ui-theme.css'");
		expect(code).toContain("'\\0flarian-ui-surface.css'");
	});

	it('inline: CSS и спрайт запекаются строками', () => {
		const code = inject(
			{},
			{ mode: 'inline', sprite: '<svg id="s"></svg>', css: ':root { --x: 1; }' }
		);

		expect(code).toContain('provideStyle(');
		expect(code).toContain('provideSprite({ inline:');
		expect(code).toContain('--x: 1;');
		expect(code).not.toContain('\\0flarian-ui');
	});

	it('передаёт resolved конфиг в provideConfig', () => {
		const code = inject(
			{
				theme: { list: { ocean: { base: '#0ea5e9' } }, default: 'ocean' },
				scheme: { default: 'dark' },
			},
			{ mode: 'vite-dev', sprite: '<svg></svg>' }
		);

		expect(code).toContain('"list":["ocean"]');
		expect(code).toContain('"default":"ocean"');
		expect(code).toContain('"scheme":{"default":"dark"');
	});

	it('передаёт resolved surface в provideConfig', () => {
		const code = inject(
			{ surface: { list: { warm: { 500: '#a08968' } } } },
			{ mode: 'vite-dev', sprite: '<svg></svg>' }
		);

		expect(code).toContain('"surface":{');
		expect(code).toContain('"list":["warm"]');
		expect(code).toContain('"default":"warm"');
	});

	it('импортирует runtime из пакета, а не относительным путём', () => {
		const code = inject({}, { mode: 'vite-dev', sprite: '<svg></svg>' });

		expect(code).toContain("from '@flarian/ui/runtime'");
	});
});
