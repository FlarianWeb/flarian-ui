import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
	UnpluginBuildContext,
	UnpluginContext,
	UnpluginContextMeta,
	UnpluginOptions,
} from 'unplugin';
import type { ResolvedConfig, ViteDevServer } from 'vite';

import { FlarianUIResolver, uiPluginFactory } from './index';
import type { UIPluginOptions } from './types';

const UI_KIT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const INJECT_ID = '@flarian/ui/inject';
const RESOLVED_INJECT = 'virtual:flarian-ui-inject';

type Framework = 'esbuild' | 'rollup' | 'rspack' | 'vite' | 'webpack';

/**
 * Инстанцирует unplugin-фабрику напрямую, без бандлера.
 * Vite-специфичные хуки лежат в `plugin.vite`, универсальные — на верхнем уровне.
 * Meta кастится: полный `UnpluginContextMeta` требует нативные объекты бандлера,
 * которые фабрика не использует.
 */
const createPlugin = (
	options: UIPluginOptions = {},
	framework: Framework = 'vite'
): UnpluginOptions =>
	uiPluginFactory(options, { framework } as UnpluginContextMeta) as UnpluginOptions;

/**
 * Вызывает vite-хук configResolved, разворачивая `ObjectHook` (функция или `{ handler }`).
 */
const callConfigResolved = (plugin: UnpluginOptions, config: ResolvedConfig) => {
	const hook = plugin.vite?.configResolved;
	const fn = typeof hook === 'function' ? hook : hook?.handler;

	fn?.call({} as never, config as never);
};

const mockConfig = (root: string, command: 'build' | 'serve' = 'serve'): ResolvedConfig =>
	({ root, command }) as ResolvedConfig;

/**
 * Контекст хука load: unplugin передаёт rollup-совместимый this.
 */
const loadContext = (emitFile = vi.fn().mockReturnValue('ref-id')) =>
	({ emitFile }) as unknown as UnpluginBuildContext & UnpluginContext;

const callLoad = (plugin: UnpluginOptions, id: string, ctx = loadContext()) =>
	(plugin.load as (this: unknown, id: string) => unknown).call(ctx, id) as string | undefined;

const callResolveId = (plugin: UnpluginOptions, id: string) =>
	(plugin.resolveId as (this: unknown, id: string) => unknown).call({}, id) as string | undefined;

const callBuildStart = (plugin: UnpluginOptions) =>
	(plugin.buildStart as (this: unknown) => void).call({});

const createMockServer = (): ViteDevServer =>
	({
		moduleGraph: {
			getModuleById: vi.fn(),
			invalidateModule: vi.fn(),
		},
		ws: {
			send: vi.fn(),
		},
	}) as unknown as ViteDevServer;

/**
 * Полный цикл инициализации vite-варианта: configResolved + buildStart.
 */
const initVite = (plugin: UnpluginOptions, root: string, command: 'build' | 'serve' = 'serve') => {
	callConfigResolved(plugin, mockConfig(root, command));
	callBuildStart(plugin);
};

