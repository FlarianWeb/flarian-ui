import {
	type ConfigSchemes,
	configSchemes,
	type DefaultSchemeConfig,
} from '../config/scheme/types';
import { camelToKebab, typedObjectValues } from '../utils';

import { isReservedColorKey } from './generateSurfaceCSS';
import { wrapLayer } from './wrapLayer';

/**
 * key-agnostic контракт генератора: любой набор цветовых токенов на схему.
 */
type ColorTokens = Record<string, string>;
type ColorsInput = Record<ConfigSchemes, ColorTokens> & { black: string; white: string };

/** Единственный источник имени переменной: `bg` → `--ui-color-bg`. */
const colorVar = (key: string, value: string): string =>
	`\t--ui-color-${camelToKebab(key)}: ${value};`;

const block = (selector: string, lines: string[]): string =>
	`${selector} {\n${lines.join('\n')}\n}`;

/**
 * `--ui-color-*` — общий неймспейс с `generateSurfaceCSS` (статусные цвета
 * и их on-варианты). Коллизия имён здесь не может произойти через типизированный
 * конфиг (`SchemeColors` не содержит статусных полей), но генератор — узкое
 * место для любого пути построения `colors` (нетипизированный JS-конфиг,
 * будущее расширение `SchemeColors`) — падаем сразу и явно, а не тихой
 * перезаписью CSS-переменной поверхности.
 */
export const generateColorsCSS = (
	colors: ColorsInput,
	schemeConfig: Pick<DefaultSchemeConfig, 'attribute' | 'dark' | 'light'>
): string => {
	const parts: string[] = [
		block(':root', [colorVar('black', colors.black), colorVar('white', colors.white)]),
	];

	for (const scheme of typedObjectValues(configSchemes)) {
		const tokens = Object.entries(colors[scheme]);
		const reservedKeys = tokens.map(([key]) => key).filter(isReservedColorKey);

		if (reservedKeys.length > 0) {
			throw new Error(
				`[flarian-ui] colors.${scheme} использует зарезервированные для surface имена: ${reservedKeys.join(', ')}. Статусные цвета (error/warning/success/info) и их on-варианты настраиваются через surface.list[...].status, а не через colors.`
			);
		}

		const selector = `[${schemeConfig.attribute}='${schemeConfig[scheme]}']`;

		parts.push(
			block(
				selector,
				tokens.map(([key, value]) => colorVar(key, value))
			)
		);

		const opaque = tokens
			.filter(([, value]) => value.includes('transparent'))
			.map(([key, value]) =>
				colorVar(key, value.replaceAll('transparent', 'var(--ui-color-bg)'))
			);

		if (opaque.length > 0) {
			parts.push(block(`[no-transparency]${selector}`, opaque));
		}
	}

	return wrapLayer(parts.join('\n\n'));
};
