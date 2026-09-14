export const uiSpace = {
	none: 'none',
	px: 'px',
	xs: 'xs',
	sm: 'sm',
	md: 'md',
	lg: 'lg',
	xl: 'xl',
} as const;

export type UiSpace = (typeof uiSpace)[keyof typeof uiSpace];
