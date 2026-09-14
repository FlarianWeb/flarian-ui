export const uiFontSize = {
	xs: 'xs',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
} as const;

export type UiFontSize = (typeof uiFontSize)[keyof typeof uiFontSize];
