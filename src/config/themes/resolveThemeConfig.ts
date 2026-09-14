import { deepMerge } from '../../utils';

import { defaultThemeConfig } from './defaults';
import type { ConfigTheme, ConfigThemes, DefaultThemeConfig } from './types';

/**
 * Резолвит зону `theme`. `attribute`/`onBase`/`dts` — обычный deepMerge.
 *
 * `list` — **replace, не merge**: если потребитель передал список тем, зашитая
 * `base`-тема заменяется целиком и не остаётся «хвостом» в CSS/списке имён
 * (`deepMerge` только добавляет/перезаписывает ключи, никогда не удаляет).
 *
 * `extend` — **дополнение**: мержится поверх встроенного списка (или поверх
 * `list`, если он передан), ничего не удаляя. Способ добавить тему,
 * не переописывая встроенные.
 *
 * `default` не передан (или передан `undefined` — например через
 * `cond ? 'x' : undefined`):
 * - при переданном `list` — берётся первый ключ итогового списка (порядок
 *   строковых ключей объекта детерминирован спецификацией ECMAScript как
 *   порядок вставки);
 * - иначе — остаётся встроенный default (при `extend` он всё ещё валиден).
 * Явный `default: null` уважается — потребитель осознанно хочет «без темы»,
 * даже имея непустой список.
 */
export const resolveThemeConfig = <
	T extends Record<string, ConfigTheme>,
	E extends Record<string, ConfigTheme>,
>(
	options?: ConfigThemes<T, E>
): DefaultThemeConfig => {
	const { list, extend, ...rest } = options ?? {};

	const merged = deepMerge(defaultThemeConfig, rest) as unknown as DefaultThemeConfig;

	const baseList: Record<string, ConfigTheme> = list ?? defaultThemeConfig.list;
	const resolvedList = extend ? deepMerge(baseList, extend) : baseList;

	if (!list) {
		return { ...merged, list: resolvedList };
	}

	const firstKey = Object.keys(resolvedList)[0] as string | undefined;

	return {
		...merged,
		list: resolvedList,
		default: options?.default !== undefined ? options.default : (firstKey ?? null),
	};
};
