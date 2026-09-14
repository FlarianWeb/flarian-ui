/**
 * Расширяемый реестр именованных тем.
 *
 * Заполняется через module augmentation — плагин авто-генерирует файл в проекте пользователя:
 * ```ts
 * declare module '@flarian/ui' {
 * 	interface RegistryTheme {
 * 		ocean: true;
 * 		forest: true;
 * 	}
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RegistryTheme {}

/**
 * Юнион зарегистрированных имён тем.
 * `string` пока темы не зарегистрированы — иначе `UiTheme` схлопнулся бы в
 * `never`, а `Ref<UiTheme | null>` в `useTheme()` — в бесполезный `Ref<null>`
 * (юнион с `never` поглощается), хотя рантайм-значение `theme.value` вполне
 * реальное (например, зашитая `default`-тема `'base'`). См. аналогичный
 * комментарий у `UiSurface`.
 */
export type UiTheme = [keyof RegistryTheme] extends [never] ? string : keyof RegistryTheme;
