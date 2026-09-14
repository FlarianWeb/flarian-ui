/**
 * Расширяемый реестр пользовательских вариантов кнопки.
 *
 * Даёт добавить свой вариант «снаружи» — без компонента-обёртки: потребитель
 * регистрирует класс из собственного CSS-модуля и типизирует имя через
 * module augmentation, после чего `<Button variant="promo">` работает
 * с автокомплитом и проверкой типов.
 *
 * ```ts
 * // main.ts — до app.use(flarianUI)
 * import styles from './button-variants.module.css';
 * import { registerVariants } from '@flarian/ui';
 *
 * registerVariants('button', { promo: styles.promo });
 * ```
 * ```ts
 * // env.d.ts
 * declare module '@flarian/ui' {
 * 	interface RegistryButtonVariant {
 * 		promo: true;
 * 	}
 * }
 * ```
 *
 * CSS-контракт варианта: класс потребителя unlayered и выигрывает у стилей
 * кита (`@layer flarian-ui`); внутри доступны переменные цветовой оси
 * `--_color`/`--_on-color` (их ставит класс `color-*`) — используйте их,
 * чтобы вариант реагировал на проп `color`, и опишите свои `:hover`/`:active`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface RegistryButtonVariant {}

/**
 * Юнион зарегистрированных пользовательских вариантов кнопки.
 * Пока вариантов нет — `never`: юнион `ButtonVariant | never` невидим,
 * закрытый список встроенных вариантов не расширяется «в никуда»
 * (в отличие от `UiTheme`, здесь fallback в `string` не нужен —
 * встроенные варианты дают непустой юнион сами по себе).
 */
export type UiButtonVariant = keyof RegistryButtonVariant & string;

/**
 * Компоненты с регистрируемыми вариантами (пока только кнопка;
 * новые компоненты добавляют сюда свой ключ).
 */
type VariantComponent = 'button';

/**
 * Module-scope реестр «компонент → имя варианта → CSS-класс» — те же
 * singleton-семантики, что у runtime store: общий для всех Vue-приложений
 * одного бандла, SSR-безопасен (чистые данные, DOM не трогается).
 */
const variantClasses: Record<VariantComponent, Record<string, string>> = {
	button: {},
};

/**
 * Регистрирует пользовательские варианты компонента.
 * Вызывайте до первого рендера (рядом с `app.use(flarianUI)`):
 * реестр читается компонентом в момент вычисления классов.
 */
export const registerVariants = (
	component: VariantComponent,
	variants: Partial<Record<UiButtonVariant, string>>
): void => {
	Object.assign(variantClasses[component], variants);
};

/**
 * CSS-класс зарегистрированного варианта; `undefined` для встроенных
 * и незарегистрированных имён — компонент сначала ищет вариант
 * в собственном CSS-модуле.
 */
export const getVariantClass = (component: VariantComponent, variant: string): string | undefined =>
	variantClasses[component][variant];
