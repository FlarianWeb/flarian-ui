import type { UiSpace } from '~/tokens';

/**
 * Конфигурация размеров отступов.
 * Ключи типизированы моделью `UiSpace`. → `--ui-space-*`
 */
export type DefaultSpaceConfig = Record<UiSpace, string>;
