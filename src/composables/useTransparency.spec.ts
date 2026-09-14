/**
 * Мок runtime store: getConfig лениво читает мутируемый объект —
 * тесты меняют конфиг без повторной регистрации мока (нет гонок с doMock).
 */
const defaultConfig = () => ({
	a11y: { motion: true, transparency: true },
	storagePrefix: 'flarian-ui',
});

let runtimeConfigMock = defaultConfig();

vi.mock('~/runtime', () => ({ getConfig: () => runtimeConfigMock }));

describe('useTransparency', () => {
	beforeEach(() => {
		vi.resetModules();
		runtimeConfigMock = defaultConfig();
		localStorage.clear();
		document.documentElement.removeAttribute('no-transparency');
		vi.unstubAllGlobals();
	});

	const load = async () => {
		const { useTransparency } = await import('./useTransparency');

		return useTransparency();
	};

	it('начальное значение true из конфига', async () => {
		const { transparency } = await load();

		expect(transparency.value).toBe(true);
	});

	it('начальное значение false из localStorage', async () => {
		localStorage.setItem('flarian-ui-transparency', 'false');

		const { transparency } = await load();

		expect(transparency.value).toBe(false);
	});

	it('начальное значение true из localStorage', async () => {
		localStorage.setItem('flarian-ui-transparency', 'true');

		const { transparency } = await load();

		expect(transparency.value).toBe(true);
	});

	it('игнорирует невалидное значение в localStorage и берёт из конфига', async () => {
		localStorage.setItem('flarian-ui-transparency', 'invalid');

		const { transparency } = await load();

		expect(transparency.value).toBe(true);
	});

	it('setTransparency(false) устанавливает атрибут no-transparency', async () => {
		const { setTransparency } = await load();

		setTransparency(false);

		expect(document.documentElement.hasAttribute('no-transparency')).toBe(true);
	});

	it('setTransparency(true) убирает атрибут no-transparency', async () => {
		const { setTransparency } = await load();

		setTransparency(false);
		setTransparency(true);

		expect(document.documentElement.hasAttribute('no-transparency')).toBe(false);
	});

	it('setTransparency записывает в localStorage', async () => {
		const { setTransparency } = await load();

		setTransparency(false);

		expect(localStorage.getItem('flarian-ui-transparency')).toBe('false');
	});

	it('setTransparency меняет значение ref', async () => {
		const { transparency, setTransparency } = await load();

		setTransparency(false);

		expect(transparency.value).toBe(false);
	});

	it('toggleTransparency переключает с true на false', async () => {
		const { transparency, toggleTransparency } = await load();

		expect(transparency.value).toBe(true);
		toggleTransparency();
		expect(transparency.value).toBe(false);
	});

	it('toggleTransparency переключает с false на true', async () => {
		const { transparency, toggleTransparency } = await load();

		toggleTransparency();
		toggleTransparency();

		expect(transparency.value).toBe(true);
	});

	it('начальное значение false из конфига устанавливает атрибут no-transparency', async () => {
		runtimeConfigMock = {
			a11y: { motion: true, transparency: false },
			storagePrefix: 'flarian-ui',
		};

		const { useTransparency } = await import('./useTransparency');

		useTransparency();

		expect(document.documentElement.hasAttribute('no-transparency')).toBe(true);
	});

	it('повторный вызов useTransparency переиспользует singleton-состояние', async () => {
		const first = await load();
		const { useTransparency } = await import('./useTransparency');
		const second = useTransparency();

		expect(second.transparency.value).toBe(first.transparency.value);

		first.setTransparency(false);

		expect(second.transparency.value).toBe(false);
	});

	it('SSR: работает без localStorage и document', async () => {
		vi.stubGlobal('localStorage', undefined);
		vi.stubGlobal('document', undefined);

		const { useTransparency } = await import('./useTransparency');
		const { transparency, setTransparency, toggleTransparency } = useTransparency();

		expect(transparency.value).toBe(true);
		expect(() => setTransparency(false)).not.toThrow();
		expect(transparency.value).toBe(false);
		expect(() => toggleTransparency()).not.toThrow();
		expect(transparency.value).toBe(true);
	});
});
