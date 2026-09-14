import { typedObjectValues } from './typed-object-values';

const objectMock = { x: 42, y: 'abc' };

describe('typedObjectValues', () => {
	it('Должен возвращать массив с правильными значениями объекта.', () => {
		const values = typedObjectValues(objectMock);

		expect(values).toEqual([objectMock.x, objectMock.y]);
	});

	it('Должен сохранять типы значений', () => {
		const values = typedObjectValues(objectMock);

		expectTypeOf<typeof values>().toEqualTypeOf<(number | string)[]>();
	});
});
