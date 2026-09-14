import type { DefaultMotionConfig } from '../config/motion/types';
import type { DefaultTokensConfig } from '../config/tokens/types';
import type { DefaultTypographyConfig } from '../config/typography/types';
import { camelToKebab } from '../utils';

import { wrapLayer } from './wrapLayer';

export const generateTokensCSS = (
	tokens: DefaultTokensConfig,
	typography: DefaultTypographyConfig,
	motion: DefaultMotionConfig
): string => {
	const vars: string[] = [];

	/**
	 * Генератор токенов
	 */
	Object.entries(tokens).forEach(([token, config]) => {
		for (const [key, value] of Object.entries(config)) {
			vars.push(`\t--ui-${camelToKebab(token)}-${camelToKebab(key)}: ${value};`);
		}
	});

	/**
	 * Генератор типографики
	 */
	for (const [key, value] of Object.entries(typography)) {
		vars.push(`\t--ui-${camelToKebab(key)}: ${value};`);
	}

	/**
	 * Генератор семантических умолчаний motion
	 */
	for (const [key, value] of Object.entries(motion)) {
		vars.push(`\t--ui-${camelToKebab(key)}: ${value};`);
	}

	const a11y = [
		'[no-motion] *, [no-motion] *::before, [no-motion] *::after {',
		'\tanimation-duration: 1ms !important;',
		'\ttransition-duration: 1ms !important;',
		'\tscroll-behavior: auto !important;',
		'}',
		'',
		'[no-transparency] * {',
		'\tbackdrop-filter: none !important;',
		'}',
	].join('\n');

	return wrapLayer(`:root {\n${vars.join('\n')}\n}\n\n${a11y}`);
};
