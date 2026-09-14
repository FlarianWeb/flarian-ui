import { typedObjectEntries } from './typed-object-entries';

const objectMock = { x: 42, y: 'abc' };

describe('typedObjectEntries', () => {
	it('Должен возвращать записи с правильными парами ключ-значение.', () => {
		const entries = typedObjectEntries(objectMock);

		expect(entries).toEqual([
			['x', objectMock.x],
			['y', objectMock.y],
		]);
	});

	it('Должен сохранять типы ключей и значений', () => {
		const entries = typedObjectEntries(objectMock);

		expectTypeOf<typeof entries>().toEqualTypeOf<(['x', number] | ['y', string])[]>();
	});
});
