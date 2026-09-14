export const uiDuration = {
	fast: 'fast',
	normal: 'normal',
	slow: 'slow',
} as const;

export type UiDuration = (typeof uiDuration)[keyof typeof uiDuration];
