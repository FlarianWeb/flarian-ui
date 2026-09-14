import { cpSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import type { Plugin, PluginOption } from 'vite';
import pugPlugin from 'vite-plugin-pug';
import { defineConfig } from 'vitest/config';

import { histoireConfig } from './histoire/setup/config';
import { cssModules, postcssPlugins } from './postcss.shared';
import { defaultColorsConfig } from './src/config/colors';
import { defaultMotionConfig } from './src/config/motion';
import { defaultSchemeConfig } from './src/config/scheme';
import { defaultSurfaceConfig } from './src/config/surface';
import { defaultThemeConfig } from './src/config/themes';
import { defaultTokensConfig } from './src/config/tokens';
import { defaultTypographyConfig } from './src/config/typography';
import { generateColorsCSS } from './src/generators/generateColorsCSS';
import { buildIcons, wrapSprite } from './src/generators/generateIcons';
import { generateSurfaceCSS } from './src/generators/generateSurfaceCSS';
import { generateThemeCSS } from './src/generators/generateThemeCSS';
import { generateTokensCSS } from './src/generators/generateTokensCSS';
import { uiPlugin } from './src/plugin';

/**
 * Генерирует no-plugin артефакты в dist после сборки библиотеки:
 * - `theme.css` — дефолтные темы/цвета/токены (те же генераторы, что в плагине)
 * - `flarian-ui.sprite.svg` — статичный спрайт встроенных иконок
 * - `flarian-ui.inject.js` — дефолтный inject-модуль (выполняется у потребителя без плагина)
 * - `assets/icons/ui/` — копия исходных SVG для сборки кастомных спрайтов плагином
 * - `fonts/` + `@font-face` в `styles.css` — self-hosted Inter (см. ниже)
 */
const distArtifactsPlugin = (): Plugin => ({
	name: 'flarian-ui:dist-artifacts',
	apply: 'build',

	/**
	 * Вырезает `@import './fonts.css'` из `main.css` ДО того, как его увидит бандлер — сам импорт нужен только в dev/serve.
	 */
	transform: {
		order: 'pre',
		handler(code, id) {
			if (id.endsWith('assets/styles/main.css')) {
				return code.replace(/@import\s+['"]\.\/fonts\.css['"];\s*\n*/, '');
			}
		},
	},

	closeBundle() {
		const dist = path.resolve(__dirname, 'dist');
		const iconsDir = path.resolve(__dirname, 'src/assets/icons/ui');

		const themeCSS = [
			generateThemeCSS(defaultThemeConfig),
			generateSurfaceCSS(defaultSurfaceConfig),
			generateColorsCSS(defaultColorsConfig, defaultSchemeConfig),
			generateTokensCSS(defaultTokensConfig, defaultTypographyConfig, defaultMotionConfig),
		].join('\n\n');

		writeFileSync(path.resolve(dist, 'theme.css'), themeCSS);

		const { symbols } = buildIcons(iconsDir, 'ui');

		writeFileSync(path.resolve(dist, 'flarian-ui.sprite.svg'), wrapSprite(symbols));

		cpSync(iconsDir, path.resolve(dist, 'assets/icons/ui'), { recursive: true });

		/**
		 * `@font-face` дописывается в уже собранный `styles.css` в обход графа модулей Vite.
		 */
		const fontsCSS = readFileSync(
			path.resolve(__dirname, 'src/assets/styles/fonts.css'),
			'utf-8'
		).replaceAll('../fonts/', './fonts/');

		cpSync(path.resolve(__dirname, 'src/assets/fonts'), path.resolve(dist, 'fonts'), {
			recursive: true,
		});

		writeFileSync(
			path.resolve(dist, 'styles.css'),
			`${readFileSync(path.resolve(dist, 'styles.css'), 'utf-8')}\n\n${fontsCSS}`
		);

		const inject = [
			'// Дефолтный inject-модуль — выполняется у потребителя без плагина.',
			'// С плагином содержимое подменяется сгенерированным кодом (см. @flarian/ui/vite).',
			"import './styles.css';",
			"import './theme.css';",
			"import { provideSprite } from './runtime.es.js';",
			'',
			"provideSprite({ url: new URL('./flarian-ui.sprite.svg', import.meta.url).href });",
			'',
		].join('\n');

		writeFileSync(path.resolve(dist, 'flarian-ui.inject.js'), inject);
	},
});

/**
 * `histoire build` тоже запускает `vite build` — отличаем его от библиотечной
 * сборки по env-флагу (ставится в npm-скрипте `story:build`). Histoire-режиму
 * нужен uiPlugin (переменные, спрайт, конфиг), библиотечной сборке — dist-артефакты.
 */
const isHistoireBuild = !!process.env.HISTOIRE;

export default defineConfig(({ command }) => ({
	resolve: {
		alias: {
			'@flarian/ui/styles': path.resolve(__dirname, 'src/assets/styles/main.css'),
			'@flarian/ui/inject': path.resolve(__dirname, 'src/flarian-ui.inject.ts'),
			'@flarian/ui/runtime': path.resolve(__dirname, 'src/runtime/index.ts'),
			'@flarian/ui': path.resolve(__dirname, 'src/index.ts'),
			'@/': `${path.resolve(__dirname)}/`,
			'~/': `${path.resolve(__dirname, 'src')}/`,
		},
	},

	plugins: [
		...(command === 'serve' || isHistoireBuild
			? [
					uiPlugin(histoireConfig),
					Components({
						dirs: ['histoire/components'],
						extensions: ['vue'],
						directoryAsNamespace: true,
						dts: 'histoire/generated/components.d.ts',
					}),
				]
			: [distArtifactsPlugin()]),
		vue(),
		pugPlugin({}),
		AutoImport({
			imports: ['vue'],
			dts: 'src/generated/auto-imports.d.ts',
			vueTemplate: true,
		}),
	] as PluginOption[],

	css: {
		postcss: {
			plugins: postcssPlugins,
		},
		modules: cssModules,
	},

	build: {
		lib: {
			entry: {
				index: 'src/index.ts',
				runtime: 'src/runtime/index.ts',
				vite: 'src/plugin/vite.ts',
				rollup: 'src/plugin/rollup.ts',
				webpack: 'src/plugin/webpack.ts',
				rspack: 'src/plugin/rspack.ts',
				esbuild: 'src/plugin/esbuild.ts',
				nuxt: 'src/nuxt/index.ts',
			},
			name: 'FlarianUI',
			fileName: (format, entryName) => `${entryName}.${format}.js`,
			cssFileName: 'styles',
			formats: ['es'],
		},
		rollupOptions: {
			/**
			 * Гасим шум histoire build: его клиентский код проверяет опциональные
			 * экспорты setup-модулей через optional chaining (`f?.setupVue3`) —
			 * rolldown статически репортит IMPORT_IS_UNDEFINED, в рантайме есть guard.
			 */
			onwarn(warning, warn) {
				if (
					warning.code === 'IMPORT_IS_UNDEFINED' &&
					String(warning.message).includes('histoire')
				) {
					return;
				}

				warn(warning);
			},
			external: [
				'vue',
				'vite',
				'unplugin',
				'@flarian/ui/inject',
				/^node:.*/,
				/^vite\/.*/,
				/^@nuxt\/.*/,
				/^#.*/,
			],
			output: {
				globals: {
					vue: 'Vue',
				},
				exports: 'named',
				preserveModules: false,
				preserveModulesRoot: 'src',
			},
		},
	},

	test: {
		globals: true,
		environment: 'jsdom',
		include: ['src/**/*.{test,spec}.ts'],
		css: {
			include: [/\?raw$/],
		},
		typecheck: {
			checker: 'vue-tsc',
			include: ['src/**/*.{test,spec}.ts'],
		},
		coverage: {
			reporter: ['text', 'html', 'cobertura'],
			exclude: [
				'node_modules/',
				'dist/',
				'**/*.d.ts',
				'**/types.ts',
				'**/*.story.vue',
				'histoire.config.ts',
				'vite.config.ts',
				'groups.config.ts',
				'src/generated/',
				'src/nuxt/',
				'src/app/',
				'src/types/',
				'src/tokens/',
				'src/registry/',
				'src/cdn/',
				'src/flarian-ui.inject.ts',
			],
		},
	},
}));
