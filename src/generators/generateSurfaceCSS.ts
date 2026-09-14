import type {
	ColorScaleStep,
	ConfigSurface,
	DefaultSurfaceConfig,
	StatusColors,
} from '../config/surface/types';

import { pickOnColor } from './onBaseColor';
import { wrapLayer } from './wrapLayer';

const scaleVars = (scale: Partial<Record<ColorScaleStep, string>>): string[] =>
	Object.entries(scale).map(([step, value]) => `\t--ui-surface-${step}: ${value};`);

/**
 * `--ui-color-*` — общий неймспейс двух генераторов: `generateColorsCSS`
 * владеет схем-зависимой семантикой (bg/fg/border…), `generateSurfaceCSS` —
 * статусными цветами и их on-вариантами. Ownership — per-переменная;
 * пересечение имён запрещено (см. `isReservedColorKey`, используется
 * `generateColorsCSS` как guard от коллизий).
 *
 * `satisfies Record<keyof StatusColors, true>` — если `StatusColors`
 * прирастёт полем, объект ниже обязан обновиться вместе с ним (иначе
 * не скомпилируется), поэтому список реально исчерпывающий, а не
 * скопированный руками список строк.
 */
const RESERVED_STATUS_KEYS = {
	error: true,
	warning: true,
	success: true,
	info: true,
} satisfies Record<keyof StatusColors, true>;

/**
 * On-варианты статусных цветов (`--ui-color-on-error`, …) — та же
 * резервация, что и у самих статусов, но для ключей вида `onError`.
 */
const RESERVED_ON_STATUS_KEYS = {
	onError: true,
	onWarning: true,
	onSuccess: true,
	onInfo: true,
} satisfies Record<`on${Capitalize<keyof StatusColors>}`, true>;

/**
 * `true`, если `key` (camelCase, как в `SchemeColors`) зарезервирован под
 * статусные цвета поверхности — `generateColorsCSS` не должен эмитить
 * переменную с таким именем.
 */
export const isReservedColorKey = (key: string): boolean =>
	key in RESERVED_STATUS_KEYS || key in RESERVED_ON_STATUS_KEYS;

/**
 * Статусные цвета + их on-цвета (`--ui-color-on-error`, …).
 * On-цвет всегда вычисляется автоматически по светлоте: статусные цвета —
 * фиксированные значения дизайн-системы, ручное поведение им не нужно.
 * Непарсибельный формат — переменная не эмитится, семантика откатится
 * к `--ui-color-on-emphasis` через fallback-цепочку в компонентах.
 */
const statusVars = (status: Partial<Record<string, string>>): string[] =>
	Object.entries(status).flatMap(([key, value]) => {
		if (!value) {
			return [];
		}

		const on = pickOnColor(value);

		return [
			`\t--ui-color-${key}: ${value};`,
			...(on ? [`\t--ui-color-on-${key}: var(--ui-color-${on});`] : []),
		];
	});

const entryVars = (entry: ConfigSurface): string[] => {
	const { status, ...scale } = entry;

	return [...scaleVars(scale), ...(status ? statusVars(status) : [])];
};

/**
 * Генерирует CSS для виртуального модуля поверхности.
 * `:root` — резолвленная `list[default]`, работает как fallback без атрибута
 * и до применения JS (анти-FOUC). `[data-surface='name']` — блок на каждую
 * именованную поверхность, включая `default` (дублирует `:root`).
 *
 * Частичные записи (не все ступени/статусы) не дозаполняются в JS —
 * недостающие переменные наследуются от `:root` через CSS-каскад: оба
 * селектора целятся в один элемент с одинаковой специфичностью, `:root`
 * объявлен первым, поэтому непереопределённое свойство остаётся в силе.
 */
export const generateSurfaceCSS = (config: DefaultSurfaceConfig): string => {
	const parts: string[] = [];
	const defaultEntry = config.list[config.default];

	parts.push(`:root {\n${entryVars(defaultEntry).join('\n')}\n}`);

	for (const [name, entry] of Object.entries(config.list)) {
		parts.push(`[${config.attribute}='${name}'] {\n${entryVars(entry).join('\n')}\n}`);
	}

	return wrapLayer(parts.join('\n\n'));
};
