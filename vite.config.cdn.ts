import path from 'node:path';

import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import { defineConfig } from 'vite';
import pugPlugin from 'vite-plugin-pug';

import { cssModules, postcssPlugins } from './postcss.shared';

/**
 * Сборка CDN iife-бандла — запускается после основной сборки (`emptyOutDir: false`).
 *
 * Отличия от ESM-сборки:
 * - `@flarian/ui/inject` заменён заглушкой: стили и спрайт CDN-пользователь
 *   подключает вручную (`<link>` + `FlarianUI.provideSprite`)
 * - Vue — external, берётся из глобального `Vue`
 * - Экспортируется также runtime-API (`provideConfig`, `provideSprite`, …)
 */
export default defineConfig({
	resolve: {
		alias: {
			'@flarian/ui/styles': path.resolve(__dirname, 'src/assets/styles/main.css'),
			'@flarian/ui/inject': path.resolve(__dirname, 'src/cdn/inject-noop.ts'),
			'@flarian/ui/runtime': path.resolve(__dirname, 'src/runtime/index.ts'),
			'@flarian/ui': path.resolve(__dirname, 'src/index.ts'),
			'@/': `${path.resolve(__dirname)}/`,
			'~/': `${path.resolve(__dirname, 'src')}/`,
		},
	},

	plugins: [
		vue(),
		pugPlugin({}),
		AutoImport({
			imports: ['vue'],
			dts: false,
			vueTemplate: true,
		}),
	],

	css: {
		postcss: {
			plugins: postcssPlugins,
		},
		modules: cssModules,
	},

	build: {
		emptyOutDir: false,
		lib: {
			entry: 'src/cdn/index.ts',
			name: 'FlarianUI',
			formats: ['iife'],
			fileName: () => 'flarian-ui.iife.js',
			cssFileName: 'flarian-ui.iife',
		},
		rollupOptions: {
			external: ['vue'],
			output: {
				globals: {
					vue: 'Vue',
				},
			},
		},
	},
});
