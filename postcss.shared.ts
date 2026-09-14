import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AcceptedPlugin, Plugin } from 'postcss';
import postcssNested from 'postcss-nested';
import type { CSSModulesOptions } from 'vite';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = `${path.sep}src${path.sep}`;
const CSS_SCOPED_HASH_LENGTH = 5;

/**
 * Имя scoped-класса — публичный контракт: читаемое и стабильное.
 */
const generateScopedName = (local: string, filename: string): string => {
	const file = filename.replace(/\?.*$/, '');
	const component = path.basename(path.dirname(file)).toLowerCase();
	const hash = createHash('sha256')
		.update(`${path.relative(ROOT, file)}:${local}`)
		.digest('base64url')
		.slice(0, CSS_SCOPED_HASH_LENGTH);

	return `ui-${component}-${local}-${hash}`;
};

/**
 * Оборачивает CSS исходников пакета (всё под `src/`) в `@layer flarian-ui`.
 */
const uiLayerPlugin = (): Plugin => ({
	postcssPlugin: 'flarian-ui:layer',

	OnceExit(root, { AtRule }) {
		const file = root.source?.input.file;

		if (!file || !file.includes(SRC_DIR) || root.nodes.length === 0) {
			return;
		}

		/** уже обёрнуто — например, руками в компоненте */
		if (
			root.nodes.length === 1 &&
			root.first?.type === 'atrule' &&
			root.first.name === 'layer'
		) {
			return;
		}

		const layer = new AtRule({
			name: 'layer',
			params: 'flarian-ui',
			raws: { afterName: ' ', between: ' ', after: '\n' },
		});

		const nodes = root.nodes.slice();

		root.removeAll();
		layer.append(nodes);
		root.append(layer);
	},
});

/**
 * Общий PostCSS-пайплайн пакета (vite.config + vite.config.cdn)
 */
export const postcssPlugins: AcceptedPlugin[] = [postcssNested(), uiLayerPlugin()];

/**
 * Общая конфигурация CSS-модулей для сборки и в CDN.
 */
export const cssModules: CSSModulesOptions = {
	localsConvention: 'camelCase',
	generateScopedName,
};
