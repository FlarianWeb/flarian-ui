import type { Ref } from 'vue';

import { getConfig } from '~/runtime';

import { resolveStateContainer } from './appState';

const storageKey = () => `${getConfig().storagePrefix}-motion`;

const resolveInitialMotion = (): boolean => {
	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(storageKey());

		if (stored === 'true') {
			return true;
		}
		if (stored === 'false') {
			return false;
		}
	}

	return getConfig().a11y.motion;
};

const applyToDOM = (value: boolean) => {
	if (typeof document !== 'undefined') {
		if (value) {
			document.documentElement.removeAttribute('no-motion');
		} else {
			document.documentElement.setAttribute('no-motion', '');
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

	if (!container.motion) {
		container.motion = ref(resolveInitialMotion());
		applyToDOM(container.motion.value);
	}

	return container.motion;
};

/**
 * Управляет настройкой анимаций (a11y).
 *
 * Если `motion` равен `false` — атрибут `no-motion` устанавливается на `<html>`,
 * что активирует CSS-правила, отключающие все анимации и переходы.
 * Начальное значение берётся из `localStorage` или конфига плагина (`a11y.motion`).
 *
 * @example
 * const { motion, setMotion } = useMotion()
 * setMotion(false) // отключить анимации
 * setMotion(true)  // включить анимации
 */
export const useMotion = () => {
	const state = ensureState();

	const setMotion = (value: boolean) => {
		state.value = value;
		applyToDOM(value);

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(storageKey(), String(value));
		}
	};

	const toggleMotion = () => {
		setMotion(!state.value);
	};

	return { motion: readonly(state), setMotion, toggleMotion };
};
