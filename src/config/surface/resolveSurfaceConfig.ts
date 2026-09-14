import { deepMerge } from '../../utils';

import { defaultSurfaceConfig } from './defaults';
import type { ConfigSurface, ConfigSurfaces, DefaultSurfaceConfig } from './types';

/**
 * Резолвит опции `surface` в полный конфиг. Нужен вместо голого `deepMerge`
 * ради `list`: merge оставил бы зашитую `base` поверхность «хвостом» поверх
 * пользовательского списка, поэтому `list` **заменяется целиком**, а `default`
 * (если не передан) берётся из первого ключа итогового списка.
 *
 * `extend` — **дополнение**: мержится поверх встроенного списка (или поверх
 * `list`), ничего не удаляя; встроенный `default` при этом остаётся валиден.
 *
 * Пустой `list: {}` игнорируется (остаётся зашитая шкала): у поверхности
 * `default` обязан указывать на валидный ключ `list` — `:root`-fallback
 * в `generateSurfaceCSS` строится из `list[default]`, и пустой список
 * молча сгенерировал бы CSS из `undefined`.
 *
 * Запись под `default` должна быть полной шкалой (`ColorScale` + `status`),
 * иначе `:root` fallback в `generateSurfaceCSS` унаследует дыры; остальные
 * записи могут быть частичными.
 */
export const resolveSurfaceConfig = <
	T extends Record<string, ConfigSurface>,
	E extends Record<string, ConfigSurface>,
>(
	options?: ConfigSurfaces<T, E>
): DefaultSurfaceConfig => {
	const { list, extend, ...rest } = options ?? {};

	const merged = deepMerge(defaultSurfaceConfig, rest) as unknown as DefaultSurfaceConfig;

	const hasList = !!list && Object.keys(list).length > 0;
	const baseList: Record<string, ConfigSurface> = hasList ? list : defaultSurfaceConfig.list;
	const resolvedList = extend ? deepMerge(baseList, extend) : baseList;

	if (!hasList) {
		return { ...merged, list: resolvedList };
	}

	const firstKey = Object.keys(resolvedList)[0];

	return {
		...merged,
		list: resolvedList,
		default: options?.default ?? firstKey,
	};
};
