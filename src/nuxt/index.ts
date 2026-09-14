import { addPluginTemplate, addVitePlugin, defineNuxtModule } from '@nuxt/kit';
import type { Nuxt, NuxtModule } from '@nuxt/schema';

import { resolveUIConfig } from '~/config/resolveUIConfig';
import { generateFoucScript } from '~/generators/generateFoucScript';
import { uiPlugin } from '~/plugin';
import type { UIPluginOptions } from '~/plugin/types';

const module: NuxtModule<UIPluginOptions> = defineNuxtModule<UIPluginOptions>({
	meta: {
		name: '@flarian/ui',
		configKey: 'flarianUI',
	},
	defaults: {},
	setup(options: UIPluginOptions, nuxt: Nuxt) {
		addVitePlugin(() => uiPlugin(options));

		addPluginTemplate({
			filename: 'flarian-ui.mjs',
			getContents: () =>
				[
					"import { defineNuxtPlugin } from '#app'",
					"import { flarianUI } from '@flarian/ui'",
					'export default defineNuxtPlugin(nuxtApp => nuxtApp.vueApp.use(flarianUI))',
				].join('\n'),
		});

		/**
		 * Анти-FOUC: применяет схему и тему до первой отрисовки.
		 * Тот же скрипт, что vite-плагин вставляет через transformIndexHtml,
		 * но в Nuxt HTML собирается через app.head — вставляем сами.
		 * `foucScript: false` отключает вставку (MF: скрипт вставляет только host).
		 */
		if (options.foucScript !== false) {
			nuxt.options.app.head.script ??= [];
			nuxt.options.app.head.script.unshift({
				innerHTML: generateFoucScript(resolveUIConfig(options)),
			});
		}
	},
});

export default module;
