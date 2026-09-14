import { defaultSurfaceConfig } from '../config/surface';

import { generateSurfaceCSS, isReservedColorKey } from './generateSurfaceCSS';

describe('generateSurfaceCSS', () => {
	it('генерирует CSS с дефолтными значениями (snapshot)', () => {
		expect(generateSurfaceCSS(defaultSurfaceConfig)).toMatchSnapshot();
	});

	it('генерирует :root из list[default] с шкалой и статусными цветами', () => {
		const css = generateSurfaceCSS(defaultSurfaceConfig);

		expect(css).toContain(':root {');
		expect(css).toContain('--ui-surface-50:');
		expect(css).toContain('--ui-surface-950:');
		expect(css).toContain('--ui-color-error:');
		expect(css).toContain('--ui-color-warning:');
		expect(css).toContain('--ui-color-success:');
		expect(css).toContain('--ui-color-info:');
	});

	it('статусные цвета получают авто-вычисленные on-цвета', () => {
		const css = generateSurfaceCSS(defaultSurfaceConfig);

		expect(css).toContain('--ui-color-on-error: var(--ui-color-white);');
		expect(css).toContain('--ui-color-on-success: var(--ui-color-white);');
		expect(css).toContain('--ui-color-on-info: var(--ui-color-white);');
	});

	it('добавляет блок [data-surface=name] на каждую запись, включая default', () => {
		const css = generateSurfaceCSS(defaultSurfaceConfig);

		expect(css).toContain("[data-surface='base']");
	});

	it('добавляет кастомную именованную поверхность', () => {
		const config = {
			...defaultSurfaceConfig,
			list: {
				...defaultSurfaceConfig.list,
				warm: { 500: '#a08968' },
			},
		};
		const css = generateSurfaceCSS(config);

		expect(css).toContain("[data-surface='warm']");
		expect(css).toContain('--ui-surface-500: #a08968;');
	});

	it('партиальная поверхность без status — статус не эмитится в её блоке (наследуется от :root каскадом)', () => {
		const config = {
			...defaultSurfaceConfig,
			list: {
				...defaultSurfaceConfig.list,
				warm: { 500: '#a08968' },
			},
		};
		const css = generateSurfaceCSS(config);
		const warmBlock = css.slice(css.indexOf("[data-surface='warm']"));

		expect(warmBlock).not.toContain('--ui-color-error');
	});

	it('нераспознаваемый формат статусного цвета — on-цвет не эмитится', () => {
		const config = {
			...defaultSurfaceConfig,
			list: {
				...defaultSurfaceConfig.list,
				warm: { 500: '#a08968', status: { error: 'oklch(0.5 0.1 30)' } },
			},
		};
		const css = generateSurfaceCSS(config);
		const warmBlock = css.slice(css.indexOf("[data-surface='warm']"));

		expect(warmBlock).toContain('--ui-color-error: oklch(0.5 0.1 30);');
		expect(warmBlock).not.toContain('--ui-color-on-error');
	});

	it('пустое значение статусного цвета не эмитится', () => {
		const config = {
			...defaultSurfaceConfig,
			list: {
				...defaultSurfaceConfig.list,
				warm: { 500: '#a08968', status: { error: '' } },
			},
		};
		const css = generateSurfaceCSS(config);
		const warmBlock = css.slice(css.indexOf("[data-surface='warm']"));

		expect(warmBlock).not.toContain('--ui-color-error');
	});

	it('использует кастомный attribute', () => {
		const config = { ...defaultSurfaceConfig, attribute: 'data-color-surface' };

		expect(generateSurfaceCSS(config)).toContain("[data-color-surface='base']");
	});

	it('использует кастомный default для :root', () => {
		const config = {
			...defaultSurfaceConfig,
			list: {
				...defaultSurfaceConfig.list,
				warm: { ...defaultSurfaceConfig.list.base, 500: '#a08968' },
			},
			default: 'warm',
		};
		const css = generateSurfaceCSS(config);
		const rootBlock = css.slice(0, css.indexOf('}') + 1);

		expect(rootBlock).toContain('--ui-surface-500: #a08968;');
	});
});

describe('isReservedColorKey', () => {
	it('резервирует базовые статусные имена', () => {
		expect(isReservedColorKey('error')).toBe(true);
		expect(isReservedColorKey('warning')).toBe(true);
		expect(isReservedColorKey('success')).toBe(true);
		expect(isReservedColorKey('info')).toBe(true);
	});

	it('резервирует on-варианты статусных имён', () => {
		expect(isReservedColorKey('onError')).toBe(true);
		expect(isReservedColorKey('onWarning')).toBe(true);
		expect(isReservedColorKey('onSuccess')).toBe(true);
		expect(isReservedColorKey('onInfo')).toBe(true);
	});

	it('не резервирует обычные семантические имена colors', () => {
		expect(isReservedColorKey('bg')).toBe(false);
		expect(isReservedColorKey('fg')).toBe(false);
		expect(isReservedColorKey('border')).toBe(false);
		expect(isReservedColorKey('onEmphasis')).toBe(false);
	});
});
