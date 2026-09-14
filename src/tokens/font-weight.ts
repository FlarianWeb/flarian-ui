export const uiFontWeight = {
	hairline: 'hairline',
	thin: 'thin',
	light: 'light',
	regular: 'regular',
	medium: 'medium',
	semibold: 'semibold',
	bold: 'bold',
	heavy: 'heavy',
	black: 'black',
} as const;

export type UiFontWeight = (typeof uiFontWeight)[keyof typeof uiFontWeight];
