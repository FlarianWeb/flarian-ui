import type { DeepPartial } from '~/types/deep-partial';

/**
 * Семантические умолчания анимации переходов.
 */
export type DefaultMotionConfig = {
	/**
	 * Длительность transition по умолчанию для интерактивных контролов.
	 *
	 * `--ui-transition-duration`
	 * @default 'var(--ui-duration-fast)'
	 */
	transitionDuration: string;

	/**
	 * Функция анимации по умолчанию для интерактивных контролов.
	 *
	 * `--ui-transition-easing`
	 * @default 'var(--ui-easing-sine)'
	 */
	transitionEasing: string;
};

/**
 * Входная конфигурация motion для плагина — все поля опциональны.
 */
export type ConfigMotion = DeepPartial<DefaultMotionConfig>;
