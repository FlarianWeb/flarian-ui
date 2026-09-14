import type { ColorScale, DefaultSurfaceConfig, StatusColors } from './types';

const defaultScale = {
	50: '#fafafa',
	100: '#f5f5f5',
	200: '#e5e5e5',
	300: '#d4d4d4',
	400: '#a3a3a3',
	500: '#737373',
	600: '#525252',
	700: '#404040',
	800: '#262626',
	900: '#171717',
	950: '#0a0a0a',
} satisfies ColorScale;

const defaultStatusColors = {
	error: '#ef4444',
	warning: '#f59e0b',
	success: '#22c55e',
	info: '#3b82f6',
} satisfies StatusColors;

export const defaultSurfaceConfig = {
	attribute: 'data-surface',
	list: {
		base: {
			...defaultScale,
			status: defaultStatusColors,
		},
	},
	default: 'base',
	dts: 'src/generated/flarian-surface-registry.d.ts',
} satisfies DefaultSurfaceConfig;
