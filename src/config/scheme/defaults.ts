import { configSchemes, configSchemesOptional, type DefaultSchemeConfig } from './types';

export const defaultSchemeConfig = {
	default: configSchemesOptional.auto,
	attribute: 'data-scheme',
	dark: configSchemes.dark,
	light: configSchemes.light,
} satisfies DefaultSchemeConfig;
