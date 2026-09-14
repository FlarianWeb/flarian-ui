import { flarianUI } from './index';
import type { IconSetConfig, UIPluginOptions } from './types';

/**
 * Rspack-плагин — `@flarian/ui/rspack`.
 * CSS и спрайт доставляются inline-режимом через runtime store.
 */
export const uiPlugin = flarianUI.rspack;

export default uiPlugin;
export { generateFoucScript } from '../generators/generateFoucScript';
export { defineUIPluginOptions } from './defineUIPluginOptions';
export type { IconSetConfig, UIPluginOptions };
