import type { Ref } from 'vue';

import type { UiSurface } from '~/registry';
import { getConfig } from '~/runtime';

import { resolveStateContainer } from './appState';

const storageKey = () => `${getConfig().storagePrefix}-surface`;

const resolveInitialSurface = (): UiSurface => {
	const config = getConfig().surface;

	if (typeof localStorage !== 'undefined') {
		const stored = localStorage.getItem(storageKey());

		if (stored !== null && (config.list as string[]).includes(stored)) {
			return stored as UiSurface;
		}
	}

	return config.default as UiSurface;
};

/**
 * Атрибут не ставится, если активная поверхность совпадает с `surface.default` —
 * он уже полностью покрыт `:root` в `generateSurfaceCSS`, дублировать его на
 * `<html>` незачем. CSS-блок `[data-surface='default']` при этом всё ещё
 * генерируется — это позволяет явно сбросить вложенный scoped-scope к
 * дефолтной поверхности, даже если сама библиотека его не проставляет.
 */
const applyToDOM = (value: UiSurface) => {
	if (typeof document !== 'undefined') {
		const config = getConfig().surface;

		if (value === config.default) {
			document.documentElement.removeAttribute(config.attribute);
		} else {
			document.documentElement.setAttribute(config.attribute, value);
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
const ensureState = (): Ref<UiSurface> => {
	const container = resolveStateContainer();

	if (!container.surface) {
		container.surface = ref(resolveInitialSurface());
		applyToDOM(container.surface.value);
	}

	return container.surface;
};

/**
 * Управляет активной поверхностью приложения (нейтральная шкала + статусные цвета).
 *
 * В отличие от `useTheme()` не имеет состояния «без поверхности» — дизайн-система
 * не может работать без шкалы, поэтому всегда активен валидный ключ из `surface.list`
 * (по умолчанию — встроенный пресет `'base'`).
 *
 * Начальное значение берётся из `localStorage` или из конфига плагина (`surface.default`).
 * Если поверхность не зарегистрирована в `surface.list` — игнорируется.
 *
 * @example
 * const { surface, setSurface } = useSurface()
 * setSurface('warm')
 */
export const useSurface = () => {
	const state = ensureState();

	const setSurface = (value: UiSurface) => {
		state.value = value;
		applyToDOM(value);

		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(storageKey(), value);
		}
	};

	return { surface: readonly(state), setSurface };
};
