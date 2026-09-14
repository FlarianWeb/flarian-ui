import type { ResolvedUIConfig } from '../config/resolveUIConfig';

/**
 * PACKAGE_NAME для Rolldown's self-reference rewriting.
 * Имя пакета собирается динамически, а не хранится строковым литералом.
 * Rolldown при сборке библиотеки переписывает все строковые вхождения собственного имени пакета.
 */
const PACKAGE_NAME = ['@flarian', 'ui'].join('/');

/**
 * Целевой режим генерации inject-модуля.
 *
 * `vite-dev` — CSS через виртуальные модули, спрайт inline (DOM-инъекция):
 * кеширование в dev неважно, а dev-middleware зависел бы от порядка чужих
 * middleware (histoire ломал его).
 * `vite-build` — CSS через виртуальные модули, спрайт через эмитнутый asset
 * (`import.meta.ROLLUP_FILE_URL_<refId>`).
 * `inline` — бандлеры без rollup-пайплайна (webpack, rspack, esbuild): CSS строкой
 * через `provideStyle`, спрайт XML-строкой через `provideSprite({ inline })`.
 */
export type InjectTarget =
	| { css: string; mode: 'inline'; sprite: string }
	| { mode: 'vite-build'; spriteRefId: string }
	| { mode: 'vite-dev'; sprite: string };

/**
 * Генерирует JS-код модуля `@flarian/ui/inject`, которым плагин подменяет
 * статичный `dist/flarian-ui.inject.js`.
 * Код передаёт resolved-конфиг в runtime store и подключает CSS + спрайт
 * способом, соответствующим целевому бандлеру.
 *
 * Принимает готовый {@link ResolvedUIConfig} — сам ничего не мержит:
 * резолвинг всех зон централизован в `resolveUIConfig`.
 */
export const generateInject = (resolved: ResolvedUIConfig, target: InjectTarget): string => {
	const { theme, surface, scheme, componentsRuntime, a11y, storagePrefix } = resolved;

	const runtimeConfig = {
		theme: {
			attribute: theme.attribute,
			list: Object.keys(theme.list),
			default: theme.default,
		},
		surface: {
			attribute: surface.attribute,
			list: Object.keys(surface.list),
			default: surface.default,
		},
		scheme,
		components: componentsRuntime,
		a11y,
		storagePrefix,
	};

	const lines: string[] = [];

	if (target.mode === 'inline') {
		lines.push(
			`import { provideConfig, provideSprite, provideStyle } from '${PACKAGE_NAME}/runtime';`,
			'',
			`provideConfig(${JSON.stringify(runtimeConfig)});`,
			`provideStyle(${JSON.stringify(target.css)});`,
			`provideSprite({ inline: ${JSON.stringify(target.sprite)} });`
		);

		return lines.join('\n');
	}

	lines.push(
		`import '${PACKAGE_NAME}/styles';`,
		"import '\\0flarian-ui-theme.css';",
		"import '\\0flarian-ui-surface.css';",
		"import '\\0flarian-ui-colors.css';",
		"import '\\0flarian-ui-tokens.css';",
		`import { provideConfig, provideSprite } from '${PACKAGE_NAME}/runtime';`,
		'',
		`provideConfig(${JSON.stringify(runtimeConfig)});`
	);

	if (target.mode === 'vite-dev') {
		lines.push(`provideSprite({ inline: ${JSON.stringify(target.sprite)} });`);
	} else {
		lines.push(`provideSprite({ url: import.meta.ROLLUP_FILE_URL_${target.spriteRefId} });`);
	}

	return lines.join('\n');
};
