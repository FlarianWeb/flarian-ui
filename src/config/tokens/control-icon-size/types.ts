import type { UiControlSize } from '~/tokens';

/**
 * Конфигурация размеров иконок контролов.
 * Ключи типизированы моделью `UiControlSize`. → `--ui-control-icon-size-*`
 */
export type DefaultControlIconSizeConfig = Record<UiControlSize, string>;
