import { defineUIPluginOptions } from '../../src/plugin/defineUIPluginOptions';

export const histoireConfig = defineUIPluginOptions({
	theme: {
		dts: 'histoire/generated/theme-registry.d.ts',
		list: {
			green: { base: '#2eb82e' },
			red: { base: '#dc2626' },
			rose: { base: '#f0305a' },
			orange: { base: '#ff9933' },
			yellow: { base: '#facc15' },
			blue: { base: '#3b82f6' },
			purple: { base: '#9933ff' },
		},
		default: 'green',
	},
	surface: {
		dts: 'histoire/generated/surface-registry.d.ts',
		list: {
			base: {
				50: '#ffffff',
				100: '#f5f5f5',
				200: '#ebebeb',
				300: '#d4d4d4',
				400: '#a3a3a3',
				500: '#737373',
				600: '#525252',
				700: '#3d3d3d',
				800: '#282828',
				900: '#1f1f1f',
				950: '#141414',
				status: {
					error: '#dc2626',
					warning: '#ff9933',
					success: '#22c55e',
					info: '#3b82f6',
				},
			},
		},
		default: 'base',
	},
	scheme: {
		default: 'auto',
	},
	icons: {
		dts: 'histoire/generated/icons-registry.d.ts',
		constants: 'histoire/generated/icons.ts',
		sets: [{ namespace: 'test', dir: './histoire/icons/test' }],
	},
});
