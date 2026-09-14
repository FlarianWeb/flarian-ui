import type { UiEasing } from '~/tokens';

/**
 * Конфигурация функции анимаций.
 * Ключи типизированы моделью `UiEasing`. → `--ui-easing-*`
 */
export type DefaultEasingConfig = Record<UiEasing, string>;
