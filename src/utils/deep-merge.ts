/**
 * Рекурсивно мержит `override` поверх `base`.
 * Значения из `override` выигрывают; ключи, которых нет в `base`,
 * **добавляются** в результат (на этом держится добавление новых
 * тем/поверхностей через `extend`). `undefined`-значения пропускаются.
 * Ничего не удаляет — для замены списка целиком см. `list`-семантику
 * в `resolveThemeConfig`/`resolveSurfaceConfig`.
 */
export const deepMerge = <T extends object>(base: T, override: null | object | undefined): T => {
	if (!override) {
		return { ...base };
	}

	const result = { ...base } as Record<string, unknown>;

	for (const [key, val] of Object.entries(override)) {
		if (val === undefined) {
			continue;
		}

		const baseVal = result[key];

		if (
			typeof val === 'object' &&
			val !== null &&
			!Array.isArray(val) &&
			typeof baseVal === 'object' &&
			baseVal !== null &&
			!Array.isArray(baseVal)
		) {
			result[key] = deepMerge(baseVal as object, val as object);
		} else {
			result[key] = val;
		}
	}

	return result as T;
};

export default deepMerge;
