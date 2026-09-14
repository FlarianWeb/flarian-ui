import { deepMerge } from './deep-merge';

describe('deepMerge', () => {
	it('возвращает копию base если override null', () => {
		const base = { a: 1, b: 2 };
		const result = deepMerge(base, null);

		expect(result).toEqual({ a: 1, b: 2 });
		expect(result).not.toBe(base);
	});

	it('возвращает копию base если override undefined', () => {
		expect(deepMerge({ a: 1, b: 2 }, undefined)).toEqual({ a: 1, b: 2 });
	});

	it('мержит плоский объект — override побеждает', () => {
		expect(deepMerge({ a: 1, b: 2 }, { b: 99 })).toEqual({ a: 1, b: 99 });
	});

	it('добавляет ключи override которых нет в base', () => {
		expect(deepMerge({ a: 1 }, { a: 2, b: 3 })).toEqual({ a: 2, b: 3 });
	});

	it('рекурсивно мержит вложенные объекты', () => {
		const base = { colors: { red: '#f00', blue: '#00f' } };
		const override = { colors: { red: '#e00' } };

		expect(deepMerge(base, override)).toEqual({ colors: { red: '#e00', blue: '#00f' } });
	});

	it('не рекурсирует в массивы — заменяет целиком', () => {
		const base = { list: [1, 2, 3] };
		const override = { list: [4, 5] };

		expect(deepMerge(base, override)).toEqual({ list: [4, 5] });
	});

	it('пропускает undefined-значения в override', () => {
		expect(deepMerge({ a: 1, b: 2 }, { a: undefined })).toEqual({ a: 1, b: 2 });
	});

	it('заменяет объект скалярным значением', () => {
		const base = { nested: { x: 1 } };

		expect(deepMerge(base, { nested: 'scalar' as never })).toEqual({ nested: 'scalar' });
	});

	it('заменяет скаляр объектом', () => {
		const base = { x: 1 };

		expect(deepMerge(base, { x: { y: 2 } as never })).toEqual({ x: { y: 2 } });
	});

	it('мержит трёхуровневый объект', () => {
		const base = { a: { b: { c: 1, d: 2 } } };
		const override = { a: { b: { c: 99 } } };

		expect(deepMerge(base, override)).toEqual({ a: { b: { c: 99, d: 2 } } });
	});
});
