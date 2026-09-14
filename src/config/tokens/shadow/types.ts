import type { UiShadow } from '~/tokens';

/**
 * Конфигурация теней.
 * Ключи типизированы моделью `UiShadow`. → `--ui-shadow-*`
 */
export type DefaultShadowConfig = Record<UiShadow, string>;
