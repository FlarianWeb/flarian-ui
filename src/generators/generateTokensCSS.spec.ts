import { defaultMotionConfig } from '../config/motion';
import { defaultTokensConfig } from '../config/tokens';
import { defaultTypographyConfig } from '../config/typography';

import { generateTokensCSS } from './generateTokensCSS';

describe('generateTokensCSS', () => {
	it('генерирует CSS с дефолтными значениями (snapshot)', () => {
		expect(
			generateTokensCSS(defaultTokensConfig, defaultTypographyConfig, defaultMotionConfig)
		).toMatchSnapshot();
	});

	it('генерирует :root с шкальными токенами', () => {
		const css = generateTokensCSS(
			defaultTokensConfig,
			defaultTypographyConfig,
			defaultMotionConfig
		);

		expect(css).toContain(':root {');
		expect(css).toContain('--ui-radius-');
		expect(css).toContain('--ui-font-size-');
		expect(css).toContain('--ui-duration-');
		expect(css).toContain('--ui-backdrop-');
	});

	it('включает типографику', () => {
		const css = generateTokensCSS(
			defaultTokensConfig,
			defaultTypographyConfig,
			defaultMotionConfig
		);

		expect(css).toContain('--ui-font-family: "Inter", sans-serif;');
		expect(css).toContain('--ui-font-size: 16px;');
		expect(css).toContain('--ui-font-weight:');
		expect(css).toContain('--ui-line-height:');
		expect(css).toContain('--ui-letter-spacing:');
		expect(css).toContain('--ui-paragraph-spacing:');
	});

	it('включает семантические умолчания motion', () => {
		const css = generateTokensCSS(
			defaultTokensConfig,
			defaultTypographyConfig,
			defaultMotionConfig
		);

		expect(css).toContain('--ui-transition-duration: var(--ui-duration-fast);');
		expect(css).toContain('--ui-transition-easing: var(--ui-easing-sine);');
	});

	it('включает шкалу font-weight', () => {
		const css = generateTokensCSS(
			defaultTokensConfig,
			defaultTypographyConfig,
			defaultMotionConfig
		);

		expect(css).toContain('--ui-font-weight-hairline: 100;');
		expect(css).toContain('--ui-font-weight-regular: 400;');
		expect(css).toContain('--ui-font-weight-bold: 700;');
		expect(css).toContain('--ui-font-weight-black: 900;');
	});

	it('включает a11y правило для анимаций', () => {
		const css = generateTokensCSS(
			defaultTokensConfig,
			defaultTypographyConfig,
			defaultMotionConfig
		);

		expect(css).toContain('[no-motion]');
		expect(css).toContain('animation-duration: 1ms !important;');
		expect(css).toContain('transition-duration: 1ms !important;');
		expect(css).toContain('scroll-behavior: auto !important;');
	});

	it('включает a11y правило для прозрачности', () => {
		const css = generateTokensCSS(
			defaultTokensConfig,
			defaultTypographyConfig,
			defaultMotionConfig
		);

		expect(css).toContain('[no-transparency]');
		expect(css).toContain('backdrop-filter: none !important;');
	});

	it('кастомная typography отражается в CSS', () => {
		const typography = {
			...defaultTypographyConfig,
			fontFamily: 'geist, sans-serif',
			fontSize: '14px',
		};
		const css = generateTokensCSS(defaultTokensConfig, typography, defaultMotionConfig);

		expect(css).toContain('--ui-font-family: geist, sans-serif;');
		expect(css).toContain('--ui-font-size: 14px;');
	});

	it('кастомная motion отражается в CSS', () => {
		const motion = {
			...defaultMotionConfig,
			transitionEasing: 'var(--ui-easing-backward)',
		};
		const css = generateTokensCSS(defaultTokensConfig, defaultTypographyConfig, motion);

		expect(css).toContain('--ui-transition-easing: var(--ui-easing-backward);');
	});
});
