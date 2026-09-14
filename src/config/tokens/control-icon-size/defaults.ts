import type { DefaultControlIconSizeConfig } from './types';

/**
 * Иконка = font-size + 2px (продолжение той же арифметики шага, что и в
 * `control-font-size`) — на ступень крупнее текста, чтобы не выглядеть
 * "сломанной" на фоне строки. `control-line-height` считается как
 * iconSize/fontSize на каждой ступени, чтобы line-height текста был
 * численно равен высоте иконки (инвариант константной высоты кнопки).
 *
 * TODO: числа — первая обоснованная прикидка, финальная подгонка —
 * визуально на Button/Icon при рефакторинге.
 */
export const defaultControlIconSizeConfig = {
	xs: '0.875rem',
	sm: '1rem',
	md: '1.125rem',
	lg: '1.25rem',
	xl: '1.375rem',
} satisfies DefaultControlIconSizeConfig;
