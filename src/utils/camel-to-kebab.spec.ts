import { camelToKebab } from './camel-to-kebab';

describe('camelToKebab', () => {
	it('Должен преобразовывать camelCase в kebab-case.', () => {
		expect(camelToKebab('onEmphasis')).toBe('on-emphasis');
		expect(camelToKebab('fontFamily')).toBe('font-family');
		expect(camelToKebab('textSemibold')).toBe('text-semibold');
	});

	it('Должен оставлять строку без заглавных букв как есть.', () => {
		expect(camelToKebab('bg')).toBe('bg');
		expect(camelToKebab('border')).toBe('border');
	});
});
