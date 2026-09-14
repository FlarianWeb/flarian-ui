import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createUnplugin, type UnpluginFactory, type UnpluginOptions } from 'unplugin';
import type { ResolvedConfig } from 'vite';

import { type ResolvedUIConfig, resolveUIConfig } from '../config/resolveUIConfig';
import { generateColorsCSS } from '../generators/generateColorsCSS';
import { generateComponentTokensCSS } from '../generators/generateComponentTokensCSS';
import { generateFoucScript } from '../generators/generateFoucScript';
import {
	buildIcons,
	wrapSprite,
	writeIconAugmentation,
	writeIconConstants,
	writeIconTypes,
} from '../generators/generateIcons';
import { generateInject } from '../generators/generateInject';
import { writeRegistryAugmentation } from '../generators/generateRegistry';
import { generateSurfaceCSS } from '../generators/generateSurfaceCSS';
import { generateThemeCSS } from '../generators/generateThemeCSS';
import { generateTokensCSS } from '../generators/generateTokensCSS';

import { defineUIPluginOptions } from './defineUIPluginOptions';
import type { IconSetConfig, UIPluginOptions } from './types';

export { defineUIPluginOptions };

/**
 * Публичный резолвер конфига — нужен потребителям, вставляющим анти-FOUC
 * скрипт вручную: `generateFoucScript(resolveUIConfig(options))`.
 */
export { resolveUIConfig };
export type { ResolvedUIConfig };

export type { IconSetConfig, UIPluginOptions };

/**
 * PACKAGE_NAME для Rolldown's self-reference rewriting.
 * Имя пакета собирается динамически, а не хранится строковым литералом.
 * Rolldown при сборке библиотеки переписывает все строковые вхождения собственного имени пакета
 * Если написать '@flarian/ui' сгенерированный augmentation-файл у потребителя получит невалидный `declare module '.'`
 */
const PACKAGE_NAME = ['@flarian', 'ui'].join('/');

/**
 * Абсолютный путь к встроенным SVG-иконкам пакета.
 * Определяется относительно самого файла плагина, а не `config.root` потребителя.
 * Кандидаты покрывают три контекста запуска:
 * - `dist/vite.es.js` (опубликованный пакет) → `dist/assets/icons/ui` (копируются при сборке)
 * - `src/plugin/index.ts` (vitest, vite-node) → `src/assets/icons/ui`
 * - бандл vite.config в корне пакета (histoire dev) → `src/assets/icons/ui`
 */
const _pluginDir = path.dirname(fileURLToPath(import.meta.url));
const _builtinDirCandidates = [
	path.resolve(_pluginDir, './assets/icons/ui'),
	path.resolve(_pluginDir, '../assets/icons/ui'),
	path.resolve(_pluginDir, './src/assets/icons/ui'),
];
/**
 * `?? _builtinDirCandidates[0]` — fallback на случай, если НИ ОДИН кандидат
 * не существует (сломанная установка пакета). Вычисляется на этапе импорта
 * модуля — до того, как тест успел бы что-то замокать (`vi.spyOn` работает
 * только после импорта) — ветка принципиально непокрываема unit-тестом
 * без подмены модуля целиком (`vi.doMock` + `vi.resetModules` + динамический
 * импорт), несоразмерная цена ради оборонительного edge-case.
 */
/* v8 ignore next 2 */
const BUILTIN_DIR =
	_builtinDirCandidates.find(dir => fs.existsSync(dir)) ?? _builtinDirCandidates[0];

/**
 * Идентификаторы модуля инъекции `@flarian/ui/inject`.
 * Плагин перехватывает bare-импорт и резолвит его в виртуальный id;
 * если импорт уже отрезолвлен в реальный файл (alias, exports) —
 * подменяет содержимое по уникальному имени файла в `load`.
 */
const INJECT_ID = `${PACKAGE_NAME}/inject`;
const RESOLVED_INJECT = 'virtual:flarian-ui-inject';
const INJECT_FILE_MARKER = 'flarian-ui.inject';

/**
 * Идентификаторы CSS-частей виртуального модуля (только Vite/Rollup-пайплайн).
 * `\0`-префикс сигнализирует что модуль виртуальный и не нужно искать его на диске.
 */
const RESOLVED_THEME = '\0flarian-ui-theme.css';
const RESOLVED_SURFACE = '\0flarian-ui-surface.css';
const RESOLVED_COLORS = '\0flarian-ui-colors.css';
const RESOLVED_TOKENS = '\0flarian-ui-tokens.css';

/**
 * Имена файлов, которые плагин генерирует в проекте потребителя.
 * `AUGMENTATION_FILE` — module augmentation для `RegistryIcon`.
 * `CONSTANTS_FILE` — runtime-константы кастомных иконок (`brandIcon`, `socialIcon`, …).
 * `THEME_AUGMENTATION_FILE`/`SURFACE_AUGMENTATION_FILE` — augmentation для
 * `RegistryTheme`/`RegistrySurface` (сужает `UiTheme`/`UiSurface`).
 */
