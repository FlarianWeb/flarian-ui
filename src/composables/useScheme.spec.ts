/**
 * Мок runtime store: getConfig лениво читает мутируемый объект —
 * тесты меняют конфиг без повторной регистрации мока (нет гонок с doMock).
 */
const defaultConfig = () => ({
	scheme: {
		default: 'auto',
		attribute: 'data-scheme',
		dark: 'dark',
		light: 'light',
	},
	storagePrefix: 'flarian-ui',
});

let runtimeConfigMock = defaultConfig();

vi.mock('~/runtime', () => ({ getConfig: () => runtimeConfigMock }));

describe('useScheme', () => {
	beforeEach(() => {
		/** Первым — иначе после SSR-теста localStorage/document ещё undefined. */
		vi.unstubAllGlobals();
		vi.resetModules();
		runtimeConfigMock = defaultConfig();
		localStorage.clear();
		document.documentElement.removeAttribute('data-scheme');
	});

	const load = async () => {
		const { useScheme } = await import('./useScheme');

		return useScheme();
	};

	it('начальная схема light если matchMedia возвращает false', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: false }))
		);

		const { scheme } = await load();

		expect(scheme.value).toBe('light');
	});

	it('начальная схема dark если matchMedia возвращает true', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true }))
		);

		const { scheme } = await load();

		expect(scheme.value).toBe('dark');
	});

	it('начальная схема из localStorage приоритетнее matchMedia', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true }))
		);
		localStorage.setItem('flarian-ui-scheme', 'light');

		const { scheme } = await load();

		expect(scheme.value).toBe('light');
	});

	it('игнорирует невалидное значение в localStorage', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: false }))
		);
		localStorage.setItem('flarian-ui-scheme', 'invalid');

		const { scheme } = await load();

		expect(scheme.value).toBe('light');
	});

	it('fallback к light если matchMedia недоступен', async () => {
		const { scheme } = await load();

		expect(scheme.value).toBe('light');
	});

	it('setScheme меняет значение', async () => {
		const { scheme, setScheme } = await load();

		setScheme('dark');

		expect(scheme.value).toBe('dark');
	});

	it('setScheme устанавливает атрибут на <html>', async () => {
		const { setScheme } = await load();

		setScheme('dark');

		expect(document.documentElement.getAttribute('data-scheme')).toBe('dark');
	});

	it('setScheme записывает в localStorage', async () => {
		const { setScheme } = await load();

		setScheme('dark');

		expect(localStorage.getItem('flarian-ui-scheme')).toBe('dark');
	});

	it('setScheme light устанавливает light-значение из конфига', async () => {
		const { setScheme } = await load();

		setScheme('light');

		expect(document.documentElement.getAttribute('data-scheme')).toBe('light');
	});

	it('toggleScheme переключает с light на dark', async () => {
		const { scheme, toggleScheme } = await load();

		expect(scheme.value).toBe('light');
		toggleScheme();
		expect(scheme.value).toBe('dark');
	});

	it('toggleScheme переключает с dark на light', async () => {
		vi.stubGlobal(
			'matchMedia',
			vi.fn(() => ({ matches: true }))
		);

		const { scheme, toggleScheme } = await load();

		expect(scheme.value).toBe('dark');
		toggleScheme();
		expect(scheme.value).toBe('light');
	});

	it('applyToDOM вызывается при инициализации', async () => {
		await load();

		expect(document.documentElement.getAttribute('data-scheme')).toBe('light');
	});

	it('начальная схема из config.default если default не auto', async () => {
		runtimeConfigMock = {
			scheme: { default: 'dark', attribute: 'data-scheme', dark: 'dark', light: 'light' },
			storagePrefix: 'flarian-ui',
		};

		const { useScheme } = await import('./useScheme');
		const { scheme } = useScheme();

		expect(scheme.value).toBe('dark');
	});

	it('повторный вызов useScheme переиспользует singleton-состояние', async () => {
		const first = await load();
		const { useScheme } = await import('./useScheme');
		const second = useScheme();

		expect(second.scheme.value).toBe(first.scheme.value);

		first.setScheme('dark');

		expect(second.scheme.value).toBe('dark');
	});

	it('SSR: работает без localStorage и document', async () => {
		vi.stubGlobal('localStorage', undefined);
		vi.stubGlobal('document', undefined);

		const { useScheme } = await import('./useScheme');
		const { scheme, setScheme, toggleScheme } = useScheme();

		expect(scheme.value).toBe('light');
		expect(() => setScheme('dark')).not.toThrow();
		expect(scheme.value).toBe('dark');
		expect(() => toggleScheme()).not.toThrow();
	});

	describe("scheme 'auto': следование за системной темой", () => {
		/**
		 * Мок matchMedia с ручным вызовом change-подписчиков.
		 */
		const mockMatchMedia = (initialDark: boolean) => {
			const listeners: Array<(event: { matches: boolean }) => void> = [];

			vi.stubGlobal(
				'matchMedia',
				vi.fn(() => ({
					matches: initialDark,
					addEventListener: (_type: string, cb: (event: { matches: boolean }) => void) =>
						listeners.push(cb),
				}))
			);

			return { emitChange: (matches: boolean) => listeners.forEach(cb => cb({ matches })) };
		};

		it('смена темы ОС на dark обновляет схему, пока нет явного выбора', async () => {
			const media = mockMatchMedia(false);
			const { scheme } = await load();

			expect(scheme.value).toBe('light');

			media.emitChange(true);

			expect(scheme.value).toBe('dark');
			expect(document.documentElement.getAttribute('data-scheme')).toBe('dark');
		});

		it('смена темы ОС на light обновляет схему, пока нет явного выбора', async () => {
			const media = mockMatchMedia(true);
			const { scheme } = await load();

			expect(scheme.value).toBe('dark');

			media.emitChange(false);

			expect(scheme.value).toBe('light');
			expect(document.documentElement.getAttribute('data-scheme')).toBe('light');
		});

		it('после явного setScheme смена темы ОС игнорируется', async () => {
			const media = mockMatchMedia(false);
			const { scheme, setScheme } = await load();

			setScheme('light');
			media.emitChange(true);

			expect(scheme.value).toBe('light');
		});

		it("при default !== 'auto' подписки на matchMedia нет", async () => {
			runtimeConfigMock = {
				scheme: {
					default: 'light',
					attribute: 'data-scheme',
					dark: 'dark',
					light: 'light',
				},
				storagePrefix: 'flarian-ui',
			};

			const media = mockMatchMedia(false);
			const { scheme } = await load();

			media.emitChange(true);

			expect(scheme.value).toBe('light');
		});
	});
});
