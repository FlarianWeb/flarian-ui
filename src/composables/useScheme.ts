import { type ConfigSchemes, configSchemes, configSchemesOptional } from '~/config/scheme';
import { getConfig } from '~/runtime';

import { resolveStateContainer } from './appState';

const storageKey = () => `${getConfig().storagePrefix}-scheme`;

const resolveInitialScheme = (): ConfigSchemes => {
	const config = getConfig().scheme;

	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(storageKey());

		if (stored === configSchemes.dark || stored === configSchemes.light) {
			return stored;
		}
	}

	if (config.default === configSchemesOptional.auto) {
		if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
			return window.matchMedia('(prefers-color-scheme: dark)').matches
				? configSchemes.dark
				: configSchemes.light;
		}

		return configSchemes.light;
	}

	return config.default;
};

const applyToDOM = (value: ConfigSchemes) => {
	if (typeof document !== 'undefined') {
		const config = getConfig().scheme;

		document.documentElement.setAttribute(
			config.attribute,
			value === configSchemes.dark ? config.dark : config.light
		);
	}
};

/**
 * Пока пользователь не сделал явный выбор (нет валидного значения
 * в localStorage), схема следует за системной — реагируем на смену
 * темы ОС при открытой вкладке. Явный выбор (`setScheme`) пишет
 * в localStorage, и подписка перестаёт вмешиваться.
 */
const followSystemScheme = (state: Ref<ConfigSchemes>): void => {
	if (
		getConfig().scheme.default !== configSchemesOptional.auto ||
		typeof window === 'undefined' ||
		typeof window.matchMedia !== 'function'
	) {
		return;
	}

	const query = window.matchMedia('(prefers-color-scheme: dark)');

	/** Старые окружения (и упрощённые моки) не реализуют addEventListener. */
	if (typeof query.addEventListener !== 'function') {
		return;
	}

	query.addEventListener('change', event => {
		const stored = typeof localStorage !== 'undefined' && localStorage.getItem(storageKey());

		if (stored === configSchemes.dark || stored === configSchemes.light) {
			return;
		}

		state.value = event.matches ? configSchemes.dark : configSchemes.light;
		applyToDOM(state.value);
	});
};

/**
 * Ленивая инициализация состояния в контейнере текущего контекста
 * (см. `resolveStateContainer`): внутри приложения — app-уровневый контейнер
 * (SSR-безопасно, per-request), вне приложения — модульный фолбэк.
 * `flarianUI` вызывает composable в install(), поэтому атрибут применяется
 * при старте приложения; до этого модуль не имеет side-effect'ов (SSR-гигиена).
 */
const ensureState = (): Ref<ConfigSchemes> => {
	const container = resolveStateContainer();

	if (!container.scheme) {
		container.scheme = ref(resolveInitialScheme());
		applyToDOM(container.scheme.value);
		followSystemScheme(container.scheme);
	}

	return container.scheme;
};

/**
 * Управляет цветовой схемой приложения (dark/light).
 *
 * Начальное значение берётся из `localStorage`, системных настроек (`prefers-color-scheme`)
 * или из конфига плагина (`scheme.default`).
 *
 * @example
 * const { scheme, setScheme, toggleScheme } = useScheme()
 * setScheme('dark')
 * toggleScheme()
 */
export const useScheme = () => {
	const state = ensureState();

	const setScheme = (value: ConfigSchemes) => {
		state.value = value;
		applyToDOM(value);

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(storageKey(), value);
		}
	};

	const toggleScheme = () => {
		setScheme(state.value === configSchemes.dark ? configSchemes.light : configSchemes.dark);
	};

	return { scheme: readonly(state), setScheme, toggleScheme };
};
