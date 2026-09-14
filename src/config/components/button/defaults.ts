import type { ButtonConfig } from './types';

/**
 * Дефолты `Button`:
 * `props` - runtime store
 * `tokens` — валидация значений CSS-токенов.
 */
export const buttonDefaults = {
	props: {
		direction: 'row',
		variant: 'solid',
		size: 'md',
		radius: 'xs',
		color: 'base',
	},
	tokens: {
		/** Scalar */
		fontFamily: 'var(--ui-font-family)',
		fontWeight: 'var(--ui-font-weight-medium)',
		borderSize: 'var(--ui-space-px)',
		borderStyle: 'solid',
		hoverMix: '10%',
		// activeMix: '20%',

		/** Sized */
		fontSize: {
			xs: 'var(--ui-control-font-size-xs)',
			sm: 'var(--ui-control-font-size-sm)',
			md: 'var(--ui-control-font-size-md)',
			lg: 'var(--ui-control-font-size-lg)',
			xl: 'var(--ui-control-font-size-xl)',
		},
		iconSize: {
			xs: 'var(--ui-control-icon-size-xs)',
			sm: 'var(--ui-control-icon-size-sm)',
			md: 'var(--ui-control-icon-size-md)',
			lg: 'var(--ui-control-icon-size-lg)',
			xl: 'var(--ui-control-icon-size-xl)',
		},
		lineHeight: {
			xs: 'var(--ui-control-line-height-xs)',
			sm: 'var(--ui-control-line-height-sm)',
			md: 'var(--ui-control-line-height-md)',
			lg: 'var(--ui-control-line-height-lg)',
			xl: 'var(--ui-control-line-height-xl)',
		},
		paddingX: {
			xs: '0.5rem',
			sm: '0.75rem',
			md: '1rem',
			lg: '1.25rem',
			xl: '1.5rem',
		},
		paddingY: {
			xs: '0.25rem',
			sm: '0.375rem',
			md: '0.5rem',
			lg: '0.625rem',
			xl: '0.75rem',
		},
		gapX: {
			xs: '0.125rem',
			sm: '0.1875rem',
			md: '0.25rem',
			lg: '0.3125rem',
			xl: '0.375rem',
		},
		gapY: {
			xs: '0.125rem',
			sm: '0.1875rem',
			md: '0.25rem',
			lg: '0.3125rem',
			xl: '0.375rem',
		},

		// iconPadding: 'var(--ui-space-none)',
		// focusRingColor: 'color-mix(in oklab, var(--_color) 75%, transparent)',
		// focusRingStyle: 'solid',
		// focusRingWidth: 'var(--ui-space-px)',
		// focusRingOffset: 'calc(var(--ui-space-px) * 2)',
	},
} satisfies ButtonConfig;
