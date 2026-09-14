import { typedObjectKeys } from './typed-object-keys';

const objectMock = { x: 42, y: 'abc' };

describe('typedObjectKeys', () => {
	it('Должен возвращать массив с правильными ключами объекта.', () => {
		const entries = typedObjectKeys(objectMock);

		expect(entries).toEqual(['x', 'y']);
	});

	it('Должен сохранять типы ключей', () => {
		const entries = typedObjectKeys(objectMock);

		expectTypeOf<typeof entries>().toEqualTypeOf<('x' | 'y')[]>();
	});
});
