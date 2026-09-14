import { flarianUI } from './index';
import type { IconSetConfig, UIPluginOptions } from './types';

/**
 * Webpack-плагин — `@flarian/ui/webpack`.
 * CSS и спрайт доставляются inline-режимом через runtime store —
 * css-loader для стилей пакета не требуется.
 */
export const uiPlugin = flarianUI.webpack;

export default uiPlugin;
export { generateFoucScript } from '../generators/generateFoucScript';
export { defineUIPluginOptions } from './defineUIPluginOptions';
export type { IconSetConfig, UIPluginOptions };
