import type { DeepPartial } from '~/types/deep-partial';

import type { DefaultBackdropConfig } from './backdrop/types';
import type { DefaultControlFontSizeConfig } from './control-font-size/types';
import type { DefaultControlIconSizeConfig } from './control-icon-size/types';
import type { DefaultControlLineHeightConfig } from './control-line-height/types';
import type { DefaultDurationConfig } from './duration/types';
import type { DefaultEasingConfig } from './easing/types';
import type { DefaultFontSizeConfig } from './font-size/types';
import type { DefaultFontWeightConfig } from './font-weight/types';
import type { DefaultRadiusConfig } from './radius/types';
import type { DefaultShadowConfig } from './shadow/types';
import type { DefaultSpaceConfig } from './space/types';

/**
 * Конфигурация шкальных дизайн-токенов.
 * Каждый ключ типизирован соответствующей моделью
 */
export type DefaultTokensConfig = {
	/**
	 * Backdrop blur для модальных окон.
	 *
	 * `--ui-backdrop-*`
	 */
	backdrop: DefaultBackdropConfig;

	/**
	 * Размеры шрифта контролов.
	 *
	 * `--ui-control-font-size-*`
	 */
	controlFontSize: DefaultControlFontSizeConfig;

	/**
	 * Размеры иконок контролов.
	 *
	 * `--ui-control-icon-size-*`
	 */
	controlIconSize: DefaultControlIconSizeConfig;

	/**
	 * Множители line-height контролов (unitless, считаются от font-size).
	 *
	 * `--ui-control-line-height-*`
	 */
	controlLineHeight: DefaultControlLineHeightConfig;

	/**
	 * Длительности анимаций.
	 *
	 * `--ui-duration-*`
	 */
	duration: DefaultDurationConfig;

	/**
	 * Функции анимаций.
	 *
	 * `--ui-easing-*`
	 */
	easing: DefaultEasingConfig;

	/**
	 * Размеры шрифта и иконок.
	 *
	 * `--ui-font-size-*`
	 */
	fontSize: DefaultFontSizeConfig;

	/**
	 * Толщина шрифтов.
	 *
	 * `--ui-font-weight-*`
	 */
	fontWeight: DefaultFontWeightConfig;

	/**
	 * Радиусы скругления.
	 *
	 * `--ui-radius-*`
	 */
	radius: DefaultRadiusConfig;

	/**
	 * Тени.
	 *
	 * `--ui-shadow-*`
	 */
	shadow: DefaultShadowConfig;

	/**
	 * Размеры отступов.
	 *
	 * `--ui-space-*`
	 */
	space: DefaultSpaceConfig;
};

/**
 * Входная конфигурация токенов для плагина — все поля опциональны.
 */
export type ConfigTokens = DeepPartial<DefaultTokensConfig>;
