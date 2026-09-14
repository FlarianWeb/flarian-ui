import { createApp } from 'vue';

import { UI_STATE_KEY, type UIStateContainer } from './appState';
import { useTheme } from './useTheme';

describe('appState: per-app контейнер состояния (SSR)', () => {
	afterEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute('data-theme');
	});

	/**
	 * Модель SSR-сервера: два «запроса» — два приложения с собственными
	 * контейнерами. setTheme() внутри одного не должен утекать в другой.
	 */
	it('состояние изолировано между приложениями', () => {
		/* eslint-disable vue/one-component-per-file -- два приложения и есть суть теста */
		const appA = createApp({ render: () => null });
		const appB = createApp({ render: () => null });
		/* eslint-enable vue/one-component-per-file */

		appA.provide(UI_STATE_KEY, {} satisfies UIStateContainer);
		appB.provide(UI_STATE_KEY, {} satisfies UIStateContainer);

		const themeA = appA.runWithContext(() => useTheme());
		const themeB = appB.runWithContext(() => useTheme());

		appA.runWithContext(() => themeA.setTheme('ocean' as never));

		expect(themeA.theme.value).toBe('ocean');
		expect(themeB.theme.value).toBeNull();
	});

	it('вне приложения работает модульный фолбэк — два вызова делят состояние', () => {
		const first = useTheme();
		const second = useTheme();

		first.setTheme('forest' as never);

		expect(second.theme.value).toBe('forest');

		first.clearTheme();
	});
});
