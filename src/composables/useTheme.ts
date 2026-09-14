import type { Ref } from 'vue';

import type { UiTheme } from '~/registry';
import { getConfig } from '~/runtime';

import { resolveStateContainer } from './appState';

const storageKey = () => `${getConfig().storagePrefix}-theme`;

/**
 * `theme.default` — это только CSS-фолбэк (`:root` в `generateThemeCSS`) и
 * сигнал «не ставить атрибут» в `applyToDOM`. Начальное значение `theme` он
 * не определяет: если явного выбора нет (ни в localStorage, ни через
 * `setTheme()`), это честно `null` — «ничего не выбрано», а не «выбран
 * default». Поэтому `null` — стабильное, симметричное с `setTheme()`
 * состояние: и «никогда не выбирали», и `clearTheme()` дают один и тот же
 * результат при reload, без отдельного маркера в localStorage.
 */
const resolveInitialTheme = (): null | UiTheme => {
	const config = getConfig().theme;

	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(storageKey());

		if (stored !== null && (config.list as string[]).includes(stored)) {
			return stored as UiTheme;
		}
	}

	return null;
};

/**
 * Атрибут не ставится, если активная тема совпадает с `theme.default` —
 * он уже полностью покрыт `:root` в `generateThemeCSS`, дублировать его на
 * `<html>` незачем. CSS-блок `[data-theme='default']` при этом всё ещё
 * генерируется — это позволяет явно сбросить вложенный scoped-scope к
 * дефолтной теме, даже если сама библиотека его не проставляет.
 */
const applyToDOM = (value: null | UiTheme) => {
	if (typeof document !== 'undefined') {
		const config = getConfig().theme;

		if (value !== null && value !== config.default) {
			document.documentElement.setAttribute(config.attribute, value);
		} else {
			document.documentElement.removeAttribute(config.attribute);
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
const ensureState = (): Ref<null | UiTheme> => {
	const container = resolveStateContainer();

	if (!container.theme) {
		container.theme = ref(resolveInitialTheme());
		applyToDOM(container.theme.value);
	}

	return container.theme;
};

/**
 * Управляет активной темой приложения.
 *
 * Начальное значение берётся из `localStorage`; если там ничего нет — `null`
 * («ничего не выбрано», не `theme.default` — тот определяет только CSS-фолбэк).
 * Если тема не зарегистрирована в `theme.list` — игнорируется.
 *
 * @example
 * const { theme, setTheme, clearTheme } = useTheme()
 * setTheme('ocean')
 * clearTheme()
 */
export const useTheme = () => {
	const state = ensureState();

	const setTheme = (value: UiTheme) => {
		state.value = value;
		applyToDOM(value);

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(storageKey(), value);
		}
	};

	const clearTheme = () => {
		state.value = null;
		applyToDOM(null);

		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(storageKey());
		}
	};

	return { theme: readonly(state), setTheme, clearTheme };
};
