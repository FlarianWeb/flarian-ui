/**
 * Мок runtime store: getConfig лениво читает мутируемый объект —
 * тесты меняют конфиг без повторной регистрации мока (нет гонок с doMock).
 */
const defaultConfig = () => ({
	surface: {
		attribute: 'data-surface',
		list: ['default', 'warm'],
		default: 'default',
	},
	storagePrefix: 'flarian-ui',
});

let runtimeConfigMock = defaultConfig();

vi.mock('~/runtime', () => ({ getConfig: () => runtimeConfigMock }));

describe('useSurface', () => {
	beforeEach(() => {
		vi.resetModules();
		runtimeConfigMock = defaultConfig();
		localStorage.clear();
		document.documentElement.removeAttribute('data-surface');
		vi.unstubAllGlobals();
	});

	const load = async () => {
		const { useSurface } = await import('./useSurface');

		return useSurface();
	};

	it('начальная поверхность — default из конфига если нет localStorage', async () => {
		const { surface } = await load();

		expect(surface.value).toBe('default');
	});

	it('начальная поверхность из localStorage если она в списке', async () => {
		localStorage.setItem('flarian-ui-surface', 'warm');

		const { surface } = await load();

		expect(surface.value).toBe('warm');
	});

	it('игнорирует localStorage если поверхность не в списке', async () => {
		localStorage.setItem('flarian-ui-surface', 'unknown');

		const { surface } = await load();

		expect(surface.value).toBe('default');
	});

	it('setSurface меняет активную поверхность', async () => {
		const { surface, setSurface } = await load();

		setSurface('warm' as never);

		expect(surface.value).toBe('warm');
	});

	it('setSurface устанавливает атрибут на <html>', async () => {
		const { setSurface } = await load();

		setSurface('warm' as never);

		expect(document.documentElement.getAttribute('data-surface')).toBe('warm');
	});

	it('setSurface записывает в localStorage', async () => {
		const { setSurface } = await load();

		setSurface('warm' as never);

		expect(localStorage.getItem('flarian-ui-surface')).toBe('warm');
	});

	it('инициализация с default-поверхностью не ставит атрибут (уже покрыт :root)', async () => {
		await load();

		expect(document.documentElement.hasAttribute('data-surface')).toBe(false);
	});

	it('инициализация с не-default поверхностью (из localStorage) ставит атрибут', async () => {
		localStorage.setItem('flarian-ui-surface', 'warm');

		await load();

		expect(document.documentElement.getAttribute('data-surface')).toBe('warm');
	});

	it('setSurface(default) убирает атрибут', async () => {
		const { setSurface } = await load();

		setSurface('warm' as never);
		setSurface('default' as never);

		expect(document.documentElement.hasAttribute('data-surface')).toBe(false);
	});

	it('начальная поверхность из другого default конфига', async () => {
		runtimeConfigMock = {
			surface: { attribute: 'data-surface', list: ['default', 'warm'], default: 'warm' },
			storagePrefix: 'flarian-ui',
		};

		const { useSurface } = await import('./useSurface');
		const { surface } = useSurface();

		expect(surface.value).toBe('warm');
	});

	it('повторный вызов useSurface переиспользует singleton-состояние', async () => {
		const first = await load();
		const { useSurface } = await import('./useSurface');
		const second = useSurface();

		expect(second.surface.value).toBe(first.surface.value);

		first.setSurface('warm' as never);

		expect(second.surface.value).toBe('warm');
	});

	it('SSR: работает без localStorage и document', async () => {
		vi.stubGlobal('localStorage', undefined);
		vi.stubGlobal('document', undefined);

		const { useSurface } = await import('./useSurface');
		const { surface, setSurface } = useSurface();

		expect(surface.value).toBe('default');
		expect(() => setSurface('warm' as never)).not.toThrow();
		expect(surface.value).toBe('warm');
	});
});
