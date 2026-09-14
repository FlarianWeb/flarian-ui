export const uiShadow = {
	xs: 'xs',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
} as const;

export type UiShadow = (typeof uiShadow)[keyof typeof uiShadow];
