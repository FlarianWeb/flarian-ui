import type { UiControlSize } from '~/tokens';

/**
 * Конфигурация line-height контролов в rem.
 * Ключи типизированы моделью `UiControlSize`. → `--ui-control-line-height-*`
 */
export type DefaultControlLineHeightConfig = Record<UiControlSize, string>;
