import type { DefaultDurationConfig } from './types';

export const defaultDurationConfig = {
	fast: '200ms',
	normal: '400ms',
	slow: '800ms',
} satisfies DefaultDurationConfig;
