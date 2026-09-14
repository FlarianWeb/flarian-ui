import type { DefaultThemeConfig } from './types';

export const defaultThemeConfig = {
	attribute: 'data-theme',
	list: {
		base: { base: '#2eb82e' },
	},
	default: 'base',
	onBase: 'auto',
	dts: 'src/generated/flarian-theme-registry.d.ts',
} satisfies DefaultThemeConfig;