const AUGMENTATION_FILE = 'flarian-icons-registry.d.ts';
const CONSTANTS_FILE = 'flarian-icons.ts';
const THEME_AUGMENTATION_FILE = 'flarian-theme-registry.d.ts';
const SURFACE_AUGMENTATION_FILE = 'flarian-surface-registry.d.ts';

/**
 * Убирает query-суффикс (`?used`, `?t=...`) из id модуля.
 */
const cleanId = (id: string): string => id.split('?')[0];

/**
 * Однократные предупреждения: промахи путей (иконки, статичный CSS) раньше
 * молча давали пустой спрайт/пропавшие стили — теперь о них сообщается.
 */
const warned = new Set<string>();
const warnOnce = (message: string): void => {
	if (!warned.has(message)) {
		warned.add(message);
		// eslint-disable-next-line no-console -- build-time диагностика плагина
		console.warn(`[flarian-ui] ${message}`);
	}
};

/**
 * unplugin-фабрика — единая реализация для Vite/Rollup/webpack/Rspack/esbuild.
 * Vite и Rollup получают полный пайплайн (виртуальные CSS-модули, спрайт через
 * emitFile в build и inline в dev, HMR). Остальные бандлеры — inline-режим: CSS и спрайт запекаются
 * строками в inject-модуль и монтируются в DOM через runtime store.
 */
