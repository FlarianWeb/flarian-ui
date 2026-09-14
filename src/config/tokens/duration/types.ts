import type { UiDuration } from '~/tokens';

/**
 * Конфигурация длительности анимаций.
 * Ключи типизированы моделью `UiDuration`. → `--ui-duration-*`
 */
export type DefaultDurationConfig = Record<UiDuration, string>;
