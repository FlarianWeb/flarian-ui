import type { ConfigTheme, DefaultThemeConfig, OnBaseBehavior } from '../config/themes/types';

import { pickOnColor } from './onBaseColor';
import { wrapLayer } from './wrapLayer';

/**
 * `--ui-theme-on-base` по поведению `onBase` (см. `OnBaseBehavior`).
 * `'scheme'` (или непарсибельный base при `'auto'`) — переменная не эмитится,
 * семантика `--ui-color-on-base` откатывается к `--ui-color-on-emphasis`.
 */
const onBaseVar = (base: string, behavior: OnBaseBehavior): string[] => {
	if (behavior === 'scheme') {
		return [];
	}

	if (behavior === 'auto') {
		const on = pickOnColor(base);

		return on ? [`\t--ui-theme-on-base: var(--ui-color-${on});`] : [];
	}

	return [`\t--ui-theme-on-base: ${behavior};`];
};

const themeVars = (theme: ConfigTheme, defaultOnBase: OnBaseBehavior): string[] => [
	`\t--ui-theme-base: ${theme.base};`,
	...onBaseVar(theme.base, theme.onBase ?? defaultOnBase),
];

/**
 * Генерирует CSS для виртуального модуля темы.
 * `:root` — резолвленная `list[config.default]` (fallback без атрибута/до
 * первой отрисовки — CDN, no-bundler; отсутствует, если `default === null`,
 * т.к. в отличие от `surface` тема может быть осознанно не выбрана).
 * `[data-theme='name']` — блок на каждую именованную тему (включая default —
 * дублирует `:root`) с «сырыми» `--ui-theme-base` / `--ui-theme-on-base`, а не
 * семантическими `--ui-color-*`: семантика (`--ui-color-base: var(--ui-theme-base,
 * fallback)`) задаётся в схемных блоках colors. Оба набора живут на `<html>` —
 * если бы имена совпадали, получилась бы self-reference (`--x: var(--x, …)`)
 * и переменная становилась бы invalid.
 *
 * Нейтральная шкала и статусные цвета — в `generateSurfaceCSS`, отдельная
 * независимая ось (`data-surface`).
 */
export const generateThemeCSS = (config: DefaultThemeConfig): string => {
	const parts: string[] = [];
	const defaultTheme = config.default ? config.list[config.default] : undefined;

	if (defaultTheme) {
		parts.push(`:root {\n${themeVars(defaultTheme, config.onBase).join('\n')}\n}`);
	}

	for (const [name, theme] of Object.entries(config.list)) {
		parts.push(
			`[${config.attribute}='${name}'] {\n${themeVars(theme, config.onBase).join('\n')}\n}`
		);
	}

	if (parts.length === 0) {
		return '';
	}

	return wrapLayer(parts.join('\n\n'));
};
