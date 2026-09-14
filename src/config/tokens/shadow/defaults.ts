import type { DefaultShadowConfig } from './types';

export const defaultShadowConfig = {
	xs: '0 0.0625rem 0.125rem 0 var(--ui-color-shadow-xs, var(--ui-color-shadow))',
	sm: '0 0.0625rem 0.1875rem 0 var(--ui-color-shadow-sm, var(--ui-color-shadow)), 0 0.0625rem 0.125rem -0.0625rem var(--ui-color-shadow-sm, var(--ui-color-shadow))',
	md: '0 0.25rem 0.375rem -0.0625rem var(--ui-color-shadow-md, var(--ui-color-shadow)), 0 0.125rem 0.25rem -0.125rem var(--ui-color-shadow-md, var(--ui-color-shadow))',
	lg: '0 0.625rem 0.9375rem -0.1875rem var(--ui-color-shadow-lg, var(--ui-color-shadow)), 0 0.25rem 0.375rem -0.25rem var(--ui-color-shadow-lg, var(--ui-color-shadow))',
	xl: '0 1.25rem 1.5625rem -0.3125rem var(--ui-color-shadow-xl, var(--ui-color-shadow)), 0 0.5rem 0.625rem -0.375rem var(--ui-color-shadow-xl, var(--ui-color-shadow))',
} satisfies DefaultShadowConfig;
