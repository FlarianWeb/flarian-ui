import type { App, Component, Directive } from 'vue';

import * as components from '~/components';
import { useMotion, useScheme, useSurface, useTheme, useTransparency } from '~/composables';
import { UI_STATE_KEY, type UIStateContainer } from '~/composables/appState';
import * as directives from '~/directives';

import '~/assets/styles/main.css';

import '@flarian/ui/inject';

export const flarianUI = (app: App) => {
	Object.entries(components).forEach(([name, component]) => {
		app.component(name, component as Component);
	});

	Object.entries(directives).forEach(([name, directive]) => {
		app.directive(name, directive as Directive);
	});

	/**
	 * Состояние composables живёт на уровне приложения: на SSR-сервере каждый
	 * запрос создаёт своё приложение и получает свежий контейнер — `setTheme()`
	 * одного запроса не утекает в другие.
	 */
	const state: UIStateContainer = {};

	app.provide(UI_STATE_KEY, state);

	/**
	 * Инициализация состояний: применяет атрибуты схемы/темы/поверхности/a11y
	 * на <html> при старте приложения (composables ленивые — без этого вызова
	 * атрибуты появились бы только при первом использовании).
	 * `runWithContext` даёт composables увидеть провайднутый контейнер —
	 * вне setup-контекста `inject()` иначе недоступен.
	 */
	app.runWithContext(() => {
		useScheme();
		useTheme();
		useSurface();
		useMotion();
		useTransparency();
	});
};
