/**
 * Рекурсивно делает все поля объекта опциональными.
 * Используется для типизации пользовательских overrides в опциях плагина.
 */
export type DeepPartial<T> = {
	[K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
