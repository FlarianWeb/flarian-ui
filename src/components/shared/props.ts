/**
 * Общие оси размеров.
 */
export const uiSize = {
	xs: 'xs',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
} as const;
export type UiSize = (typeof uiSize)[keyof typeof uiSize];
