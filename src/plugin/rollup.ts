import { flarianUI } from './index';
import type { IconSetConfig, UIPluginOptions } from './types';

/**
 * Rollup-плагин — `@flarian/ui/rollup`.
 * Использует полный пайплайн: виртуальные CSS-модули и emitFile для спрайта.
 * Подключение CSS в бандл — ответственность rollup-css-плагина потребителя.
 */
export const uiPlugin = flarianUI.rollup;

export default uiPlugin;
export { generateFoucScript } from '../generators/generateFoucScript';
export { defineUIPluginOptions } from './defineUIPluginOptions';
export type { IconSetConfig, UIPluginOptions };
