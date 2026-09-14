/**
 * Цветовая ось компонентов: base — цвет активной темы, neutral — нейтральная
 * emphasis-поверхность (второстепенные действия), остальные — статусные цвета.
 */
export const uiColor = {
	base: 'base',
	neutral: 'neutral',
	success: 'success',
	warning: 'warning',
	error: 'error',
	info: 'info',
} as const;

export type UiColor = (typeof uiColor)[keyof typeof uiColor];
