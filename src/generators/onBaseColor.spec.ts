import { parseColor, pickOnColor, relativeLuminance } from './onBaseColor';

describe('parseColor', () => {
	it('Должен парсить hex-форматы', () => {
		expect(parseColor('#fff')).toEqual([255, 255, 255]);
		expect(parseColor('#2eb82e')).toEqual([46, 184, 46]);
		expect(parseColor('#2eb82eff')).toEqual([46, 184, 46]);
		expect(parseColor('  #FACC15 ')).toEqual([250, 204, 21]);
	});

	it('Должен парсить rgb()/rgba()', () => {
		expect(parseColor('rgb(46, 184, 46)')).toEqual([46, 184, 46]);
		expect(parseColor('rgba(250 204 21 / 0.5)')).toEqual([250, 204, 21]);
	});

	it('Должен возвращать null для неподдерживаемых форматов', () => {
		expect(parseColor('oklch(70% 0.1 150)')).toBeNull();
		expect(parseColor('var(--brand)')).toBeNull();
		expect(parseColor('#gggggg')).toBeNull();
		expect(parseColor('rgb(300, 0, 0)')).toBeNull();
	});
});

describe('relativeLuminance', () => {
	it('Должен возвращать края диапазона для чёрного и белого', () => {
		expect(relativeLuminance([0, 0, 0])).toBe(0);
		expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 5);
	});
});

describe('pickOnColor', () => {
	it('Тёмные и средние цвета получают светлый текст', () => {
		expect(pickOnColor('#000000')).toBe('white');
		expect(pickOnColor('#dc2626')).toBe('white');
		/** зелёный из кейса: перцептивно требует светлый текст в обеих схемах */
		expect(pickOnColor('#2eb82e')).toBe('white');
	});

	it('Светлые цвета получают тёмный текст', () => {
		expect(pickOnColor('#ffffff')).toBe('black');
		/** жёлтый из кейса: тёмный текст в обеих схемах */
		expect(pickOnColor('#facc15')).toBe('black');
	});

	it('Непарсибельный цвет — null (откат к scheme-поведению)', () => {
		expect(pickOnColor('oklch(70% 0.1 150)')).toBeNull();
	});
});
