import type { UiBackdrop } from '~/tokens';

/**
 * Конфигурация backdrop blur для модальных окон и оверлеев.
 * Ключи типизированы моделью `UiBackdrop`. → `--ui-backdrop-*`
 */
export type DefaultBackdropConfig = Record<UiBackdrop, string>;