export const uiPluginFactory: UnpluginFactory<UIPluginOptions | undefined> = (
	options = {},
	meta
): UnpluginOptions => {
	const isVitePipeline = meta.framework === 'vite' || meta.framework === 'rollup';

	/**
	 * Единый resolved-конфиг для всех путей доставки (виртуальные CSS-модули,
	 * inline-CSS, inject): опции статичны на весь жизненный цикл плагина,
	 * резолвим один раз.
	 */
	const resolved = resolveUIConfig(options);

	let iconsContent = '';
	let builtinDir = '';
	let typesOutput = '';
	let augmentationOutput = '';
	let constantsOutput = '';
	let themeAugmentationOutput = '';
	let surfaceAugmentationOutput = '';
	let projectRoot = '';
	let isBuild = meta.framework !== 'vite';

	const resolveCustomDir = (dir: string): string =>
		path.isAbsolute(dir) ? dir : path.resolve(projectRoot, dir);

	const resolveOutputs = () => {
		builtinDir = BUILTIN_DIR;
		typesOutput = BUILTIN_DIR.startsWith(projectRoot)
			? path.resolve(projectRoot, 'src/generated/icons.ts')
			: '';

		const dts = options.icons?.dts ?? `src/generated/${AUGMENTATION_FILE}`;

		augmentationOutput = path.isAbsolute(dts) ? dts : path.resolve(projectRoot, dts);

		const constants = options.icons?.constants ?? `src/generated/${CONSTANTS_FILE}`;

		constantsOutput = path.isAbsolute(constants)
			? constants
			: path.resolve(projectRoot, constants);

		const themeDts = options.theme?.dts ?? `src/generated/${THEME_AUGMENTATION_FILE}`;

		themeAugmentationOutput = path.isAbsolute(themeDts)
			? themeDts
			: path.resolve(projectRoot, themeDts);

		const surfaceDts = options.surface?.dts ?? `src/generated/${SURFACE_AUGMENTATION_FILE}`;

		surfaceAugmentationOutput = path.isAbsolute(surfaceDts)
			? surfaceDts
			: path.resolve(projectRoot, surfaceDts);
	};

	const rebuild = () => {
		const { symbols: builtinSymbols, ids: builtinIds } = buildIcons(builtinDir, 'ui');

		let allSymbols = builtinSymbols;
		const idsByNamespace: Record<string, string[]> = {};

		for (const { namespace, dir } of options.icons?.sets ?? []) {
			const { symbols, ids } = buildIcons(resolveCustomDir(dir), namespace);

			allSymbols += symbols;
			idsByNamespace[namespace] = ids;
		}

		iconsContent = wrapSprite(allSymbols);

		if (typesOutput) {
			writeIconTypes(builtinIds, typesOutput);
		}

		const allCustomIds = Object.values(idsByNamespace).flat();

		if (allCustomIds.length > 0) {
			writeIconAugmentation(allCustomIds, augmentationOutput, PACKAGE_NAME);
			writeIconConstants(idsByNamespace, constantsOutput);
		}
	};

	/**
	 * В отличие от иконок — пишется безусловно: зашитая `base`-тема/поверхность
	 * есть всегда (zero-config), регистрировать в `RegistryTheme`/`RegistrySurface`
	 * нужно в любом случае, не только при кастомном списке.
	 */
	const writeRegistries = () => {
		writeRegistryAugmentation(
			'RegistryTheme',
			Object.keys(resolved.theme.list),
			themeAugmentationOutput,
			PACKAGE_NAME
		);
		writeRegistryAugmentation(
			'RegistrySurface',
			Object.keys(resolved.surface.list),
			surfaceAugmentationOutput,
			PACKAGE_NAME
		);
	};

	/**
	 * CSS для inline-режима: статичные стили пакета (dist/styles.css лежит рядом
	 * с бандлом плагина) + сгенерированные темы/цвета/токены.
	 */
	const buildInlineCSS = (): string => {
		const staticCssPath = path.resolve(_pluginDir, './styles.css');
		const staticCss = fs.existsSync(staticCssPath)
			? fs.readFileSync(staticCssPath, 'utf-8')
			: '';

		if (!staticCss) {
			warnOnce(
				`Static styles.css not found near the plugin bundle (${staticCssPath}) — component styles will be missing in inline mode.`
			);
		}

		return [
			staticCss,
			generateThemeCSS(resolved.theme),
			generateSurfaceCSS(resolved.surface),
			generateColorsCSS(resolved.colors, resolved.scheme),
			generateTokensCSS(resolved.tokens, resolved.typography, resolved.motion),
			generateComponentTokensCSS(resolved.componentTokensDiff),
		]
			.filter(Boolean)
			.join('\n\n');
	};

	return {
		name: 'flarian-ui',

		buildStart() {
			/**
			 * Явный `options.projectRoot` выигрывает у значения от бандлера:
			 * для rollup/esbuild корень иначе неоткуда взять (fallback —
			 * `process.cwd()`, в монорепо из корня workspace он ошибочен).
			 */
			if (options.projectRoot) {
				projectRoot = path.resolve(options.projectRoot);
			} else if (!projectRoot) {
				projectRoot = process.cwd();
			}

			resolveOutputs();

			if (!fs.existsSync(builtinDir)) {
				warnOnce(
					`Built-in icons not found near the plugin bundle (${builtinDir}) — the sprite will not contain "ui/*" icons.`
				);
			}

			const sets = options.icons?.sets ?? [];
			const seen = new Set<string>();

			for (const { namespace } of sets) {
				if (namespace === 'ui') {
					throw new Error(
						'[flarian-ui] Namespace "ui" is reserved for built-in icons. Use a different name.'
					);
				}
				if (seen.has(namespace)) {
					throw new Error(
						`[flarian-ui] Duplicate namespace "${namespace}" in icons config.`
					);
				}

				seen.add(namespace);
			}

			rebuild();
			writeRegistries();
		},

		resolveId(id) {
			if (id === INJECT_ID) {
				return RESOLVED_INJECT;
			}

			/**
			 * Inject, уже отрезолвленный в реальный файл (alias в этом репозитории,
			 * относительный `./flarian-ui.inject.js` из dist/index.es.js), тоже уводим
			 * в виртуальный модуль. Критично: к реальному файлу применяется
			 * `sideEffects`-whitelist package.json — tree-shaking выкинул бы
			 * сгенерированный код; виртуальный модуль от этого свободен.
			 */
			const clean = cleanId(id);

			if (
				clean.endsWith(`${INJECT_FILE_MARKER}.js`) ||
				clean.endsWith(`${INJECT_FILE_MARKER}.ts`)
			) {
				return RESOLVED_INJECT;
			}

			if (
				isVitePipeline &&
				(id === RESOLVED_THEME ||
					id === RESOLVED_SURFACE ||
					id === RESOLVED_COLORS ||
					id === RESOLVED_TOKENS)
			) {
				return id;
			}
		},

		loadInclude(id) {
			const clean = cleanId(id);

			return (
				id === RESOLVED_INJECT ||
				clean.endsWith(`${INJECT_FILE_MARKER}.js`) ||
				clean.endsWith(`${INJECT_FILE_MARKER}.ts`) ||
				id === RESOLVED_THEME ||
				id === RESOLVED_SURFACE ||
				id === RESOLVED_COLORS ||
				id === RESOLVED_TOKENS
			);
		},

		load(id) {
			const clean = cleanId(id);
			const isInject =
				id === RESOLVED_INJECT ||
				clean.endsWith(`${INJECT_FILE_MARKER}.js`) ||
				clean.endsWith(`${INJECT_FILE_MARKER}.ts`);

			if (isInject) {
				if (!isVitePipeline) {
					return generateInject(resolved, {
						mode: 'inline',
						sprite: iconsContent,
						css: buildInlineCSS(),
					});
				}

				if (isBuild) {
					/**
					 * В типах unplugin emitFile возвращает void (совместимость с webpack),
					 * но в vite/rollup-пайплайне это нативный rollup-контекст — возвращает refId.
					 */
					const emitFile = this.emitFile as unknown as (file: {
						name: string;
						source: string;
						type: 'asset';
					}) => string;

					const refId = emitFile({
						type: 'asset',
						name: 'icon-sprite.svg',
						source: iconsContent,
					});

					return generateInject(resolved, { mode: 'vite-build', spriteRefId: refId });
				}

				return generateInject(resolved, { mode: 'vite-dev', sprite: iconsContent });
			}

			if (!isVitePipeline) {
				return;
			}

			if (id === RESOLVED_THEME) {
				return generateThemeCSS(resolved.theme);
			}

			if (id === RESOLVED_SURFACE) {
				return generateSurfaceCSS(resolved.surface);
			}

			if (id === RESOLVED_COLORS) {
				return generateColorsCSS(resolved.colors, resolved.scheme);
			}

			if (id === RESOLVED_TOKENS) {
				/**
				 * Diff-эмиссия токенов компонентов подъезжает в тот же виртуальный
				 * модуль: свой файл ей не нужен — zero-config даёт пустую строку.
				 */
				return [
					generateTokensCSS(resolved.tokens, resolved.typography, resolved.motion),
					generateComponentTokensCSS(resolved.componentTokensDiff),
				]
					.filter(Boolean)
					.join('\n\n');
			}
		},

		webpack(compiler) {
			projectRoot = compiler.context ?? process.cwd();
		},

		rspack(compiler) {
			projectRoot = compiler.context ?? process.cwd();
		},

		vite: {
			/**
			 * Пакет из node_modules Vite в dev предсобирает без пользовательских плагинов, и `@flarian/ui/inject` резолвится в дефолтный файл из dist.
			 * Конфиг потребителя (темы, иконки, токены) тогда молча не применяется в dev, хотя в сборке работает.
			 * Пакеты, связанные через workspace, Vite не предсобирает, поэтому в монорепо это не проявлялось.
			 */
			config() {
				return { optimizeDeps: { exclude: [PACKAGE_NAME] } };
			},

			configResolved(config: ResolvedConfig) {
				isBuild = config.command === 'build';
				projectRoot = config.root;
			},

			/**
			 * Анти-FOUC: блокирующий скрипт в <head> применяет схему, тему
			 * и поверхность из localStorage/prefers-color-scheme до первой отрисовки.
			 * `foucScript: false` отключает вставку (MF: скрипт вставляет только host).
			 */
			transformIndexHtml() {
				if (options.foucScript === false) {
					return [];
				}

				return [
					{
						tag: 'script',
						children: generateFoucScript(resolved),
						injectTo: 'head-prepend' as const,
					},
				];
			},

			handleHotUpdate({ file, server }) {
				const isBuiltin = file.startsWith(builtinDir) && file.endsWith('.svg');
				const isCustom = (options.icons?.sets ?? []).some(
					({ dir }) => file.startsWith(resolveCustomDir(dir)) && file.endsWith('.svg')
				);

				if (!isBuiltin && !isCustom) {
					return;
				}

				rebuild();

				/**
				 * Спрайт запечён в inject-модуль — инвалидируем его, чтобы vite
				 * пересобрал модуль со свежим спрайтом, и перезагружаем страницу.
				 */
				const mod = server.moduleGraph.getModuleById(RESOLVED_INJECT);

				if (mod) {
					server.moduleGraph.invalidateModule(mod);
				}

				server.ws.send({ type: 'full-reload' });

				return [];
			},
		},
	};
};

/**
 * unplugin-инстанс: `flarianUI.vite`, `.rollup`, `.webpack`, `.rspack`, `.esbuild`.
 */
export const flarianUI = /* #__PURE__ */ createUnplugin(uiPluginFactory);

/**
 * Vite-плагин — основной вход `@flarian/ui/vite`.
 */
export const uiPlugin = flarianUI.vite;

/**
 * Анти-FOUC скрипт для ручной вставки в HTML-шаблон (бандлеры без HTML-пайплайна).
 * В Vite и Nuxt вставляется автоматически.
 */
export { generateFoucScript };

export const FlarianUIResolver = (resolverOptions: { prefix?: string } = {}) => {
	const prefix = resolverOptions.prefix ?? '';
	const composables = [
		'useConfig',
		'useMotion',
		'useScheme',
		'useSurface',
		'useTheme',
		'useTransparency',
	];

	return (name: string) => {
		const unprefixed = prefix
			? name.startsWith(prefix)
				? name.slice(prefix.length)
				: null
			: name;

		if (unprefixed && composables.includes(unprefixed)) {
			return { name: unprefixed, from: PACKAGE_NAME };
		}
	};
};
