import { flarianUI } from './index';
import type { IconSetConfig, UIPluginOptions } from './types';

/**
 * esbuild-плагин — `@flarian/ui/esbuild`.
 * CSS и спрайт доставляются inline-режимом через runtime store.
 */
export const uiPlugin = flarianUI.esbuild;

export default uiPlugin;
export { generateFoucScript } from '../generators/generateFoucScript';
export { defineUIPluginOptions } from './defineUIPluginOptions';
export type { IconSetConfig, UIPluginOptions };
