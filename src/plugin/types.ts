import type { ConfigA11y } from '../config/a11y';
import type { ConfigColors } from '../config/colors';
import type { ConfigComponents } from '../config/components';
import type { ConfigMotion } from '../config/motion';
import type { ConfigScheme } from '../config/scheme';
import type { ConfigSurface, ConfigSurfaces } from '../config/surface';
import type { ConfigTheme, ConfigThemes } from '../config/themes';
import type { ConfigTokens } from '../config/tokens';
import type { ConfigTypography } from '../config/typography';

/**
 * Конфигурация набора SVG иконок.
 */
export type IconSetConfig = {
	/**
	 * Пространство имён — префикс для имён иконок, например `'brand'` → `'brand/logo'`.
	 */
	namespace: string;

	/**
	 * Путь к папке с SVG файлами.
	 */
	dir: string;
};

type ConfigIcons = {
	/**
	 * Путь куда будет генерироваться файл с декларацией типов иконок (module augmentation).
	 *
	 * ⚠️ Если `dts` и `constants` лежат в одной директории, их базовые имена должны
	 * различаться. TypeScript игнорирует `foo.d.ts` если рядом есть `foo.ts` —
	 * считает его своим сгенерированным выводом и не читает как источник.
	 * Пример корректной конфигурации: `dts: 'icons-registry.d.ts'`, `constants: 'icons.ts'`.
	 *
	 * @default 'src/generated/flarian-icons-registry.d.ts'
	 */
	dts?: string;

	/**
	 * Путь куда будет генерироваться файл с runtime-константами кастомных иконок.
	 *
	 * @default 'src/generated/flarian-icons.ts'
	 */
	constants?: string;

	/**
	 * Наборы иконок.
	 */
	sets: IconSetConfig[];
};

/**
 * Опции Vite-плагина `uiPlugin()`.
 * `TE`/`SE` — дженерики зон `extend` (дополнение встроенных списков),
 * выводятся `defineUIPluginOptions` так же, как `T`/`S` для `list`.
 */
export type UIPluginOptions<
	T extends Record<string, ConfigTheme> = Record<string, ConfigTheme>,
	S extends Record<string, ConfigSurface> = Record<string, ConfigSurface>,
	TE extends Record<string, ConfigTheme> = Record<string, ConfigTheme>,
	SE extends Record<string, ConfigSurface> = Record<string, ConfigSurface>,
> = {
	/**
	 * Конфигурация именованных акцентных тем (`base`/`onBase`).
	 */
	theme?: ConfigThemes<T, TE>;

	/**
	 * Конфигурация именованных поверхностей — нейтральная шкала и статусные
	 * цвета, независимо от `theme`.
	 */
	surface?: ConfigSurfaces<S, SE>;

	/**
	 * Наборы кастомных SVG иконок.
	 */
	icons?: ConfigIcons;

	/**
	 * Конфигурация механизма переключения схем (dark/light).
	 */
	scheme?: ConfigScheme;

	/**
	 * Переопределение цветовых токенов (схем-зависимые + абсолютные).
	 */
	colors?: ConfigColors;

	/**
	 * Переопределение шкальных токенов (radius, size, duration, backdrop).
	 */
	tokens?: ConfigTokens;

	/**
	 * Переопределение типографики.
	 */
	typography?: ConfigTypography;

	/**
	 * Семантические умолчания transition.
	 */
	motion?: ConfigMotion;

	/**
	 * Переопределение дефолтов компонентов.
	 */
	component?: ConfigComponents;

	/**
	 * Настройки доступности.
	 */
	a11y?: ConfigA11y;

	/**
	 * Префикс ключей localStorage (`{prefix}-scheme`, `{prefix}-theme`,
	 * `{prefix}-surface`, …) и DOM-id служебных элементов пакета
	 * (`{prefix}-sprite`, `{prefix}-style`).
	 * Задавайте, если на одном origin живут несколько приложений с @flarian/ui.
	 *
	 * @default 'flarian-ui'
	 */
	storagePrefix?: string;

	/**
	 * Автовставка блокирующего анти-FOUC скрипта в `<head>`.
	 * Отключите в MF-сценарии у remote-приложений: скрипт должен вставлять
	 * только host, иначе каждый remote добавит свой экземпляр.
	 *
	 * @default true
	 */
	foucScript?: boolean;

	/**
	 * Корень проекта потребителя — база для генерируемых файлов
	 * (`src/generated/*`) и относительных путей иконок.
	 * Vite/webpack/rspack сообщают корень сами; задавайте явно для
	 * rollup/esbuild или при запуске сборки не из корня проекта
	 * (иначе fallback — `process.cwd()`).
	 */
	projectRoot?: string;
};
