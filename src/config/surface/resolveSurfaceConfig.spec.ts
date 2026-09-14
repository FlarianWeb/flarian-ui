import { defaultSurfaceConfig } from './defaults';
import { resolveSurfaceConfig } from './resolveSurfaceConfig';

describe('resolveSurfaceConfig', () => {
	it('без опций — зашитая base-поверхность', () => {
		const config = resolveSurfaceConfig();

		expect(config).toEqual(defaultSurfaceConfig);
	});

	it('list передан без default — берёт первый ключ', () => {
		const config = resolveSurfaceConfig({
			list: {
				warm: {
					50: '#fff',
					500: '#a08968',
					status: { error: '#e00', warning: '#e90', success: '#0a0', info: '#00e' },
				},
				cool: {
					50: '#fff',
					500: '#6899a0',
					status: { error: '#e00', warning: '#e90', success: '#0a0', info: '#00e' },
				},
			},
		});

		expect(config.default).toBe('warm');
	});

	it('list и default переданы вместе — оба уважаются', () => {
		const config = resolveSurfaceConfig({
			list: {
				warm: { 500: '#a08968' },
				cool: { 500: '#6899a0' },
			},
			default: 'cool',
		});

		expect(config.default).toBe('cool');
		expect(config.list).toEqual({ warm: { 500: '#a08968' }, cool: { 500: '#6899a0' } });
	});

	it('зашитая base-поверхность отсутствует в результате при передаче своего списка (replace, не merge)', () => {
		const config = resolveSurfaceConfig({ list: { warm: { 500: '#a08968' } } });

		expect(config.list).toEqual({ warm: { 500: '#a08968' } });
		expect('base' in config.list).toBe(false);
	});

	it('attribute резолвится обычным deepMerge независимо от list', () => {
		const config = resolveSurfaceConfig({
			attribute: 'data-color-surface',
			list: { warm: { 500: '#a08968' } },
		});

		expect(config.attribute).toBe('data-color-surface');
	});

	it('list не передан, но default передан — default применяется поверх зашитого list', () => {
		const config = resolveSurfaceConfig({ default: 'base' });

		expect(config.list).toEqual(defaultSurfaceConfig.list);
		expect(config.default).toBe('base');
	});

	it('extend без list — встроенная base остаётся, новая поверхность добавляется', () => {
		const config = resolveSurfaceConfig({ extend: { warm: { 500: '#a08968' } } });

		expect(Object.keys(config.list)).toEqual(['base', 'warm']);
		/** Встроенный default остаётся валидным. */
		expect(config.default).toBe('base');
	});

	it('list + extend — replace списка, extend мержится поверх', () => {
		const config = resolveSurfaceConfig({
			list: { cool: { 500: '#6899a0' } },
			extend: { warm: { 500: '#a08968' } },
		});

		expect(Object.keys(config.list)).toEqual(['cool', 'warm']);
		expect(config.default).toBe('cool');
	});

	it('пустой list игнорируется — остаётся зашитая шкала с валидным default', () => {
		const config = resolveSurfaceConfig({ list: {} });

		expect(config.list).toEqual(defaultSurfaceConfig.list);
		expect(config.default).toBe(defaultSurfaceConfig.default);
	});
});
