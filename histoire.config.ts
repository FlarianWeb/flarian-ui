import { HstVue } from '@histoire/plugin-vue';
import { defineConfig } from 'histoire';

import { groups } from './groups.config';

export default defineConfig({
	plugins: [HstVue()],

	setupFile: '/histoire/setup/index.ts',

	defaultStoryProps: {
		autoPropsDisabled: true,
	},

	backgroundPresets: [],

	theme: {
		title: 'Flarian UI',
		favicon: 'favicon.ico',
		logo: {
			square: './histoire/assets/LogoSquare.svg',
			light: './histoire/assets/LogoLight.svg',
			dark: './histoire/assets/LogoDark.svg',
		},
		colors: {
			primary: {
				50: '#f0fff0',
				100: '#ccf2cc',
				200: '#99e699',
				300: '#66d966',
				400: '#33cc33',
				500: '#2eb82e',
				600: '#29a329',
				700: '#248e24',
				800: '#1a661a',
				900: '#123d12',
			},
			gray: {
				50: '#ffffff',
				100: '#f2f2f2',
				200: '#d8d8d8',
				300: '#bebebe',
				400: '#a4a4a4',
				500: '#8a8a8a',
				600: '#525252',
				700: '#363636',
				750: '#2b2b2b',
				800: '#222222',
				850: '#1b1b1b',
				900: '#161616',
				950: '#131313',
			},
		},
	},

	tree: {
		groups: groups.map(({ id, title }) => ({ id, title })),
	},
});
