import { defaultA11yConfig } from '~/config/a11y';
import type { DefaultA11yConfig } from '~/config/a11y/types';
import { defaultComponentConfig } from '~/config/components';
import type { DefaultComponentConfig } from '~/config/components/types';
import { defaultSchemeConfig } from '~/config/scheme';
import type { DefaultSchemeConfig } from '~/config/scheme/types';
import { defaultSurfaceConfig } from '~/config/surface';
import { defaultThemeConfig } from '~/config/themes';
import type { UiSurface, UiTheme } from '~/registry';

/**
 * Runtime config - только то, что нужно composables.
 * `list`/`default` типизированы `UiTheme` — сужаются до реально
 * зарегистрированных имён через `RegistryTheme` (module augmentation,
 * генерируется плагином), как и `theme.value`/параметр `setTheme()`.
 */
export type RuntimeTheme = {
	attribute: string;
	default: null | UiTheme;
	list: UiTheme[];
};

/**
 * Runtime config поверхности - в отличие от темы `default` не nullable:
 * всегда указывает на валидный ключ `list`. `UiSurface` — аналогично `UiTheme`,
 * через `RegistrySurface`.
 */
export type RuntimeSurface = {
	attribute: string;
	default: UiSurface;
	list: UiSurface[];
};

/**
 * Компонентные конфиги в рантайме — только секции `props`: `tokens`
 * существуют исключительно на этапе генерации CSS и в store не доставляются
 * (вырезаются в `generateInject`).
 */
export type RuntimeComponents = {
	[K in keyof DefaultComponentConfig]: Pick<DefaultComponentConfig[K], 'props'>;
};

/**
 * Resolved config, доступный в рантайме.
 * Инициализируется дефолтами; переопределяется через {@link provideConfig}, который генерирует плагин (`@flarian/ui/inject`).
 */
export type RuntimeConfig = {
	a11y: DefaultA11yConfig;
	components: RuntimeComponents;
	scheme: DefaultSchemeConfig;
	surface: RuntimeSurface;
	theme: RuntimeTheme;

	/**
	 * Префикс ключей localStorage (`{prefix}-scheme`, `{prefix}-theme`, `{prefix}-surface`, …).
	 */
	storagePrefix: string;
};

/**
 * Источник SVG-спрайта иконок.
 * `url` — внешний файл (dev middleware, emitted asset, статика из dist).
 * `inline` — XML спрайта, монтируется в DOM (bundlers без asset-pipelines, CDN).
 */
export type SpriteSource = { inline: string } | { url: string };

/**
 * Конфигурация пакета.
 */
const config: RuntimeConfig = {
	theme: {
		attribute: defaultThemeConfig.attribute,
		/**
		 * Каст неизбежен: зашитые дефолты пакета (`'base'`) — это просто строки,
		 * а не зарегистрированные имена потребителя. `UiTheme` (через `RegistryTheme`)
		 * описывает то, что реально сконфигурировано плагином через `provideConfig()`,
		 * которым эти дефолты и перезаписываются в реальном приложении.
		 */
		list: Object.keys(defaultThemeConfig.list) as UiTheme[],
		default: defaultThemeConfig.default as null | UiTheme,
	},
	surface: {
		attribute: defaultSurfaceConfig.attribute,
		list: Object.keys(defaultSurfaceConfig.list) as UiSurface[],
		default: defaultSurfaceConfig.default as UiSurface,
	},
	scheme: defaultSchemeConfig,
	components: defaultComponentConfig,
	a11y: defaultA11yConfig,
	storagePrefix: 'flarian-ui',
};
let spriteUrl = '';

/**
 * DOM-id служебных контейнеров выводятся из `storagePrefix` — в MF-сценарии
 * два приложения с собственными копиями пакета (и разными префиксами)
 * не перезапишут спрайт/стили друг друга. `provideConfig` вызывается
 * сгенерированным inject-кодом до `provideSprite`/`provideStyle`,
 * поэтому префикс к этому моменту уже актуален.
 */
const spriteContainerId = (): string => `${config.storagePrefix}-sprite`;
const styleElementId = (): string => `${config.storagePrefix}-style`;

/**
 * Монтирует inline-режим спрайта в DOM.
 */
const mountInlineSprite = (svg: string): void => {
	if (typeof document === 'undefined') {
		return;
	}

	const mount = () => {
		const id = spriteContainerId();
		let container = document.getElementById(id);

		if (!container) {
			container = document.createElement('div');
			container.id = id;
			container.style.display = 'none';
			document.body.prepend(container);
		}

		container.innerHTML = svg;
	};

	if (document.body) {
		mount();
	} else {
		document.addEventListener('DOMContentLoaded', mount, { once: true });
	}
};

/**
 * Переопределяет runtime-config.
 * Вызывается сгенерированным кодом `@flarian/ui/inject` до `app.use(flarianUI)`.
 * Без вызова действуют дефолты — пакет работоспособен и без плагина.
 */
export const provideConfig = (partial: Partial<RuntimeConfig>): void => {
	Object.assign(config, partial);
};

/**
 * Возвращает актуальный runtime-config.
 * Lazy loading (в момент вызова composable / render) - не кешировать на уровне модуля.
 */
export const getConfig = (): RuntimeConfig => config;

/**
 * Регистрирует источник SVG-спрайта иконок.
 * `url` — `<use href="url#id">`, `inline` — спрайт монтируется в DOM, `<use href="#id">`.
 */
export const provideSprite = (source: SpriteSource): void => {
	if ('url' in source) {
		spriteUrl = source.url;

		return;
	}

	spriteUrl = '';
	mountInlineSprite(source.inline);
};

/**
 * URL спрайта для компонента `Icon`.
 */
export const getSpriteUrl = (): string => spriteUrl;

/**
 * Подключает CSS строкой через `<style>` в `<head>`.
 * Используется сгенерированным inject-кодом в bundlers без CSS-pipeline (webpack без css-loader, CDN).
 * В Vite вместо этого — обычные CSS-импорты.
 */
export const provideStyle = (css: string): void => {
	if (typeof document === 'undefined') {
		return;
	}

	const id = styleElementId();

	let style = document.getElementById(id);

	if (!style) {
		style = document.createElement('style');
		style.id = id;
		document.head.append(style);
	}

	style.textContent = css;
};
