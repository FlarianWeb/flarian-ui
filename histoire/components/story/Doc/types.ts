export type Props = {
	/**
	 * Название миксина
	 */
	name: string;

	/**
	 * Когда использовать миксин
	 */
	when?: string;

	/**
	 * Зависимости миксина
	 */
	deps?: string[];
};
