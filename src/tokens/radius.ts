export const uiRadius = {
	none: 'none',
	xxs: 'xxs',
	xs: 'xs',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
	xxl: 'xxl',
	full: 'full',
} as const;

export type UiRadius = (typeof uiRadius)[keyof typeof uiRadius];