describe('uiPluginFactory', () => {
	/**
	 * buildStart теперь безусловно пишет registry-файлы тем/поверхностей
	 * (zero-config `base` регистрируется всегда) — мокаем fs по умолчанию
	 * во всех тестах, чтобы не трогать реальный диск на фейковых путях
	 * (`/test/app`, `/some/consumer/app`, …). Тесты, которым нужно реальное
	 * поведение (иконки внутри ui-kit), переопределяют мок точечно.
	 */
	beforeEach(() => {
		vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
		vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('генерация файлов иконок', () => {
		it('не пишет built-in icons (typesOutput) в проекте потребителя', () => {
			const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
			const plugin = createPlugin();

			initVite(plugin, '/some/consumer/app');

			const wroteIconsTs = writeFileSpy.mock.calls.some(([p]) =>
				String(p).endsWith('icons.ts')
			);

			expect(wroteIconsTs).toBe(false);
		});

		it('пишет built-in icons (typesOutput) внутри ui-kit', () => {
			const writeFileSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);

			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			const plugin = createPlugin();

			initVite(plugin, UI_KIT_ROOT);

			const wroteIconsTs = writeFileSpy.mock.calls.some(([p]) =>
				String(p).endsWith('icons.ts')
			);

			expect(wroteIconsTs).toBe(true);
		});

		it('настраивает paths для кастомных dts и constants', () => {
			const writeFileSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);

			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			vi.spyOn(fs, 'readdirSync').mockReturnValue(['icon-1.svg', 'icon-2.svg'] as any[]);
			vi.spyOn(fs, 'readFileSync').mockReturnValue('<svg><path/></svg>');
			vi.spyOn(fs, 'existsSync').mockReturnValue(true);
			vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true } as fs.Stats);

			const plugin = createPlugin({
				icons: {
					dts: 'custom/types/flarian-icons.d.ts',
					constants: 'custom/constants/flarian-icons.ts',
					sets: [{ namespace: 'brand', dir: './icons/brand' }],
				},
			});

			initVite(plugin, '/custom/app');

			const dtsCall = writeFileSpy.mock.calls.some(([p]) =>
				String(p).includes('custom/types/flarian-icons.d.ts')
			);
			const constantsCall = writeFileSpy.mock.calls.some(([p]) =>
				String(p).includes('custom/constants/flarian-icons.ts')
			);

			expect(dtsCall).toBe(true);
			expect(constantsCall).toBe(true);
		});

		it('обрабатывает абсолютные пути для dts и constants', () => {
			const writeFileSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);

			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			vi.spyOn(fs, 'readdirSync').mockReturnValue(['icon1.svg', 'icon2.svg'] as any);
			vi.spyOn(fs, 'readFileSync').mockReturnValue('<svg><path/></svg>');
			vi.spyOn(fs, 'existsSync').mockReturnValue(true);
			vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true } as fs.Stats);

			const absoluteDts = '/absolute/path/flarian-icons.d.ts';
			const absoluteConstants = '/absolute/path/flarian-icons.ts';

			const plugin = createPlugin({
				icons: {
					dts: absoluteDts,
					constants: absoluteConstants,
					sets: [{ namespace: 'brand', dir: './icons/brand' }],
				},
			});

			initVite(plugin, '/custom/app');

			expect(
				writeFileSpy.mock.calls.some(([absolutePath]) => absolutePath === absoluteDts)
			).toBe(true);
			expect(
				writeFileSpy.mock.calls.some(([absolutePath]) => absolutePath === absoluteConstants)
			).toBe(true);
		});
	});

	describe('генерация registry-файлов тем/поверхностей', () => {
		it('пишет RegistryTheme/RegistrySurface с зашитым base (zero-config)', () => {
			const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
			const plugin = createPlugin();

			initVite(plugin, '/some/consumer/app');

			const themeCall = writeFileSpy.mock.calls.find(([p]) =>
				String(p).endsWith('flarian-theme-registry.d.ts')
			);
			const surfaceCall = writeFileSpy.mock.calls.find(([p]) =>
				String(p).endsWith('flarian-surface-registry.d.ts')
			);

			expect(String(themeCall?.[1])).toContain('interface RegistryTheme');
			expect(String(themeCall?.[1])).toContain("'base': true;");
			expect(String(surfaceCall?.[1])).toContain('interface RegistrySurface');
			expect(String(surfaceCall?.[1])).toContain("'base': true;");
		});

		it('пишет ключи из переданного theme.list/surface.list', () => {
			const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
			const plugin = createPlugin({
				theme: { list: { ocean: { base: '#0ea5e9' }, forest: { base: '#22c55e' } } },
				surface: { list: { warm: { 500: '#a08968' } } },
			});

			initVite(plugin, '/some/consumer/app');

			const themeCall = writeFileSpy.mock.calls.find(([p]) =>
				String(p).endsWith('flarian-theme-registry.d.ts')
			);
			const surfaceCall = writeFileSpy.mock.calls.find(([p]) =>
				String(p).endsWith('flarian-surface-registry.d.ts')
			);

			expect(String(themeCall?.[1])).toContain("'ocean': true;");
			expect(String(themeCall?.[1])).toContain("'forest': true;");
			expect(String(surfaceCall?.[1])).toContain("'warm': true;");
		});

		it('использует кастомный dts-путь для theme/surface', () => {
			const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
			const plugin = createPlugin({
				theme: { dts: 'custom/theme-registry.d.ts', list: { ocean: { base: '#0ea5e9' } } },
				surface: {
					dts: 'custom/surface-registry.d.ts',
					list: { warm: { 500: '#a08968' } },
				},
			});

			initVite(plugin, '/custom/app');

			expect(
				writeFileSpy.mock.calls.some(([p]) =>
					String(p).includes('custom/theme-registry.d.ts')
				)
			).toBe(true);
			expect(
				writeFileSpy.mock.calls.some(([p]) =>
					String(p).includes('custom/surface-registry.d.ts')
				)
			).toBe(true);
		});

		it('использует абсолютный dts-путь для theme/surface как есть', () => {
			const writeFileSpy = vi.spyOn(fs, 'writeFileSync');
			const absoluteThemeDts = '/absolute/theme-registry.d.ts';
			const absoluteSurfaceDts = '/absolute/surface-registry.d.ts';
			const plugin = createPlugin({
				theme: { dts: absoluteThemeDts, list: { ocean: { base: '#0ea5e9' } } },
				surface: { dts: absoluteSurfaceDts, list: { warm: { 500: '#a08968' } } },
			});

			initVite(plugin, '/custom/app');

			expect(writeFileSpy.mock.calls.some(([p]) => p === absoluteThemeDts)).toBe(true);
			expect(writeFileSpy.mock.calls.some(([p]) => p === absoluteSurfaceDts)).toBe(true);
		});
	});

	describe('buildStart', () => {
		it('выбрасывает ошибку при дублирующемся namespace', () => {
			const plugin = createPlugin({
				icons: {
					sets: [
						{ namespace: 'brand', dir: './icons' },
						{ namespace: 'brand', dir: './other' },
					],
				},
			});

			callConfigResolved(plugin, mockConfig('/some/app'));

			expect(() => callBuildStart(plugin)).toThrow('Duplicate namespace "brand"');
		});

		it('выбрасывает ошибку при использовании зарезервированного namespace "ui"', () => {
			const plugin = createPlugin({ icons: { sets: [{ namespace: 'ui', dir: './icons' }] } });

			callConfigResolved(plugin, mockConfig('/some/app'));

			expect(() => callBuildStart(plugin)).toThrow('reserved');
		});

		it('успешно собирает иконки с кастомными наборами', () => {
			vi.spyOn(fs, 'readdirSync').mockImplementation(externalPath => {
				if (String(externalPath).includes('assets/icons/ui')) {
					/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
					return ['builtin1.svg', 'builtin2.svg'] as any;
				}

				/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
				return ['icon1.svg', 'icon2.svg'] as any;
			});

			vi.spyOn(fs, 'readFileSync').mockReturnValue('<svg><path/></svg>');
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'existsSync').mockReturnValue(true);
			vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true } as fs.Stats);

			const plugin = createPlugin({
				icons: {
					sets: [
						{ namespace: 'brand', dir: './brand-icons' },
						{ namespace: 'social', dir: './social-icons' },
					],
				},
			});

			callConfigResolved(plugin, mockConfig('/test/app'));
			expect(() => callBuildStart(plugin)).not.toThrow();
		});

		it('принимает абсолютный путь в icons.sets.dir', () => {
			const absoluteDir = '/absolute/path/to/icons';

			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			vi.spyOn(fs, 'readdirSync').mockReturnValue(['custom.svg'] as any);
			vi.spyOn(fs, 'readFileSync').mockReturnValue('<svg><path/></svg>');
			vi.spyOn(fs, 'existsSync').mockReturnValue(true);
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			const plugin = createPlugin({
				icons: {
					sets: [{ namespace: 'brand', dir: absoluteDir }],
				},
			});

			callConfigResolved(plugin, mockConfig('/some/app'));
			expect(() => callBuildStart(plugin)).not.toThrow();

			expect(vi.mocked(fs.readdirSync)).toHaveBeenCalledWith(absoluteDir);
		});

		it('без configResolved использует process.cwd() как projectRoot', () => {
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			const plugin = createPlugin({}, 'webpack');

			expect(() => callBuildStart(plugin)).not.toThrow();
		});

		it('options.projectRoot побеждает даже когда бандлер уже выставил свой корень', () => {
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			const plugin = createPlugin({ projectRoot: '/explicit/root' }, 'webpack');

			plugin.webpack?.({ context: '/webpack/root' } as never);
			callBuildStart(plugin);

			const themeCall = vi
				.mocked(fs.writeFileSync)
				.mock.calls.find(([p]) => String(p).endsWith('flarian-theme-registry.d.ts'));

			expect(String(themeCall?.[0])).toContain('/explicit/root');
			expect(String(themeCall?.[0])).not.toContain('/webpack/root');
		});

		it('предупреждает об отсутствующей директории иконок и не повторяет warnOnce при повторном buildStart', () => {
			/**
			 * Обе проверки — в одном тесте: `warned` (Set в `warnOnce`) —
			 * module-scope singleton на весь прогон файла, а сообщение
			 * детерминировано (зависит только от фиксированного `BUILTIN_DIR`).
			 * Отдельный тест на «предупреждает» исчерпал бы дедуп для всех
			 * последующих тестов файла — вместо этого проверяем оба свойства
			 * (предупреждает и не повторяется) за один прогон.
			 */
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

			vi.spyOn(fs, 'existsSync').mockReturnValue(false);
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			const plugin = createPlugin();

			callConfigResolved(plugin, mockConfig('/some/app'));
			callBuildStart(plugin);
			callBuildStart(plugin);

			const iconWarnings = warn.mock.calls.filter(([message]) =>
				String(message).includes('Built-in icons not found near the plugin bundle')
			);

			expect(iconWarnings).toHaveLength(1);

			warn.mockRestore();
		});
	});

	describe('config (vite)', () => {
		it('исключает пакет из предсборки, чтобы inject шёл через плагин и в dev', () => {
			const plugin = createPlugin();
			const hook = plugin.vite?.config;
			const fn = typeof hook === 'function' ? hook : hook?.handler;

			const result = fn?.call({} as never, {}, { command: 'serve', mode: 'development' });

			expect(result).toEqual({ optimizeDeps: { exclude: ['@flarian/ui'] } });
		});
	});

	describe('transformIndexHtml (vite)', () => {
		it('вставляет анти-FOUC скрипт в head-prepend', () => {
			const plugin = createPlugin({ scheme: { default: 'dark' } });
			const hook = plugin.vite?.transformIndexHtml;
			const fn = typeof hook === 'function' ? hook : hook?.handler;

			const result = fn?.call({} as never, '<html></html>', {} as never) as Array<{
				children: string;
				injectTo: string;
				tag: string;
			}>;

			expect(Array.isArray(result)).toBe(true);
			expect(result[0].tag).toBe('script');
			expect(result[0].injectTo).toBe('head-prepend');
			expect(result[0].children).toContain("s='dark';");
			expect(result[0].children).toContain("localStorage.getItem('flarian-ui-scheme')");
		});

		it('foucScript: false отключает вставку скрипта (MF: скрипт вставляет только host)', () => {
			const plugin = createPlugin({ foucScript: false });
			const hook = plugin.vite?.transformIndexHtml;
			const fn = typeof hook === 'function' ? hook : hook?.handler;

			const result = fn?.call({} as never, '<html></html>', {} as never);

			expect(result).toEqual([]);
		});
	});

	describe('resolveId', () => {
		it('резолвит @flarian/ui/inject в виртуальный id', () => {
			const plugin = createPlugin();

			expect(callResolveId(plugin, INJECT_ID)).toBe(RESOLVED_INJECT);
		});

		it('уводит уже отрезолвленные пути inject-файла в виртуальный id (обход sideEffects)', () => {
			const plugin = createPlugin();

			expect(callResolveId(plugin, '/repo/src/flarian-ui.inject.ts')).toBe(RESOLVED_INJECT);
			expect(
				callResolveId(plugin, '/app/node_modules/@flarian/ui/dist/flarian-ui.inject.js')
			).toBe(RESOLVED_INJECT);
			expect(callResolveId(plugin, './flarian-ui.inject.js')).toBe(RESOLVED_INJECT);
		});

		it('резолвит CSS модули в vite-пайплайне', () => {
			const plugin = createPlugin();

			expect(callResolveId(plugin, '\0flarian-ui-theme.css')).toBe('\0flarian-ui-theme.css');
			expect(callResolveId(plugin, '\0flarian-ui-surface.css')).toBe(
				'\0flarian-ui-surface.css'
			);
			expect(callResolveId(plugin, '\0flarian-ui-colors.css')).toBe(
				'\0flarian-ui-colors.css'
			);
			expect(callResolveId(plugin, '\0flarian-ui-tokens.css')).toBe(
				'\0flarian-ui-tokens.css'
			);
		});

		it('не резолвит CSS модули вне vite/rollup-пайплайна', () => {
			const plugin = createPlugin({}, 'webpack');

			expect(callResolveId(plugin, '\0flarian-ui-theme.css')).toBeUndefined();
		});

		it('возвращает undefined для неизвестных ID', () => {
			const plugin = createPlugin();

			expect(callResolveId(plugin, 'unknown-id')).toBeUndefined();
		});
	});

	describe('load: inject-модуль', () => {
		it('vite dev: конфиг + inline-спрайт (без middleware)', () => {
			const plugin = createPlugin();

			initVite(plugin, '/test/app', 'serve');

			const result = callLoad(plugin, RESOLVED_INJECT);

			expect(result).toContain('provideConfig(');
			expect(result).toContain('provideSprite({ inline:');
			expect(result).not.toContain('ROLLUP_FILE_URL');
		});

		it('vite build: спрайт эмитится через emitFile', () => {
			const plugin = createPlugin();

			initVite(plugin, '/test/app', 'build');

			const emitFile = vi.fn().mockReturnValue('ref123');
			const result = callLoad(plugin, RESOLVED_INJECT, loadContext(emitFile));

			expect(emitFile).toHaveBeenCalledWith(
				expect.objectContaining({ type: 'asset', name: 'icon-sprite.svg' })
			);
			expect(result).toContain('import.meta.ROLLUP_FILE_URL_ref123');
		});

		it('перехватывает реальный файл flarian-ui.inject по имени', () => {
			const plugin = createPlugin();

			initVite(plugin, '/test/app', 'serve');

			const byJsPath = callLoad(
				plugin,
				'/consumer/node_modules/@flarian/ui/dist/flarian-ui.inject.js'
			);
			const byTsPath = callLoad(plugin, `${UI_KIT_ROOT}/src/flarian-ui.inject.ts`);

			expect(byJsPath).toContain('provideConfig(');
			expect(byTsPath).toContain('provideConfig(');
		});

		it('webpack: inline-режим с provideStyle и inline-спрайтом', () => {
			/**
			 * Плагин запускается из исходников пакета (не из dist) — статичный
			 * `dist/styles.css` реально отсутствует рядом с `src/plugin/index.ts`,
			 * поэтому `buildInlineCSS` честно предупреждает (см. `warnOnce` в
			 * `plugin/index.ts`). У реального потребителя (пакет из node_modules)
			 * `dist/styles.css` всегда на месте — здесь документируем и глушим
			 * ожидаемый в этом контексте warning, а не превращаем его в шум
			 * stderr при каждом прогоне тестов.
			 */
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

			const plugin = createPlugin({}, 'webpack');

			callBuildStart(plugin);

			const result = callLoad(plugin, RESOLVED_INJECT);

			expect(result).toContain('provideStyle(');
			expect(result).toContain('provideSprite({ inline:');
			expect(result).not.toContain('ROLLUP_FILE_URL');
			expect(result).not.toContain('\\0flarian-ui');
			expect(warn).toHaveBeenCalledWith(
				expect.stringContaining('Static styles.css not found')
			);

			warn.mockRestore();
		});

		it('webpack: включает статичный styles.css в CSS, если он существует рядом с бандлом', () => {
			const staticCssPath = path.resolve(UI_KIT_ROOT, 'src/plugin/styles.css');
			const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

			vi.spyOn(fs, 'existsSync').mockReturnValue(true);
			vi.spyOn(fs, 'readFileSync').mockImplementation(p =>
				String(p) === staticCssPath ? '.ui-button { color: red; }' : '<svg><path/></svg>'
			);

			const plugin = createPlugin({}, 'webpack');

			callBuildStart(plugin);

			const result = callLoad(plugin, RESOLVED_INJECT);

			expect(result).toContain('.ui-button { color: red; }');
			expect(warn).not.toHaveBeenCalled();

			warn.mockRestore();
		});
	});

	describe('loadInclude', () => {
		const callLoadInclude = (plugin: UnpluginOptions, id: string) =>
			(plugin.loadInclude as (id: string) => boolean | null | undefined)(id);

		it('true для inject-модуля и его файловых алиасов', () => {
			const plugin = createPlugin();

			expect(callLoadInclude(plugin, RESOLVED_INJECT)).toBe(true);
			expect(callLoadInclude(plugin, '/repo/src/flarian-ui.inject.ts')).toBe(true);
			expect(callLoadInclude(plugin, '/dist/flarian-ui.inject.js')).toBe(true);
		});

		it('true для CSS виртуальных модулей', () => {
			const plugin = createPlugin();

			expect(callLoadInclude(plugin, '\0flarian-ui-theme.css')).toBe(true);
			expect(callLoadInclude(plugin, '\0flarian-ui-surface.css')).toBe(true);
			expect(callLoadInclude(plugin, '\0flarian-ui-colors.css')).toBe(true);
			expect(callLoadInclude(plugin, '\0flarian-ui-tokens.css')).toBe(true);
		});

		it('false для неизвестного id', () => {
			const plugin = createPlugin();

			expect(callLoadInclude(plugin, 'unknown-id')).toBe(false);
		});
	});

	describe('load: CSS модули', () => {
		it('загружает theme CSS', () => {
			const plugin = createPlugin();
			const result = callLoad(plugin, '\0flarian-ui-theme.css');

			expect(result).toBeDefined();
			expect(typeof result).toBe('string');
		});

		it('загружает surface CSS с настройками по умолчанию', () => {
			const plugin = createPlugin();
			const result = callLoad(plugin, '\0flarian-ui-surface.css');

			expect(result).toBeDefined();
			expect(result).toContain(':root');
			expect(result).toContain('--ui-surface-50');
		});

		it('загружает colors CSS с настройками по умолчанию', () => {
			const plugin = createPlugin();
			const result = callLoad(plugin, '\0flarian-ui-colors.css');

			expect(result).toBeDefined();
			expect(result).toContain(':root');
		});

		it('загружает tokens CSS', () => {
			const plugin = createPlugin();
			const result = callLoad(plugin, '\0flarian-ui-tokens.css');

			expect(result).toBeDefined();
			expect(typeof result).toBe('string');
		});

		it('возвращает undefined для неизвестных ID', () => {
			const plugin = createPlugin();

			expect(callLoad(plugin, 'unknown-id')).toBeUndefined();
		});

		it('вне vite/rollup-пайплайна CSS-модули не загружаются', () => {
			const plugin = createPlugin({}, 'webpack');

			expect(callLoad(plugin, '\0flarian-ui-theme.css')).toBeUndefined();
		});
	});

	describe('webpack/rspack: projectRoot из compiler.context', () => {
		it('webpack: берёт projectRoot из compiler.context', () => {
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			const plugin = createPlugin({}, 'webpack');

			plugin.webpack?.({ context: '/webpack/root' } as never);
			callBuildStart(plugin);

			const themeCall = vi
				.mocked(fs.writeFileSync)
				.mock.calls.find(([p]) => String(p).endsWith('flarian-theme-registry.d.ts'));

			expect(String(themeCall?.[0])).toContain('/webpack/root');
		});

		it('webpack: без compiler.context использует process.cwd()', () => {
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			const plugin = createPlugin({}, 'webpack');

			expect(() => plugin.webpack?.({} as never)).not.toThrow();
		});

		it('rspack: берёт projectRoot из compiler.context', () => {
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			const plugin = createPlugin({}, 'rspack');

			plugin.rspack?.({ context: '/rspack/root' } as never);
			callBuildStart(plugin);

			const themeCall = vi
				.mocked(fs.writeFileSync)
				.mock.calls.find(([p]) => String(p).endsWith('flarian-theme-registry.d.ts'));

			expect(String(themeCall?.[0])).toContain('/rspack/root');
		});

		it('rspack: без compiler.context использует process.cwd()', () => {
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);

			const plugin = createPlugin({}, 'rspack');

			expect(() => plugin.rspack?.({} as never)).not.toThrow();
		});
	});

	describe('handleHotUpdate (vite)', () => {
		type HotUpdate = (ctx: { file: string; server: ViteDevServer }) => unknown;

		const hotUpdate = (plugin: UnpluginOptions) =>
			plugin.vite?.handleHotUpdate as unknown as HotUpdate;

		it('обрабатывает обновления builtin иконок', () => {
			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			vi.spyOn(fs, 'readdirSync').mockReturnValue(['icon1.svg', 'icon2.svg'] as any);
			vi.spyOn(fs, 'readFileSync').mockReturnValue('<svg><path/></svg>');
			vi.spyOn(fs, 'existsSync').mockReturnValue(true);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true } as fs.Stats);

			const plugin = createPlugin();
			const server = createMockServer();

			/** путь вычисляется из того же BUILTIN_DIR что использует плагин */
			const builtinIconPath = path.join(UI_KIT_ROOT, 'src/assets/icons/ui/icon.svg');

			initVite(plugin, '/test/app');

			const result = hotUpdate(plugin)({ file: builtinIconPath, server });

			expect(server.ws.send).toHaveBeenCalledWith({ type: 'full-reload' });
			expect(result).toEqual([]);
		});

		it('обрабатывает обновления кастомных иконок', () => {
			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			vi.spyOn(fs, 'readdirSync').mockReturnValue(['icon1.svg', 'icon2.svg'] as any);
			vi.spyOn(fs, 'readFileSync').mockReturnValue('<svg><path/></svg>');
			vi.spyOn(fs, 'existsSync').mockReturnValue(true);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true } as fs.Stats);

			const plugin = createPlugin({
				icons: {
					dts: 'src/generated/flarian-icons-registry.d.ts',
					constants: 'src/generated/flarian-icons.ts',
					sets: [{ namespace: 'brand', dir: './brand-icons' }],
				},
			});

			const server = createMockServer();

			initVite(plugin, '/test/app');

			const result = hotUpdate(plugin)({ file: '/test/app/brand-icons/icon.svg', server });

			expect(server.ws.send).toHaveBeenCalledWith({ type: 'full-reload' });
			expect(result).toEqual([]);
		});

		it('игнорирует не-иконки и не-SVG файлы', () => {
			const plugin = createPlugin();
			const server = createMockServer();

			initVite(plugin, '/test/app');

			const result = hotUpdate(plugin)({ file: '/test/app/src/component.tsx', server });

			expect(server.ws.send).not.toHaveBeenCalled();
			expect(result).toBeUndefined();
		});

		it('инвалидирует inject-модуль, если он уже загружен в moduleGraph', () => {
			/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
			vi.spyOn(fs, 'readdirSync').mockReturnValue(['icon1.svg'] as any);
			vi.spyOn(fs, 'readFileSync').mockReturnValue('<svg><path/></svg>');
			vi.spyOn(fs, 'existsSync').mockReturnValue(true);
			vi.spyOn(fs, 'mkdirSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'writeFileSync').mockImplementation(() => undefined);
			vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true } as fs.Stats);

			const plugin = createPlugin();
			const server = createMockServer();
			const injectModule = {};

			vi.mocked(server.moduleGraph.getModuleById).mockReturnValue(injectModule as never);

			const builtinIconPath = path.join(UI_KIT_ROOT, 'src/assets/icons/ui/icon.svg');

			initVite(plugin, '/test/app');

			hotUpdate(plugin)({ file: builtinIconPath, server });

			expect(server.moduleGraph.invalidateModule).toHaveBeenCalledWith(injectModule);
		});
	});

	describe('FlarianUIResolver', () => {
		it('резолвит composables без префикса', () => {
			const resolver = FlarianUIResolver();

			expect(resolver('useMotion')).toEqual({ name: 'useMotion', from: '@flarian/ui' });
			expect(resolver('useScheme')).toEqual({ name: 'useScheme', from: '@flarian/ui' });
			expect(resolver('useSurface')).toEqual({ name: 'useSurface', from: '@flarian/ui' });
			expect(resolver('useTheme')).toEqual({ name: 'useTheme', from: '@flarian/ui' });
			expect(resolver('useTransparency')).toEqual({
				name: 'useTransparency',
				from: '@flarian/ui',
			});
		});

		it('резолвит composables с префиксом', () => {
			const resolver = FlarianUIResolver({ prefix: 'ui' });

			expect(resolver('uiuseMotion')).toEqual({ name: 'useMotion', from: '@flarian/ui' });
			expect(resolver('uiuseScheme')).toEqual({ name: 'useScheme', from: '@flarian/ui' });
		});

		it('возвращает undefined для не-composables', () => {
			const resolver = FlarianUIResolver();

			expect(resolver('useNotExists')).toBeUndefined();
			expect(resolver('Button')).toBeUndefined();
		});

		it('возвращает undefined для неправильного префикса', () => {
			const resolver = FlarianUIResolver({ prefix: 'ui' });

			expect(resolver('wronguseMotion')).toBeUndefined();
		});
	});

	describe('BUILTIN_DIR определение', () => {
		it('должен определить BUILTIN_DIR корректно', () => {
			const plugin = createPlugin();

			callConfigResolved(plugin, mockConfig(UI_KIT_ROOT));

			expect(() => callBuildStart(plugin)).not.toThrow();
		});
	});
});
