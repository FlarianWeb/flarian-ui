import type { UiSize } from '~/components/shared/props';

/**
 * Resolved конфигурация компонента `Icon`.
 * CSS-токенов у Icon нет — только дефолты пропсов.
 */
export type IconConfig = {
	/**
	 * Resolved props — дефолты `withDefaults`.
	 */
	props: {
		/**
		 * Размер иконки.
		 */
		size: UiSize;
	};
};
