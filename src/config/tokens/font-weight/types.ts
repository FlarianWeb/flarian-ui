import type { UiFontWeight } from '~/tokens';

/**
 * Конфигурация толщины шрифтов.
 * Ключи типизированы моделью `UiFontWeight`. → `--ui-font-weight-*`
 */
export type DefaultFontWeightConfig = Record<UiFontWeight, string>;
