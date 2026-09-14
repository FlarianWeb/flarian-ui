import { arrayOfAll } from './array-of-all';

type Key = 'a' | 'b' | 'c';

describe('arrayOfAll', () => {
	it('возвращает переданный массив как есть (identity)', () => {
		const input = ['a', 'b', 'c'] satisfies Key[];

		expect(arrayOfAll<Key>()(input)).toBe(input);
	});

	it('typecheck: полный список юниона компилируется', () => {
		arrayOfAll<Key>()(['a', 'b', 'c']);
	});

	it('typecheck: пропущенный член юниона — ошибка компиляции', () => {
		// @ts-expect-error — 'c' пропущен, массив не покрывает Key целиком
		arrayOfAll<Key>()(['a', 'b']);
	});

	it('typecheck: член, не входящий в юнион, — ошибка компиляции', () => {
		// @ts-expect-error — 'd' не является членом Key
		arrayOfAll<Key>()(['a', 'b', 'c', 'd']);
	});
});
