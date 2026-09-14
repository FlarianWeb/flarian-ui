import type { DeepPartial } from '~/types/deep-partial';

/**
 * Конфигурация типографики.
 * Каждый ключ генерирует CSS-переменную в camelCase без префикса.
 */
export type DefaultTypographyConfig = {
	/**
	 * CSS font-family.
	 *
	 * `--ui-font-family`
	 * @default 'inter, sans-serif'
	 */
	fontFamily: string;

	/**
	 * Базовый размер шрифта (эквивалент 1rem).
	 *
	 * `--ui-font-size`
	 * @default '16px'
	 */
	fontSize: string;

	/**
	 * Базовое начертание шрифта.
	 *
	 * `--ui-font-weight`
	 * @default 'var(--ui-font-weight-regular)'
	 */
	fontWeight: string;

	/**
	 * Базовый межстрочный интервал.
	 *
	 * `--ui-line-height`
	 * @default '1.5em'
	 */
	lineHeight: string;

	/**
	 * Базовый отступ между символами по горизонтали.
	 *
	 * `--ui-letter-spacing`
	 * @default '0em'
	 */
	letterSpacing: string;

	/**
	 * Вертикальный отступ между абзацами.
	 *
	 * `--ui-paragraph-spacing`
	 * @default '1rem'
	 */
	paragraphSpacing: string;
};

/**
 * Входная конфигурация типографики для плагина — все поля опциональны.
 */
export type ConfigTypography = DeepPartial<DefaultTypographyConfig>;
