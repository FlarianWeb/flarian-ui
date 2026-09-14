import type { DeepPartial } from '~/types/deep-partial';

import type { ButtonConfig } from './button';
import type { IconConfig } from './icon';

/**
 * Resolved конфигурация компонентов.
 *
 * Каждый компонент — две секции: `props` (дефолты пропсов, попадают в runtime
 * store) и `tokens` (CSS-константы, живут только в генерации CSS — из runtime
 * вырезаются в `resolveUIConfig`).
 *
 * @example
 * component: {
 *   button: {
 *     props:  { size: 'lg', radius: 'full' },
 *     tokens: { paddingY: { md: '0.75rem' }, hoverMix: '88%' },
 *   },
 * }
 */
export type DefaultComponentConfig = {
	/**
	 * Resolved конфигурация `UiButton`.
	 */
	button: ButtonConfig;

	/**
	 * Resolved конфигурация `UiIcon`.
	 */
	icon: IconConfig;
};

/**
 * Входная конфигурация компонентов для плагина — все поля опциональны.
 */
export type ConfigComponents = DeepPartial<DefaultComponentConfig>;

/**
 * Компонентные конфиги, доезжающие до runtime store — только секции `props`.
 * `tokens` существуют исключительно на этапе генерации CSS
 * (см. `resolveUIConfig`: `componentsRuntime` vs `componentTokensDiff`).
 */
export type ComponentsRuntimeConfig = {
	[K in keyof DefaultComponentConfig]: Pick<DefaultComponentConfig[K], 'props'>;
};
