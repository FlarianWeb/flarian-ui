/**
 * Мок runtime store: getConfig лениво читает мутируемый объект —
 * тесты меняют конфиг без повторной регистрации мока (нет гонок с doMock).
 */
const defaultConfig = () => ({
	theme: {
		attribute: 'data-theme',
		list: ['ocean', 'forest'],
		default: null as null | string,
	},
	storagePrefix: 'flarian-ui',
});

let runtimeConfigMock = defaultConfig();

vi.mock('~/runtime', () => ({ getConfig: () => runtimeConfigMock }));

describe('useTheme', () => {
	beforeEach(() => {
		vi.resetModules();
		runtimeConfigMock = defaultConfig();
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
		vi.unstubAllGlobals();
	});

	const load = async () => {
		const { useTheme } = await import('./useTheme');

		return useTheme();
	};

	it('начальная тема null если нет localStorage и default null', async () => {
		const { theme } = await load();

		expect(theme.value).toBeNull();
	});

	it('начальная тема из localStorage если она в списке', async () => {
		localStorage.setItem('flarian-ui-theme', 'ocean');

		const { theme } = await load();

		expect(theme.value).toBe('ocean');
	});

	it('игнорирует localStorage если тема не в списке', async () => {
		localStorage.setItem('flarian-ui-theme', 'unknown');

		const { theme } = await load();

		expect(theme.value).toBeNull();
	});

	it('setTheme меняет активную тему', async () => {
		const { theme, setTheme } = await load();

		setTheme('ocean' as never);

		expect(theme.value).toBe('ocean');
	});

	it('setTheme устанавливает атрибут на <html>', async () => {
		const { setTheme } = await load();

		setTheme('forest' as never);

		expect(document.documentElement.getAttribute('data-theme')).toBe('forest');
	});

	it('setTheme записывает в localStorage', async () => {
		const { setTheme } = await load();

		setTheme('ocean' as never);

		expect(localStorage.getItem('flarian-ui-theme')).toBe('ocean');
	});

	it('clearTheme сбрасывает тему до null', async () => {
		localStorage.setItem('flarian-ui-theme', 'ocean');

		const { theme, clearTheme } = await load();

		expect(theme.value).toBe('ocean');
		clearTheme();
		expect(theme.value).toBeNull();
	});

	it('clearTheme убирает атрибут с <html>', async () => {
		const { setTheme, clearTheme } = await load();

		setTheme('ocean' as never);
		clearTheme();

		expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
	});

	it('clearTheme удаляет из localStorage', async () => {
		const { setTheme, clearTheme } = await load();

		setTheme('ocean' as never);
		clearTheme();

		expect(localStorage.getItem('flarian-ui-theme')).toBeNull();
	});

	it('начальная тема null если нет localStorage, даже при непустом default в конфиге', async () => {
		runtimeConfigMock = {
			theme: { attribute: 'data-theme', list: ['ocean'], default: 'ocean' },
			storagePrefix: 'flarian-ui',
		};

		const { useTheme } = await import('./useTheme');
		const { theme } = useTheme();

		expect(theme.value).toBeNull();
	});

	it('тема равна default — атрибут не ставится (уже покрыт :root)', async () => {
		runtimeConfigMock = {
			theme: { attribute: 'data-theme', list: ['ocean'], default: 'ocean' },
			storagePrefix: 'flarian-ui',
		};

		const { useTheme } = await import('./useTheme');

		useTheme();

		expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
	});

	it('setTheme(default) убирает атрибут', async () => {
		runtimeConfigMock = {
			theme: { attribute: 'data-theme', list: ['ocean', 'forest'], default: 'ocean' },
			storagePrefix: 'flarian-ui',
		};

		const { useTheme } = await import('./useTheme');
		const { setTheme } = useTheme();

		setTheme('forest' as never);
		setTheme('ocean' as never);

		expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
	});

	it('clearTheme и «никогда не выбирали» дают одинаковое состояние при следующей загрузке', async () => {
		runtimeConfigMock = {
			theme: { attribute: 'data-theme', list: ['ocean'], default: 'ocean' },
			storagePrefix: 'flarian-ui',
		};

		const { setTheme, clearTheme } = await load();

		setTheme('ocean' as never);
		clearTheme();

		vi.resetModules();

		const { useTheme } = await import('./useTheme');
		const { theme } = useTheme();

		expect(theme.value).toBeNull();
	});

	it('повторный вызов useTheme переиспользует singleton-состояние', async () => {
		const first = await load();
		const { useTheme } = await import('./useTheme');
		const second = useTheme();

		expect(second.theme.value).toBe(first.theme.value);

		first.setTheme('ocean' as never);

		expect(second.theme.value).toBe('ocean');
	});

	it('SSR: работает без localStorage и document', async () => {
		vi.stubGlobal('localStorage', undefined);
		vi.stubGlobal('document', undefined);

		const { useTheme } = await import('./useTheme');
		const { theme, setTheme, clearTheme } = useTheme();

		expect(theme.value).toBeNull();
		expect(() => setTheme('ocean' as never)).not.toThrow();
		expect(theme.value).toBe('ocean');
		expect(() => clearTheme()).not.toThrow();
		expect(theme.value).toBeNull();
	});
});
