import type { UiComponentClasses, UiComponentCx } from '~/components/shared/classes';
import type { UiSize } from '~/components/shared/props';
import type { UiButtonVariant, UiIcon } from '~/registry';
import type { UiColor, UiRadius } from '~/tokens';

/**
 * Нативный атрибут `type` кнопки.
 */
export const buttonType = {
	button: 'button',
	submit: 'submit',
	reset: 'reset',
} as const;
export type ButtonType = (typeof buttonType)[keyof typeof buttonType];

/**
 * Направление элементов button
 */
export const buttonDirection = {
	row: 'row',
	column: 'column',
} as const;
export type ButtonDirection = (typeof buttonDirection)[keyof typeof buttonDirection];

/**
 * Визуальные варианты кнопки.
 * - Расширение списка вариантов: `registerVariants('button', { promo: styles.promo })`
 * - Module augmentation `RegistryButtonVariant`
 */
export const buttonVariant = {
	solid: 'solid',
	outlined: 'outlined',
	soft: 'soft',
	ghost: 'ghost',
	link: 'link',
} as const;
export type ButtonVariant = (typeof buttonVariant)[keyof typeof buttonVariant] | UiButtonVariant;

/**
 * ButtonSlot - Слоты стилизации (Styles API)
 * - Определяет доступные слоты для стилизации компонента
 */
export type ButtonSlot = 'icon' | 'iconSlot' | 'labelSlot' | 'root' | 'spinner' | 'trailingSlot';

/**
 * ButtonClasses - Карта внешних классов.
 * - Используется внешним потребителем для стилизации слотов
 */
export type ButtonClasses = UiComponentClasses<ButtonSlot>;

/**
 * ButtonCx - Приватная карта классов.
 * - Обязательства компонента для стилизации слотов
 */
export type ButtonCx = UiComponentCx<'button', ButtonSlot>;

/**
 * Button props.
 */
export type ButtonProps = {
	/**
	 * Нативный `type`. По умолчанию `'button'`: нативный дефолт `<button>` —
	 * `submit`, внутри `<form>` любой клик отправлял бы форму.
	 */
	type?: ButtonType;

	/**
	 * Направление элементов
	 */
	direction?: ButtonDirection;

	/**
	 * Визуальный вариант кнопки.
	 */
	variant?: ButtonVariant;

	/**
	 * Цветовая ось: цвет темы, нейтральный или статусный.
	 */
	color?: UiColor;

	/**
	 * Размер кнопки.
	 */
	size?: UiSize;

	/**
	 * Радиус скругления кнопки.
	 */
	radius?: UiRadius;

	/**
	 * Показывает спиннер вместо левой иконки и гасит активацию.
	 * Не использует нативный `disabled`: кнопка остаётся в tab-order,
	 * скринридер объявляет состояние через `aria-busy`/`aria-disabled`.
	 */
	loading?: boolean;

	/**
	 * Отключённое состояние (нативный `disabled`).
	 */
	disabled?: boolean;

	/**
	 * Текст кнопки — альтернатива дефолтному слоту.
	 */
	label?: string;

	/**
	 * Иконка слева — альтернатива слоту `icon`.
	 */
	icon?: UiIcon;

	/**
	 * Переопределение CSS-классов по внутренним слотам (Styles API).
	 */
	classes?: ButtonClasses;
};
