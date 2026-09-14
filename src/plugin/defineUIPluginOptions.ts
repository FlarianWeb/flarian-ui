import type { ConfigSurface } from '../config/surface';
import type { ConfigTheme } from '../config/themes';

import type { UIPluginOptions } from './types';

/**
 * Идентити-обёртка для вывода generic из литерала (паттерн `defineConfig` у Vite/Nuxt).
 *
 * `satisfies UIPluginOptions` использует дефолтный generic (`Record<string, ConfigTheme>`) —
 * `theme.default`/`surface.default` не сужаются до ключей вашего `list` в том же
 * объекте, `keyof T` там — просто `string`. Вызов функции, в отличие от `satisfies`,
 * даёт TypeScript вывести `T`/`S` из аргумента.
 *
 * Возвращаемый тип намеренно расширен обратно до дефолтного `UIPluginOptions` —
 * сама литерально-узкая `T`/`S` нужна только для проверки `default` на этапе
 * вызова этой функции. Верни она `UIPluginOptions<T, S>`, результат перестал
 * бы принимать `uiPlugin()`/`uiPlugin(histoireConfig)`: `keyof T` делает
 * generic инвариантным, а `UIPluginOptions<T>` (T ⊂ `Record<string, ConfigTheme>`)
 * не подходит под параметр `uiPlugin(options?: UIPluginOptions)`.
 *
 * Только type-only импорты — ноль рантайм-зависимостей, безопасен для импорта
 * из любого контекста (Node-конфиг бандлера, браузерный код).
 *
 * @example
 * export default defineUIPluginOptions({
 * 	theme: { list: { ocean: { base: '#0ea5e9' } }, default: 'ocean' }, // 'forest' — ошибка типов
 * });
 */
export const defineUIPluginOptions = <
	/**
	 * Дефолты всех четырёх дженериков — `Record<never, …>`
	 * (а не `Record<string, …>`): отсутствующая секция должна давать
	 * ПУСТОЙ вклад в допустимые имена `default`. С `Record<string, …>`
	 * `keyof` секции — `string`, и сужение `default` растворяется:
	 * без `list` не включилась бы ветка «встроенные + extend»
	 * (см. `ThemeDefaultName`), без `extend` — ветка ключей `list`.
	 */
	T extends Record<string, ConfigTheme> = Record<never, ConfigTheme>,
	S extends Record<string, ConfigSurface> = Record<never, ConfigSurface>,
	TE extends Record<string, ConfigTheme> = Record<never, ConfigTheme>,
	SE extends Record<string, ConfigSurface> = Record<never, ConfigSurface>,
>(
	options: UIPluginOptions<T, S, TE, SE>
): UIPluginOptions => options as unknown as UIPluginOptions;
