export const configSchemes = { light: 'light', dark: 'dark' } as const;
export const configSchemesOptional = { ...configSchemes, auto: 'auto' } as const;

export type ConfigSchemes = (typeof configSchemes)[keyof typeof configSchemes];
export type ConfigSchemesOptional =
	(typeof configSchemesOptional)[keyof typeof configSchemesOptional];

/**
 * Конфигурация механизма переключения цветовых схем.
 *
 * Схема управляется через HTML-атрибут на `<html>`:
 * `<html data-scheme="dark">` — активирует тёмную схему.
 *
 * @example
 * // Стандартное использование:
 * scheme: {
 *   default: 'dark',
 * }
 *
 * @example
 * // С кастомным атрибутом и значениями:
 * scheme: {
 *   attribute: 'data-theme-mode',
 *   dark: 'night',
 *   light: 'day',
 * }
 */
export type DefaultSchemeConfig = {
	/**
	 * Начальная схема при первом посещении.
	 * `'auto'` — определяется системным `prefers-color-scheme`.
	 * @default 'auto'
	 */
	default: ConfigSchemesOptional;

	/**
	 * Имя HTML-атрибута на `<html>` для управления схемой.
	 * @default 'data-scheme'
	 */
	attribute: string;

	/**
	 * Значение атрибута для тёмной схемы.
	 * @default 'dark'
	 */
	dark: string;

	/**
	 * Значение атрибута для светлой схемы.
	 * @default 'light'
	 */
	light: string;
};

/**
 * Входная конфигурация схемы для плагина — все поля опциональны.
 */
export type ConfigScheme = Partial<DefaultSchemeConfig>;
