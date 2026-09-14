import type { Ref } from 'vue';

import { getConfig } from '~/runtime';

import { resolveStateContainer } from './appState';

const storageKey = () => `${getConfig().storagePrefix}-transparency`;

const resolveInitialTransparency = (): boolean => {
	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(storageKey());

		if (stored === 'true') {
			return true;
		}
		if (stored === 'false') {
			return false;
		}
	}

	return getConfig().a11y.transparency;
};

const applyToDOM = (value: boolean) => {
	if (typeof document !== 'undefined') {
		if (value) {
			document.documentElement.removeAttribute('no-transparency');
		} else {
			document.documentElement.setAttribute('no-transparency', '');
		}
	}
};

/**
 * Ленивая инициализация состояния в контейнере текущего контекста
 * (см. `resolveStateContainer`): внутри приложения — app-уровневый контейнер
 * (SSR-безопасно, per-request), вне приложения — модульный фолбэк.
 * `flarianUI` вызывает composable в install(), поэтому атрибут применяется
 * при старте приложения; до этого модуль не имеет side-effect'ов (SSR-гигиена).
 */
const ensureState = (): Ref<boolean> => {
	const container = resolveStateContainer();

	if (!container.transparency) {
		container.transparency = ref(resolveInitialTransparency());
		applyToDOM(container.transparency.value);
	}

	return container.transparency;
};

/**
 * Управляет настройкой полупрозрачных фонов (a11y).
 *
 * Если `transparency` равен `false` — атрибут `no-transparency` устанавливается на `<html>`,
 * что активирует CSS-правила, заменяющие полупрозрачные фоны непрозрачными.
 * Начальное значение берётся из `localStorage` или конфига плагина (`a11y.transparency`).
 *
 * @example
 * const { transparency, setTransparency, toggleTransparency } = useTransparency()
 * setTransparency(false) // отключить прозрачность
 * setTransparency(true)  // включить прозрачность
 */
export const useTransparency = () => {
	const state = ensureState();

	const setTransparency = (value: boolean) => {
		state.value = value;
		applyToDOM(value);

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(storageKey(), String(value));
		}
	};

	const toggleTransparency = () => {
		setTransparency(!state.value);
	};

	return { transparency: readonly(state), setTransparency, toggleTransparency };
};
