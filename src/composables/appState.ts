import { hasInjectionContext, type InjectionKey, type Ref } from 'vue';

import type { ConfigSchemes } from '~/config/scheme';
import type { UiSurface, UiTheme } from '~/registry';

/**
 * Контейнер состояния composables. Каждое поле создаётся лениво
 * соответствующим composable (`ensureState`).
 */
export type UIStateContainer = {
	motion?: Ref<boolean>;
	scheme?: Ref<ConfigSchemes>;
	surface?: Ref<UiSurface>;
	theme?: Ref<null | UiTheme>;
	transparency?: Ref<boolean>;
};

/**
 * Ключ app-уровневого контейнера состояния: `flarianUI` кладёт свежий
 * контейнер в `app.provide()` при install.
 */
export const UI_STATE_KEY: InjectionKey<UIStateContainer> = Symbol('flarian-ui:state');

/**
 * Фолбэк-контейнер уровня модуля — для вызовов вне Vue-приложения
 * (например, ThemeSwitcher histoire монтируется отдельным `createApp`
 * без `flarianUI`, а обработчик `storage` живёт вообще вне Vue).
 * В браузере это безопасно: процесс обслуживает одного пользователя.
 */
const fallbackContainer: UIStateContainer = {};

/**
 * Контейнер состояния для текущего контекста.
 *
 * Внутри setup-контекста или `app.runWithContext()` — app-уровневый контейнер
 * (`flarianUI` провайдит его при install): на SSR-сервере каждый запрос
 * получает своё приложение и, значит, своё состояние — `setTheme()` в ходе
 * рендера одного запроса не утекает в другие. Вне приложения — фолбэк уровня
 * модуля (браузерные сценарии).
 */
export const resolveStateContainer = (): UIStateContainer => {
	if (hasInjectionContext()) {
		return inject(UI_STATE_KEY, fallbackContainer);
	}

	return fallbackContainer;
};
