import type { UiControlSize } from '~/tokens';

/**
 * Конфигурация размеров шрифта контролов.
 * Ключи типизированы моделью `UiControlSize`. → `--ui-control-font-size-*`
 */
export type DefaultControlFontSizeConfig = Record<UiControlSize, string>;
