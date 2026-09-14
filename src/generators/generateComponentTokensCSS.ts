import type { ConfigComponents } from '../config/components/types';
import { camelToKebab } from '../utils';

import { wrapLayer } from './wrapLayer';

/**
 * Рекурсивный обход дерева токенов: путь ключей механически превращается
 * в имя переменной (`button` + `height` + `md` → `--ui-button-height-md`).
 * Листья — строки; вложенность произвольная (шаговые и скалярные токены).
 */
const walk = (prefix: string, node: unknown, vars: string[]): void => {
	if (node === null || node === undefined) {
		return;
	}

	if (typeof node === 'object') {
		for (const [key, value] of Object.entries(node)) {
			walk(`${prefix}-${camelToKebab(key)}`, value, vars);
		}

		return;
	}

	vars.push(`\t${prefix}: ${String(node)};`);
};

/**
 * Генерирует CSS-переменные токенов компонентов, скоупя каждый компонент
 * на его стабильный корневой класс `.ui-<component>` (а не в `:root`):
 * `:root` потребителя растёт O(1) от числа компонентов, а переменные
 * наследуются только внутрь поддерева компонента — читают их исключительно
 * pcss самого компонента, поведение идентично `:root`-эмиссии.
 *
 * Diff-эмиссия: на вход идёт **только пользовательский** конфиг (не мёрж
 * с дефолтами, см. `resolveUIConfig.componentTokensDiff`) — дефолты токенов
 * живут fallback'ами в pcss компонентов, поэтому zero-config не эмитит
 * ни одной переменной.
 *
 * Стабильный класс `.ui-<component>` — публичный контракт: компонент всегда
 * рендерит его на корне рядом с хэшированным классом CSS-модуля.
 *
 * Соглашение об именах (`--ui-<component>-<путь-ключа>`) — контракт между
 * типами `<Component>Tokens` и pcss; проверяется контракт-спекой компонента.
 */
export const generateComponentTokensCSS = (component: ConfigComponents | undefined): string => {
	const blocks: string[] = [];

	/** Не у каждого компонента есть `tokens` (Icon — только `props`) — сужаем структурно. */
	const entries = Object.entries(component ?? {}) as [string, undefined | { tokens?: unknown }][];

	for (const [name, config] of entries) {
		const kebab = camelToKebab(name);
		const vars: string[] = [];

		walk(`--ui-${kebab}`, config?.tokens, vars);

		if (vars.length > 0) {
			blocks.push(`.ui-${kebab} {\n${vars.join('\n')}\n}`);
		}
	}

	if (blocks.length === 0) {
		return '';
	}

	return wrapLayer(blocks.join('\n\n'));
};
