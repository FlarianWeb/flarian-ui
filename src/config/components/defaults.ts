import { buttonDefaults } from './button';
import { iconDefaults } from './icon';
import type { DefaultComponentConfig } from './types';

export const defaultComponentConfig = {
	button: buttonDefaults,
	icon: iconDefaults,
} satisfies DefaultComponentConfig;
