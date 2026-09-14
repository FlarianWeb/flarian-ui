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

describe('useMotion', () => {
	beforeEach(() => {
		vi.resetModules();
		runtimeConfigMock = defaultConfig();
		localStorage.clear();
		document.documentElement.removeAttribute('no-motion');
		vi.unstubAllGlobals();
	});

	const load = async () => {
		const { useMotion } = await import('./useMotion');

		return useMotion();
	};

	it('начальное значение true из конфига', async () => {
		const { motion } = await load();

		expect(motion.value).toBe(true);
	});

	it('начальное значение false из localStorage', async () => {
		localStorage.setItem('flarian-ui-motion', 'false');

		const { motion } = await load();

		expect(motion.value).toBe(false);
	});

	it('начальное значение true из localStorage', async () => {
		localStorage.setItem('flarian-ui-motion', 'true');

		const { motion } = await load();

		expect(motion.value).toBe(true);
	});

	it('игнорирует невалидное значение в localStorage и берёт из конфига', async () => {
		localStorage.setItem('flarian-ui-motion', 'invalid');

		const { motion } = await load();

		expect(motion.value).toBe(true);
	});

	it('setMotion(false) устанавливает атрибут no-motion', async () => {
		const { setMotion } = await load();

		setMotion(false);

		expect(document.documentElement.hasAttribute('no-motion')).toBe(true);
	});

	it('setMotion(true) убирает атрибут no-motion', async () => {
		const { setMotion } = await load();

		setMotion(false);
		setMotion(true);

		expect(document.documentElement.hasAttribute('no-motion')).toBe(false);
	});

	it('setMotion записывает в localStorage', async () => {
		const { setMotion } = await load();

		setMotion(false);

		expect(localStorage.getItem('flarian-ui-motion')).toBe('false');
	});

	it('setMotion меняет значение ref', async () => {
		const { motion, setMotion } = await load();

		setMotion(false);

		expect(motion.value).toBe(false);
	});

	it('toggleMotion переключает с true на false', async () => {
		const { motion, toggleMotion } = await load();

		expect(motion.value).toBe(true);
		toggleMotion();
		expect(motion.value).toBe(false);
	});

	it('toggleMotion переключает с false на true', async () => {
		const { motion, toggleMotion } = await load();

		toggleMotion();
		toggleMotion();

		expect(motion.value).toBe(true);
	});

	it('начальное значение false из конфига устанавливает атрибут no-motion', async () => {
		runtimeConfigMock = {
			a11y: { motion: false, transparency: true },
			storagePrefix: 'flarian-ui',
		};

		const { useMotion } = await import('./useMotion');

		useMotion();

		expect(document.documentElement.hasAttribute('no-motion')).toBe(true);
	});

	it('повторный вызов useMotion переиспользует singleton-состояние', async () => {
		const first = await load();
		const { useMotion } = await import('./useMotion');
		const second = useMotion();

		expect(second.motion.value).toBe(first.motion.value);

		first.setMotion(false);

		expect(second.motion.value).toBe(false);
	});

	it('SSR: работает без localStorage и document', async () => {
		vi.stubGlobal('localStorage', undefined);
		vi.stubGlobal('document', undefined);

		const { useMotion } = await import('./useMotion');
		const { motion, setMotion, toggleMotion } = useMotion();

		expect(motion.value).toBe(true);
		expect(() => setMotion(false)).not.toThrow();
		expect(motion.value).toBe(false);
		expect(() => toggleMotion()).not.toThrow();
		expect(motion.value).toBe(true);
	});
});
