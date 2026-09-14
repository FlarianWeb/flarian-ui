import type { UIPluginOptions } from '../plugin/types';
import { deepMerge } from '../utils';

import { defaultA11yConfig } from './a11y';
import type { DefaultA11yConfig } from './a11y/types';
import { defaultColorsConfig } from './colors';
import type { DefaultColorsConfig } from './colors/types';
import { defaultComponentConfig } from './components';
import type { ComponentsRuntimeConfig, ConfigComponents } from './components/types';
import { defaultMotionConfig } from './motion';
import type { DefaultMotionConfig } from './motion/types';
import { defaultSchemeConfig } from './scheme';
import type { DefaultSchemeConfig } from './scheme/types';
import { resolveSurfaceConfig } from './surface';
import type { DefaultSurfaceConfig } from './surface/types';
import { resolveThemeConfig } from './themes';
import type { DefaultThemeConfig } from './themes/types';
import { defaultTokensConfig } from './tokens';
import type { DefaultTokensConfig } from './tokens/types';
import { defaultTypographyConfig } from './typography';
import type { DefaultTypographyConfig } from './typography/types';

/**
 * Полностью отрезолвленная конфигурация UI-кита — единственное представление,
 * которое разрешено потреблять генераторам CSS и inject-модулю.
 */
export type ResolvedUIConfig = {
	a11y: DefaultA11yConfig;
	colors: DefaultColorsConfig;
	motion: DefaultMotionConfig;
	scheme: DefaultSchemeConfig;
	surface: DefaultSurfaceConfig;
	theme: DefaultThemeConfig;
	tokens: DefaultTokensConfig;
	typography: DefaultTypographyConfig;

	/**
	 * Компонентные конфиги для runtime store: deepMerge с дефолтами,
	 * но только секции `props` — дефолты пропсов нужны компонентам в рантайме.
	 */
	componentsRuntime: ComponentsRuntimeConfig;

	/**
	 * СЫРОЙ `options.component` для генерации CSS — **намеренно без мержа
	 * с дефолтами** (diff-эмиссия): `generateComponentTokensCSS` эмитит только
	 * переданные потребителем токены, дефолты живут fallback'ами в pcss
	 * компонентов. «Исправление» этой несимметричности зальёт в CSS дефолты
	 * всех токенов всех компонентов — предохранитель в resolveUIConfig.spec.ts.
	 */
	componentTokensDiff: ConfigComponents | undefined;

	/**
	 * Префикс ключей localStorage и DOM-id служебных элементов пакета.
	 */
	storagePrefix: string;
};

/**
 * Единая точка резолвинга конфигурации UI-кита.
 *
 * Все потребители resolved-конфига — виртуальные CSS-модули (`load()`),
 * inline-CSS для webpack/rspack/esbuild (`buildInlineCSS`) и inject-модуль
 * (`generateInject`) — обязаны получать его отсюда: дублирование мержей
 * по месту потребления приводит к дрейфу зон между путями доставки.
 */
export const resolveUIConfig = (options: UIPluginOptions = {}): ResolvedUIConfig => {
	const componentsResolved = deepMerge(defaultComponentConfig, options.component ?? null);

	const componentsRuntime = Object.fromEntries(
		Object.entries(componentsResolved).map(([name, componentConfig]) => [
			name,
			{ props: componentConfig.props },
		])
	) as ComponentsRuntimeConfig;

	return {
		theme: resolveThemeConfig(options.theme),
		surface: resolveSurfaceConfig(options.surface),
		colors: deepMerge(defaultColorsConfig, options.colors ?? null),
		scheme: deepMerge(defaultSchemeConfig, options.scheme ?? null),
		tokens: deepMerge(defaultTokensConfig, options.tokens ?? null),
		typography: deepMerge(defaultTypographyConfig, options.typography ?? null),
		motion: deepMerge(defaultMotionConfig, options.motion ?? null),
		a11y: deepMerge(defaultA11yConfig, options.a11y ?? null),
		componentsRuntime,
		componentTokensDiff: options.component,
		storagePrefix: options.storagePrefix ?? 'flarian-ui',
	};
};
