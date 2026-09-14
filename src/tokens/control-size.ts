export const uiControlSize = {
	xs: 'xs',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
} as const;

export type UiControlSize = (typeof uiControlSize)[keyof typeof uiControlSize];
