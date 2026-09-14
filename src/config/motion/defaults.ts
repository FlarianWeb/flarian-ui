import type { DefaultMotionConfig } from './types';

export const defaultMotionConfig = {
	transitionDuration: 'var(--ui-duration-fast)',
	transitionEasing: 'var(--ui-easing-sine)',
} satisfies DefaultMotionConfig;
