/**
 * @name typedObjectKeys
 * - Типобезопасный аналог Object.keys()
 * - Сохраняет точные типы ключей объекта.
 */
export const typedObjectKeys = <T extends Record<string, unknown>>(obj: T) =>
	Object.keys(obj) as (keyof T)[];
