import { arrayOfAll, camelToKebab } from '~/utils';

import type { ButtonProps } from './types';

/**
 * Размерная сетка токенов кнопок.
 */
type ButtonSize = NonNullable<ButtonProps['size']>;

/**
 * CSS-токены компонента `Button`.
 *
 * Размерные сетки:
 * - type: `Record<ButtonSize, string>`
 * - CSS: `--ui-<component>-<token>-<size>`
 *
 * Статичные токены:
 * - type: `string`
 * - CSS `--ui-<component>-<token>`
 */
export type ButtonTokens = {
	/**
	 * Семейство шрифта.
	 *
	 * CSS: `--ui-button-font-family`
	 */
	fontFamily: string;

	/**
	 * Насыщенность шрифта — единая для всех размеров.
	 *
	 * CSS: `--ui-button-font-weight`
	 */
	fontWeight: string;

	/**
	 * Толщина бордюра
	 *
	 * CSS: `--ui-button-border-size`
	 */
	borderSize: string;

	/**
	 * Стиль бордюра
	 *
	 * CSS: `--ui-button-border-style`
	 */
	borderStyle: string;

	/**
	 * Сила hover-сдвига, единая для всех вариантов, чем больше тем заметнее.
	 *
	 * CSS: `--ui-button-hover-mix`
	 */
	hoverMix: string;

	/**
	 * Сила active-сдвига, единая для всех вариантов, чем больше тем заметнее.
	 *
	 * CSS: `--ui-button-active-mix`
	 */
	// activeMix: string;

	/**
	 * Размер шрифта и иконок.
	 *
	 * CSS: `--ui-button-font-size-<size>`
	 */
	fontSize: Record<ButtonSize, string>;

	/**
	 * Размер иконки по размерам.
	 *
	 * CSS: `--ui-button-icon-size-<size>`
	 */
	iconSize: Record<ButtonSize, string>;

	/**
	 * Высота строки по размерам — вместе с `paddingY` задаёт высоту кнопки
	 * (`2×paddingY + lineHeight + 2px границы`).
	 *
	 * CSS: `--ui-button-line-height-<size>`
	 */
	lineHeight: Record<ButtonSize, string>;

	/**
	 * Горизонтальные отступы.
	 *
	 * CSS: `--ui-button-padding-x-<size>`
	 */
	paddingX: Record<ButtonSize, string>;

	/**
	 * Вертикальные отступы.
	 *
	 * CSS: `--ui-button-padding-y-<size>`
	 */
	paddingY: Record<ButtonSize, string>;

	/**
	 * Горизонтальные отступы между элементами кнопки.
	 *
	 * CSS: `--ui-button-gap-x-<size>`
	 */
	gapX: Record<ButtonSize, string>;

	/**
	 * Вертикальные отступы между элементами кнопки.
	 *
	 * CSS: `--ui-button-gap-y-<size>`
	 */
	gapY: Record<ButtonSize, string>;

	/**
	 * Отступ вокруг слота иконки.
	 *
	 * CSS: `--ui-button-icon-padding`
	 */
	// iconPadding: string;

	/**
	 * Цвет focus-ring (по умолчанию — полупрозрачный цвет оси `color`).
	 *
	 * CSS: `--ui-button-focus-ring-color`
	 */
	// focusRingColor: string;

	/**
	 * Стиль focus-ring (`solid`, `dashed`, …).
	 *
	 * CSS: `--ui-button-focus-ring-style`
	 */
	// focusRingStyle: string;

	/**
	 * Толщина focus-ring.
	 *
	 * CSS: `--ui-button-focus-ring-width`
	 */
	// focusRingWidth: string;

	/**
	 * Отступ focus-ring от кнопки.
	 *
	 * CSS: `--ui-button-focus-ring-offset`
	 */
	// focusRingOffset: string;
};

/**
 * Если `ButtonTokens` прирастёт полем, TS откажется собираться, пока этот
 * список не поправят: `buttonInstanceVars` не может незаметно отстать
 * от реального контракта токенов.
 */
const tokenKeys = arrayOfAll<keyof ButtonTokens>()([
	/** Scalar */
	'fontFamily',
	'fontWeight',
	'borderSize',
	'borderStyle',
	'hoverMix',
	// 'activeMix',

	// 'iconPadding',
	// 'focusRingColor',
	// 'focusRingStyle',
	// 'focusRingWidth',
	// 'focusRingOffset',

	/** Sized */
	'fontSize',
	'iconSize',
	'lineHeight',
	'paddingX',
	'paddingY',
	'gapX',
	'gapY',
]);

/**
 * Глобальные оси, перехват которых не является токеном компонента.
 * Необходимо для отслеживания наличия токенов UI-KIT.
 */
const axisOnlyInstanceKeys = ['radius', 'color', 'onColor', 'hoverColor'];

/**
 * Публичные instance-переменные кнопки (Styles API).
 *
 * UI-KIT их **никогда не объявляет** — их отсутствие означает «работает ось».
 * Заданная переменная (через `style`, класс на кнопке или родителе)
 * перебивает значение соответствующей оси и конфиг-токенов целиком.
 */
export const buttonInstanceVars = [...tokenKeys, ...axisOnlyInstanceKeys].map(
	key => `--ui-button-${camelToKebab(key)}`
);
