import type { DeepPartial } from '~/types/deep-partial';
import type { Exact } from '~/types/exact';

import type { defaultThemeConfig } from './defaults';

/**
 * Поведение контрастного цвета поверх base:
 * `'auto'` — по светлоте base при сборке, `'scheme'` — инверсия по схеме,
 * строка — фиксированное CSS color значение.
 */
export type OnBaseBehavior = 'auto' | 'scheme' | (string & {});

/**
 * Конфигурация именованной темы.
 * Минимум — один цвет `base`. Остальное опционально.
 *
 * @example
 * // Базовая тема:
 * { base: '#22c55e' }
 *
 * @example
 * // Жёлтая тема с фиксированным тёмным текстом поверх base:
 * {
 *   base: '#facc15',
 *   onBase: '#1f1f1f',
 * }
 */
export type ConfigTheme = {
	/**
	 * Базовый цвет темы — CSS color значение.
	 * Автоматически вычисляются hover, active, muted варианты через color-mix().
	 */
	base: string;

	/**
	 * Поведение контрастного цвета поверх `base` (`--ui-theme-on-base`).
	 *
	 * - `'auto'` — вычисляется при сборке по светлоте `base` (белый или чёрный).
	 *   Работает для hex и rgb(); прочие форматы откатываются к `'scheme'`.
	 * - `'scheme'` — следует схеме: светлый текст в light, тёмный в dark
	 *   (fallback на `--ui-color-on-emphasis`).
	 * - CSS-цвет строкой — фиксированное значение.
	 *
	 * Не задано — берётся `onBase` уровня зоны `theme` (дефолт `'auto'`).
	 */
	onBase?: OnBaseBehavior;
};

/**
 * Resolved конфигурация блока `theme` плагина.
 * Дженерик `T` позволяет TypeScript выводить допустимые ключи тем —
 * `default` будет ограничен ключами объекта `list`.
 *
 * Нейтральная шкала и статусные цвета сюда не входят — они в отдельной,
 * независимой зоне `surface` (см. `config/surface`), чтобы переопределение
 * акцента одной темы не перекрашивало фон/текст всего приложения.
 */
export type DefaultThemeConfig<
	T extends Record<string, ConfigTheme> = Record<string, ConfigTheme>,
> = {
	/**
	 * HTML-атрибут на `<html>` для управления активной темой.
	 * @default 'data-theme'
	 */
	attribute: string;

	/**
	 * Именованные темы. Каждый ключ генерирует `[attribute='name']` в CSS.
	 */
	list: T;

	/**
	 * Тема по умолчанию — ключ из `list`.
	 * `null` — атрибут не устанавливается при старте.
	 * @default null
	 */
	default: (keyof T & string) | null;

	/**
	 * Дефолтное поведение `--ui-theme-on-base` для всех тем.
	 * Переопределяется per-theme через `ConfigTheme.onBase`.
	 * @default 'auto'
	 */
	onBase: OnBaseBehavior;

	/**
	 * Путь для генерации module augmentation `RegistryTheme` — сужает `UiTheme`
	 * (и, соответственно, `theme.value` из `useTheme()`, параметр `setTheme()`)
	 * до реальных ключей `list`. Не влияет на CSS/рантайм-конфиг — только codegen.
	 * @default 'src/generated/flarian-theme-registry.d.ts'
	 */
	dts: string;
};

/**
 * Допустимые имена для `default`: при переданном `list` — его ключи плюс
 * ключи `extend`; без `list` — встроенные темы плюс ключи `extend`.
 */
type ThemeDefaultName<
	T extends Record<string, ConfigTheme>,
	E extends Record<string, ConfigTheme>,
> = ([keyof T] extends [never]
	? keyof E | keyof typeof defaultThemeConfig.list
	: keyof E | keyof T) &
	string;

/**
 * Входная конфигурация блока `theme` плагина — все поля опциональны.
 */
export type ConfigThemes<
	T extends Record<string, ConfigTheme> = Record<never, ConfigTheme>,
	E extends Record<string, ConfigTheme> = Record<never, ConfigTheme>,
> = {
	/**
	 * Список тем: переопределяется поверх встроенных.
	 *
	 * `Exact` — иначе generic-инференс `T` не ловит лишние поля сверх
	 * `ConfigTheme` (constraint-проверка структурная, не fresh-literal).
	 */
	list?: { [K in keyof T]: Exact<T[K], ConfigTheme> };

	/**
	 * Дополнение списка тем: мержится поверх встроенных (или поверх `list`, если он тоже передан).
	 */
	extend?: { [K in keyof E]: Exact<E[K], ConfigTheme> };

	/**
	 * Имя темы по умолчанию.
	 */
	default?: null | ThemeDefaultName<NoInfer<T>, NoInfer<E>>;
} & Omit<DeepPartial<DefaultThemeConfig<T>>, 'default' | 'list'>;
