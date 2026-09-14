/**
 * Мок runtime store: getConfig лениво читает мутируемый объект.
 */
const defaultConfig = () => ({
	theme: { attribute: 'data-theme', list: ['ocean'], default: 'ocean' as null | string },
	scheme: { default: 'auto', attribute: 'data-scheme', dark: 'dark', light: 'light' },
});

let runtimeConfigMock = defaultConfig();

vi.mock('~/runtime', () => ({ getConfig: () => runtimeConfigMock }));

describe('useConfig', () => {
	beforeEach(() => {
		vi.resetModules();
		runtimeConfigMock = defaultConfig();
	});

	it('возвращает resolved-конфиг из runtime store', async () => {
		const { useConfig } = await import('./useConfig');
		const config = useConfig();

		expect(config.theme.list).toEqual(['ocean']);
		expect(config.scheme.attribute).toBe('data-scheme');
	});

	it('отражает конфиг, переданный плагином (актуальное состояние store)', async () => {
		runtimeConfigMock = {
			...defaultConfig(),
			theme: { attribute: 'data-theme', list: ['forest', 'rose'], default: null },
		};

		const { useConfig } = await import('./useConfig');

		expect(useConfig().theme.list).toEqual(['forest', 'rose']);
	});
});
