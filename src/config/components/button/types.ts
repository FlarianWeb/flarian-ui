import type { ButtonTokens } from '~/components/ui/Buttons/Button/tokens';
import type { ButtonProps } from '~/components/ui/Buttons/Button/types';

/**
 * Resolved конфигурация компонента `Button`.
 */
export type ButtonConfig = {
	/**
	 * Resolved props — дефолты `defineProps` destructure.
	 */
	props: Required<Pick<ButtonProps, 'color' | 'direction' | 'radius' | 'size' | 'variant'>>;

	/**
	 * CSS-токены. В resolved-виде — полный набор (дефолты пакета);
	 */
	tokens: ButtonTokens;
};
