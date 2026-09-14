import type { DeepPartial } from '~/types/deep-partial';
import type { Exact } from '~/types/exact';

import type { defaultSurfaceConfig } from './defaults';

/**
 * 11 ступеней перцептивной шкалы цветов.
 * 50 = почти белый, 950 = почти чёрный.
 */
export type ColorScaleStep =
	'50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950';

/**
 * Полная цветовая шкала — CSS color значения для каждой ступени.
 */
export type ColorScale = Record<ColorScaleStep, string>;

/**
 * Функциональные цвета состояний — не зависят от активной темы/поверхности.
 * Могут быть частично переопределены per-surface.
 */
export type StatusColors = {
	/**
	 * Цвет ошибки.
	 */
	error: string;

	/**
	 * Цвет предупреждения.
	 */
	warning: string;

	/**
	 * Цвет успеха.
	 */
	success: string;

	/**
	 * Информационный цвет.
	 */
	info: string;
};

/**
 * Конфигурация именованной поверхности — частичное переопределение шкалы
 * и/или статусных цветов. Недостающие ступени/ключи наследуются от
 * `list[default]` через CSS-каскад (см. `generateSurfaceCSS`), а не JS-merge —
 * `[data-surface='x']` и `:root` целятся в один элемент с одинаковой
 * специфичностью, `:root` объявлен первым.
 *
 * @example
 * // Тёплая поверхность — только часть ступеней:
 * { '500': '#a08968' }
 *
 * @example
 * // Со своими статусными цветами:
 * { status: { error: '#e53e3e' } }
 */
export type ConfigSurface = Partial<ColorScale> & {
	status?: Partial<StatusColors>;
};

/**
 * Resolved конфигурация блока `surface` плагина.
 * Дженерик `T` позволяет TypeScript выводить допустимые ключи поверхностей —
 * `default` будет ограничен ключами объекта `list`.
 */
export type DefaultSurfaceConfig<
	T extends Record<string, ConfigSurface> = Record<string, ConfigSurface>,
> = {
	/**
	 * HTML-атрибут на `<html>` для управления активной поверхностью.
	 * @default 'data-surface'
	 */
	attribute: string;

	/**
	 * Именованные поверхности. Каждый ключ генерирует `[attribute='name']` в CSS.
	 * Всегда содержит минимум `default` — без шкалы дизайн-система не может
	 * работать.
	 */
	list: T;

	/**
	 * Поверхность по умолчанию — ключ из `list`.
	 * В отличие от `theme.default` не может быть `null`: всегда указывает на
	 * валидный ключ, её значения дублируются в `:root` как fallback.
	 * @default 'default'
	 */
	default: keyof T & string;

	/**
	 * Путь для генерации module augmentation `RegistrySurface` — сужает
	 * `UiSurface` (и, соответственно, `surface.value` из `useSurface()`,
	 * параметр `setSurface()`) до реальных ключей `list`. Не влияет на
	 * CSS/рантайм-конфиг — только codegen.
	 * @default 'src/generated/flarian-surface-registry.d.ts'
	 */
	dts: string;
};

/**
 * Допустимые имена для `default`: при переданном `list` — его ключи плюс
 * ключи `extend`; без `list` — встроенные поверхности плюс ключи `extend`.
 *
 * В точке использования аргументы обёрнуты в `NoInfer`: без этого TypeScript
 * выводит `T`/`E` обратным ходом из самого значения `default` (литерал `'x'`
 * через `keyof T` даёт `T = { x: … }`) — и любое имя легализует само себя.
 */
type SurfaceDefaultName<
	T extends Record<string, ConfigSurface>,
	E extends Record<string, ConfigSurface>,
> = ([keyof T] extends [never]
	? keyof E | keyof typeof defaultSurfaceConfig.list
	: keyof E | keyof T) &
	string;

/**
 * Входная конфигурация блока `surface` плагина — все поля опциональны.
 * `list` принимает частичные `ConfigSurface` объекты для уже существующих
 * ключей (домержатся к `defaultSurfaceConfig.list.default`) либо полные —
 * для новых именованных поверхностей.
 *
 * Две семантики списка:
 * - `list` — **замена целиком**: зашитая `base`-поверхность удаляется;
 * - `extend` — **дополнение**: мержится поверх встроенных (или поверх `list`),
 *   ничего не удаляя.
 */
export type ConfigSurfaces<
	T extends Record<string, ConfigSurface> = Record<never, ConfigSurface>,
	E extends Record<string, ConfigSurface> = Record<never, ConfigSurface>,
> = {
	/**
	 * `Exact` — иначе generic-инференс `T` не ловит лишние поля сверх
	 * `ConfigSurface` (constraint-проверка структурная, не fresh-literal).
	 */
	list?: { [K in keyof T]: Exact<T[K], ConfigSurface> };

	/**
	 * Дополнение списка поверхностей — добавить, не переописывая встроенные.
	 */
	extend?: { [K in keyof E]: Exact<E[K], ConfigSurface> };

	default?: SurfaceDefaultName<NoInfer<T>, NoInfer<E>>;
} & Omit<DeepPartial<DefaultSurfaceConfig<T>>, 'default' | 'list'>;
