import type { DefaultEasingConfig } from './types';

export const defaultEasingConfig = {
	linear: 'linear',

	ease: 'ease-in-out',
	easeIn: 'ease-in',
	easeOut: 'ease-out',

	sine: 'cubic-bezier(0.45, 0.05, 0.55, 0.95)',
	sineIn: 'cubic-bezier(0.47, 0, 0.74, 0.71)',
	sineOut: 'cubic-bezier(0.39, 0.58, 0.57, 1)',

	quadratic: 'cubic-bezier(0.46, 0.03, 0.52, 0.96)',
	quadraticIn: 'cubic-bezier(0.55, 0.09, 0.68, 0.53)',
	quadraticOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',

	cubic: 'cubic-bezier(0.65, 0.05, 0.36, 1)',
	cubicIn: 'cubic-bezier(0.55, 0.06, 0.68, 0.19)',
	cubicOut: 'cubic-bezier(0.22, 0.61, 0.36, 1)',

	quartic: 'cubic-bezier(0.77, 0, 0.18, 1)',
	quarticIn: 'cubic-bezier(0.9, 0.03, 0.69, 0.22)',
	quarticOut: 'cubic-bezier(0.17, 0.84, 0.44, 1)',

	quintic: 'cubic-bezier(0.76, 0.05, 0.86, 0.06)',
	quinticIn: 'cubic-bezier(0.23, 1, 0.32, 1)',
	quinticOut: 'cubic-bezier(0.86, 0, 0.07, 1)',

	exponential: 'cubic-bezier(1, 0, 0, 1)',
	exponentialIn: 'cubic-bezier(0.95, 0.05, 0.8, 0.04)',
	exponentialOut: 'cubic-bezier(0.19, 1, 0.22, 1)',

	circular: 'cubic-bezier(0.79, 0.14, 0.15, 0.86)',
	circularIn: 'cubic-bezier(0.6, 0.04, 0.98, 0.34)',
	circularOut: 'cubic-bezier(0.08, 0.82, 0.17, 1)',

	backward: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
	backwardIn: 'cubic-bezier(0.6, -0.28, 0.74, 0.05)',
	backwardOut: 'cubic-bezier(0.18, 0.89, 0.32, 1.28)',
} satisfies DefaultEasingConfig;
