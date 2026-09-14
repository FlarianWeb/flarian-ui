import { type BuiltInIcon, iconNames } from '~/generated/icons';

/**
 * Runtime константа встроенных иконок.
 * Аналог `uiRadius`, `uiSize` — даёт автодополнение в шаблонах.
 * Заполняется плагином при сборке из `src/assets/icons/ui/`.
 */
export const uiIcon = iconNames;

/**
 * Реестр иконок.
 * Встроенные `ui/*` иконки регистрируются через `src/generated/icons.ts`.
 * Кастомные наборы расширяют реестр через module augmentation в проекте:
 * @example
 * declare module '@flarian/ui' {
 * 	interface RegistryIcon {
 * 		'brand/logo': true;
 * 	}
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RegistryIcon {}

/**
 * Тип имени иконки — объединение встроенных и кастомных.
 * `BuiltInIcon` — из `generated/icons.ts` (встроенные `ui/*`).
 * `keyof RegistryIcon` — кастомные наборы через module augmentation.
 */
export type UiIcon = BuiltInIcon | keyof RegistryIcon;
