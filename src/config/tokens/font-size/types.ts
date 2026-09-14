import type { UiFontSize } from '~/tokens';

/**
 * Конфигурация размеров шрифта и иконок.
 * Ключи типизированы моделью `UiFontSize`. → `--ui-font-size-*`
 */
export type DefaultFontSizeConfig = Record<UiFontSize, string>;
