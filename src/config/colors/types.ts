import type { ConfigSchemes } from '~/config/scheme';
import type { DeepPartial } from '~/types/deep-partial';

/**
 * Цветовые токены схемы — меняются при переключении dark/light.
 *
 * Каждый ключ генерирует CSS-переменную `--ui-color-{key}` на элементе со схемой.
 *
 * `Extra`-варианты — усиленная версия базового токена.
 */
export type SchemeColors = {
	/**
	 * Основной фоновый цвет поверхностей.
	 *
	 * `--ui-color-bg`
	 */
	bg: string;

	/**
	 * Основной цвет текста и иконок.
	 *
	 * `--ui-color-fg`
	 */
	fg: string;

	/**
	 * Цвет базовой темы
	 *
	 * `--ui-color-base`
	 */
	base: string;

	/**
	 * Цвет границ и разделителей.
	 *
	 * `--ui-color-border`
	 */
	border: string;

	/**
	 * Цвет интерактивных элементов (чекбоксы, переключатели в покое).
	 *
	 * `--ui-color-element`
	 */
	element: string;

	/**
	 * Цвет тени
	 *
	 * `--ui-color-shadow`
	 */
	shadow: string;

	/**
	 * Дополнительный фоновый цвет — чуть светлее/темнее основного.
	 *
	 * `--ui-color-bg-extra`
	 */
	// bgExtra: string; // TODO: Пока не используется

	/**
	 * Дополнительный фоновый цвет — светлее/темнее основного.
	 *
	 * `--ui-color-bg-muted`
	 */
	// bgMuted: string; // TODO: Пока не используется

	/**
	 * Дополнительный цвет текста — чуть менее контрастный.
	 *
	 * `--ui-color-fg-extra`
	 */
	// fgExtra: string; // TODO: Пока не используется

	/**
	 * Дополнительный цвет текста — менее контрастный.
	 *
	 * `--ui-color-fg-muted`
	 */
	// fgMuted: string; // TODO: Пока не используется

	/**
	 * Цвет вспомогательного текста (подписи, плейсхолдеры).
	 *
	 * `--ui-color-caption`
	 */
	// caption: string; // TODO: Пока не используется

	/**
	 * Более насыщенный вариант вспомогательного текста.
	 *
	 * `--ui-color-caption-extra`
	 */
	// captionExtra: string; // TODO: Пока не используется

	/**
	 * Цвет границ и разделителей.
	 *
	 * `--ui-color-border`
	 */
	// border: string; // TODO: Пока не используется

	/**
	 * Более заметный вариант границ.
	 *
	 * `--ui-color-border-extra`
	 */
	// borderExtra: string; // TODO: Пока не используется

	/**
	 * Менее заметный вариант границ.
	 *
	 * `--ui-color-border-muted`
	 */
	// borderMuted: string; // TODO: Пока не используется

	/**
	 * Цвет фона контейнеров (карточки, попапы).
	 *
	 * `--ui-color-box`
	 */
	// box: string; // TODO: Пока не используется

	/**
	 * Более непрозрачный вариант фона контейнеров.
	 *
	 * `--ui-color-box-extra`
	 */
	// boxExtra: string; // TODO: Пока не используется

	/**
	 * Более заметный вариант интерактивных элементов.
	 *
	 * `--ui-color-element-extra`
	 */
	// elementExtra: string; // TODO: Пока не используется

	/**
	 * Цвет бликов и световых акцентов.
	 *
	 * `--ui-color-glare`
	 */
	// glare: string; // TODO: Пока не используется

	/**
	 * Цвет акцентных поверхностей (бейджи, теги, выделения).
	 *
	 * `--ui-color-emphasis`
	 */
	// emphasis: string; // TODO: Пока не используется

	/**
	 * Цвет текста поверх `emphasis`.
	 *
	 * `--ui-color-on-emphasis`
	 */
	// onEmphasis: string; // TODO: Пока не используется

	/**
	 * Контрастный цвет контента поверх `base` (текст на solid-кнопках и т.п.).
	 * Резолвит `--ui-theme-on-base` (поведение задаёт `theme.onBase`)
	 * с откатом на схемный `--ui-color-on-emphasis`.
	 *
	 * `--ui-color-on-base`
	 */
	// onBase: string; // TODO: Пока не используется

	/**
	 * Минимальная тень — тонкий контур для приподнятых элементов.
	 *
	 * `--ui-shadow-xs`
	 */
	// shadowXs: string; // TODO: Пока не используется

	/**
	 * Малая тень — для карточек и дропдаунов.
	 *
	 * `--ui-shadow-sm`
	 */
	// shadowSm: string; // TODO: Пока не используется
};

/**
 * Конфигурация цветовых токенов для схемы.
 */
type SchemeColorsConfig = Record<ConfigSchemes, SchemeColors>;

/**
 * Конфигурация цветовых токенов.
 *
 * Содержит два вида цветов:
 * - `dark` / `light` — схем-зависимые токены (→ `--ui-color-*` на `[data-scheme]`)
 * - `black` / `white` — абсолютные схем-независимые цвета (→ `--ui-color-black`, `--ui-color-white`)
 *
 * @example
 * colors: {
 * 	dark: {
 * 		bg: 'oklch(20% 0 0)',
 * 	},
 * 	black: '#0a0a0a',
 * }
 */
export type DefaultColorsConfig = {
	/**
	 * Абсолютный чёрный цвет.
	 *
	 * `--ui-color-black`
	 * @default '#000000'
	 */
	black: string;

	/**
	 * Абсолютный белый цвет.
	 *
	 * `--ui-color-white`
	 * @default '#ffffff'
	 */
	white: string;
} & SchemeColorsConfig;

/**
 * Входная конфигурация цветов для плагина — все поля опциональны.
 */
export type ConfigColors = DeepPartial<DefaultColorsConfig>;
