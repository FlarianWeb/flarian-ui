import { camelToKebab } from '~/utils';

type ContractDataToken = {
	[key: string]: ContractDataToken | number | string;
};

/**
 * Подготавливает CSS к сканированию: удаляет блочные комментарии и схлопывает все пробельные символы в один пробел.
 */
const normalizeCss = (css: string): string =>
	css
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/\s+/g, ' ')
		.trim();

/**
 * Рекурсивно разворачивает дерево токенов в плоский список пар `[css-переменная, строковое значение]`.
 */
const flattenTokens = (
	node: ContractDataToken | number | string,
	prefix: string
): Array<[string, string]> => {
	if (typeof node !== 'object' || node === null) {
		return [[prefix, String(node)]];
	}

	return Object.entries(node).flatMap(([key, value]) =>
		flattenTokens(value, `${prefix}-${camelToKebab(key)}`)
	);
};

/**
 * Находит все вызовы `var(<prefix>-*, fallback)` в CSS (включая вложенные) и возвращает карту:
 * - `имя переменной → список уникальных fallback-ов`.
 *
 * Использует скобочный баланс, поэтому корректно обрабатывает вложенные `var()` и `color-mix()`.
 */
const parseCssVars = (css: string, prefix: string): Map<string, string[]> => {
	const usages = new Map<string, string[]>();

	for (let from = css.indexOf('var('); from !== -1; from = css.indexOf('var(', from + 1)) {
		const start = from + 'var('.length;
		let depth = 1;
		let splitAt = -1;
		let end = -1;

		for (let i = start; i < css.length; i++) {
			const char = css[i];

			if (char === '(') {
				depth++;
			} else if (char === ')') {
				depth--;

				if (depth === 0) {
					end = i;

					break;
				}
			} else if (char === ',' && depth === 1 && splitAt === -1) {
				splitAt = i;
			}
		}

		if (end === -1) {
			break;
		}

		const name = css.slice(start, splitAt === -1 ? end : splitAt).trim();

		if (!name.startsWith(`${prefix}-`)) {
			continue;
		}

		const fallback =
			splitAt === -1
				? ''
				: css
						.slice(splitAt + 1, end)
						.replace(/\s+/g, ' ')
						.trim();

		const list = usages.get(name) ?? [];

		if (!list.includes(fallback)) {
			list.push(fallback);
		}

		usages.set(name, list);
	}

	return usages;
};

/**
 * Готовит данные для контракт-тестов CSS-токенов компонента.
 *
 * @param pcssSource Сырой текст pcss-модуля (обычно через `?raw`)
 * @param tokens Дерево токенов из конфига компонента (например `buttonDefaults.tokens`)
 * @param prefix Префикс CSS-переменных без завершающего дефиса (например `'--ui-button'`)
 *
 * @returns Объект с двумя картами:
 * - `configTokens` - ожидаемые токены из TS-конфига
 * - `pcssUsages` - реально прочитанные `var()` из pcss
 */
export const prepareContractData = (
	pcssSource: string,
	tokens: ContractDataToken,
	prefix: string
) => {
	const pcss = normalizeCss(pcssSource);
	const configTokens = new Map(flattenTokens(tokens, prefix));
	const pcssUsages = parseCssVars(pcss, prefix);

	return { configTokens, pcssUsages };
};
