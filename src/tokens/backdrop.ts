export const uiBackdrop = {
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

export type UiBackdrop = (typeof uiBackdrop)[keyof typeof uiBackdrop];
