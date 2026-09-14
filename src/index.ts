export { flarianUI } from '~/app';

/**
 * Экспорт пропсов дизайн системы
 *
 * Префикс - `ui` для const
 * Префикс - `Ui` для type
 */
export { uiSize, type UiSize } from '~/components/shared/props';
/**
 * Экспорт компонентов, свойств и типов компонентов
 */
export {
	Button,
	type ButtonClasses,
	type ButtonProps,
	type ButtonSlot,
	buttonVariant,
	type ButtonVariant,
} from '~/components/ui/Buttons/Button';

export { Icon } from '~/components/ui/Display/Icon';

/**
 * Экспорт композиций
 *
 * Префикс - `use` для composables
 */
export {
	useConfig,
	useMotion,
	useScheme,
	useSurface,
	useTheme,
	useTransparency,
} from '~/composables';

/**
 * Экспорт типов конфигураций
 *
 * Префикс - `Config`
 */
export type { ConfigA11y } from '~/config/a11y';

export type { ConfigColors } from '~/config/colors';

export type { ConfigComponents } from '~/config/components';

export type {
	ConfigScheme,
	ConfigSchemes,
	configSchemes,
	ConfigSchemesOptional,
	configSchemesOptional,
} from '~/config/scheme';
export type { ConfigSurface, ConfigSurfaces } from '~/config/surface';
export type { ConfigTheme, ConfigThemes } from '~/config/themes';
export type { ConfigTokens } from '~/config/tokens';
export type { ConfigTypography } from '~/config/typography';
/**
 * Экспорт директив
 *
 * Префикс - `v` для directives
 */
export * from '~/directives'; // TODO: добавить именованный импорт после создания
/**
 * Экспорт реестра module augmentation
 *
 * Префикс - `ui` для const
 * Префикс - `Ui` для type
 * Префикс - `Registry` для augmentation type
 */
export {
	getVariantClass,
	registerVariants,
	type RegistryButtonVariant,
	type RegistryIcon,
	type RegistrySurface,
	type RegistryTheme,
	type UiButtonVariant,
	uiIcon,
	type UiIcon,
	type UiSurface,
	type UiTheme,
} from '~/registry';
/**
 * Экспорт токенов дизайн системы
 *
 * Префикс - `ui` для const
 * Префикс - `Ui` для type
 */
export {
	uiBackdrop,
	type UiBackdrop,
	uiColor,
	type UiColor,
	uiDuration,
	type UiDuration,
	uiEasing,
	type UiEasing,
	uiFontSize,
	type UiFontSize,
	uiFontWeight,
	type UiFontWeight,
	uiRadius,
	type UiRadius,
	uiSpace,
	type UiSpace,
} from '~/tokens';
