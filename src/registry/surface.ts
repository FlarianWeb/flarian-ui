/**
 * Расширяемый реестр именованных поверхностей.
 *
 * Заполняется через module augmentation — плагин авто-генерирует файл в проекте пользователя:
 * ```ts
 * declare module '@flarian/ui' {
 * 	interface RegistrySurface {
 * 		warm: true;
 * 	}
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RegistrySurface {}

/**
 * Юнион зарегистрированных имён поверхностей.
 * `string` пока поверхности не зарегистрированы — в отличие от `UiTheme`
 * (`keyof RegistryTheme`, допустимо `never`: у темы есть `null`-состояние),
 * у `useSurface()` его нет — состояние всегда содержит реальное строковое
 * значение (минимум встроенный `'default'`), и `Ref<never>` в рантайме
 * недопустим (тип «схлопывается» в `never` целиком из-за условных типов
 * внутри `Ref<T>`).
 */
export type UiSurface = [keyof RegistrySurface] extends [never] ? string : keyof RegistrySurface;
