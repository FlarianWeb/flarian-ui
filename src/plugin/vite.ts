import { flarianUI, FlarianUIResolver } from './index';
import type { IconSetConfig, UIPluginOptions } from './types';

/**
 * Vite-плагин — `@flarian/ui/vite`.
 */
export const uiPlugin = flarianUI.vite;

export { FlarianUIResolver };
export { generateFoucScript } from '../generators/generateFoucScript';
export { defineUIPluginOptions } from './defineUIPluginOptions';
export type { IconSetConfig, UIPluginOptions };
