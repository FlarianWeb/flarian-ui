/**
 * @name typedObjectEntries
 * - Типобезопасный аналог Object.entries()
 * - Сохраняет точные типы ключей и значений объекта.
 */
export const typedObjectEntries = <T extends Record<string, unknown>>(obj: T) =>
	Object.entries(obj) as {
		[K in keyof T]: [K, T[K]];
	}[keyof T][];
