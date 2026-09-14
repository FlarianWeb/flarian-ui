/**
 * @name typedObjectValues
 * - Типобезопасный аналог Object.values()
 * - Сохраняет точные типы значений объекта.
 */
export const typedObjectValues = <T extends Record<string, unknown>>(obj: T): T[keyof T][] =>
	Object.values(obj) as T[keyof T][];
