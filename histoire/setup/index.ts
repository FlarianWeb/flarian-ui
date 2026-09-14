import { flarianUI, useSurface, useTheme } from '@flarian/ui';
import { defineSetupVue3 } from '@histoire/plugin-vue';
import { createApp } from 'vue';

import StoryDoc from '../components/story/Doc/index.vue';
import ThemeSwitcher from '../components/story/ThemeSwitcher/index.vue';

import './styles.pcss';

/**
 * Список встроенных UI Histoire.
 * Регистрируются как заглушки, чтобы компилятор Vue не выдавал предупреждения
 * об неизвестных компонентах в story-файлах.
 */
const HST_CONTROLS = [
	'HstButton',
	'HstButtonGroup',
	'HstCheckbox',
	'HstCheckboxList',
	'HstColorSelect',
	'HstColorShades',
	'HstCopyIcon',
	'HstJson',
	'HstNumber',
	'HstRadio',
	'HstSelect',
	'HstSimpleCheckbox',
	'HstSlider',
	'HstText',
	'HstTextarea',
	'HstTokenGrid',
	'HstTokenList',
	'HstWrapper',
];

/**
 * Синхронизирует тёмную тему Histoire с нашим data-scheme атрибутом.
 * Histoire вешает разные dark-классы на <html> в разных контекстах:
 * "htw-dark" в главном приложении (vueuse useDark) и "dark" в sandbox-iframe
 * (собственный watch в @histoire/app), поэтому проверяем оба варианта.
 */
const syncScheme = () => {
	const classList = document.documentElement.classList;
	const scheme = classList.contains('dark') || classList.contains('htw-dark') ? 'dark' : 'light';

	document.documentElement.dataset.scheme = scheme;
	window.parent.document.documentElement.dataset.scheme = scheme;
};

/**
 * Монтирует ThemeSwitcher в правую часть шапки Histoire через DOM-инжект.
 * Ждёт появления .histoire-app-header через MutationObserver.
 */
const mountThemeSwitcher = () => {
	const headerObserver = new MutationObserver(() => {
		const header = document.querySelector('.histoire-app-header');
		const secondDiv = header?.querySelectorAll(':scope > div')[1];

		if (secondDiv) {
			headerObserver.disconnect();

			const el = document.createElement('div');

			el.classList.add('htw-p-2', 'sm:htw-p-1');
			secondDiv.append(el);
			createApp(ThemeSwitcher).mount(el);
		}
	});

	headerObserver.observe(document.body, { childList: true, subtree: true });
};

const schemeObserver = new MutationObserver(syncScheme);

schemeObserver.observe(document.documentElement, { attributeFilter: ['class'] });
syncScheme();
mountThemeSwitcher();

/**
 * useTheme()/useSurface() резолвят тему/поверхность из localStorage → default
 * конфига (в отличие от прежнего ad-hoc чтения localStorage, которое не знало
 * о `theme.default`/`surface.default` и стирало атрибут при пустом localStorage —
 * из-за этого дефолтная тема из конфига не применялась при первом открытии).
 * Вызов один раз на уровне модуля применяет атрибут в текущем документе
 * (главное приложение и sandbox-iframe — разные вызовы этого же модуля).
 */
const { setTheme, clearTheme } = useTheme();
const { setSurface } = useSurface();

/**
 * useTheme()/useSurface() не следят за cross-window изменениями localStorage:
 * `setTheme()` в шапке Histoire (главный документ) не долетит до iframe со
 * story без явной синхронизации. Событие `storage` браузер шлёт только в
 * ДРУГИЕ same-origin окна — то что нужно.
 *
 * `clearTheme()` делает `localStorage.removeItem(...)` — событие `storage` при
 * удалении ключа приходит с `newValue: null`, а не отсутствует вовсе. Проверка
 * `event.newValue` (truthy) эту ветку игнорировала — сброс темы не долетал до
 * другого окна. `surface` аналогичной ветки не требует — `clearSurface()` нет.
 */
window.addEventListener('storage', event => {
	if (event.key === 'flarian-ui-theme') {
		if (event.newValue) {
			setTheme(event.newValue as never);
		} else {
			clearTheme();
		}
	}

	if (event.key === 'flarian-ui-surface' && event.newValue) {
		setSurface(event.newValue as never);
	}
});

/**
 * Глобальная инициализация Vue-приложения для всех stories.
 */
export const setupVue3 = defineSetupVue3(({ app }) => {
	app.use(flarianUI);

	/**
	 * `app.use(flarianUI)` при первой инициализации сам выставляет data-scheme
	 * (из своего localStorage-ключа / prefers-color-scheme), затирая значение,
	 * которое syncScheme() уже успел применить из состояния Histoire. Повторный
	 * вызов возвращает приоритет переключателю Histoire.
	 */
	syncScheme();

	app.component('StoryDoc', StoryDoc);

	HST_CONTROLS.forEach(name => {
		if (!app._context.components[name]) {
			app.component(name, { name, render: () => null });
		}
	});
});
