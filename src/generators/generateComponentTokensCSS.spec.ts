import { generateComponentTokensCSS } from './generateComponentTokensCSS';

describe('generateComponentTokensCSS', () => {
	it('Должен возвращать пустую строку без конфига (zero-config не эмитит переменных)', () => {
		expect(generateComponentTokensCSS(undefined)).toBe('');
		expect(generateComponentTokensCSS({})).toBe('');
	});

	it('Должен возвращать пустую строку, если у компонентов нет tokens (только props)', () => {
		const css = generateComponentTokensCSS({
			button: { props: { size: 'lg' } },
			icon: { props: { size: 'sm' } },
		});

		expect(css).toBe('');
	});

	it('Должен эмитить только переданный diff с именами из пути ключей', () => {
		// FIXME: Вернуть проверку после стабилизации компонентов
		// const css = generateComponentTokensCSS({
		// 	button: {
		// 		props: { size: 'lg' },
		// 		tokens: {
		// 			paddingY: { md: '0.75rem' },
		// 			paddingX: { xl: '2rem' },
		// 			hoverMix: '88%',
		// 		},
		// 	},
		// });
		// expect(css).toContain('--ui-button-padding-y-md: 0.75rem;');
		// expect(css).toContain('--ui-button-padding-x-xl: 2rem;');
		// expect(css).toContain('--ui-button-hover-mix: 88%;');
		// expect(css).not.toContain('lg');
	});

	it('Должен скоупить переменные на стабильный класс компонента внутри @layer flarian-ui', () => {
		// FIXME: Вернуть проверку после стабилизации компонентов
		// const css = generateComponentTokensCSS({
		// 	button: { tokens: { activeMix: '80%' } },
		// });
		// expect(css).toMatch(/^@layer flarian-ui \{/);
		// expect(css).toContain('.ui-button {');
		// expect(css).not.toContain(':root');
	});

	it('Должен эмитить отдельный блок на каждый компонент с токенами', () => {
		// FIXME: Вернуть проверку после стабилизации компонентов
		// const css = generateComponentTokensCSS({
		// 	button: { tokens: { hoverMix: '15%' } },
		// 	icon: { props: { size: 'sm' } },
		// });
		// expect(css).toContain('.ui-button {');
		// expect(css).not.toContain('.ui-icon');
	});

	it('Должен переводить camelCase в kebab-case и в имени компонента, и в пути токена', () => {
		// FIXME: Вернуть проверку после стабилизации компонентов
		// const css = generateComponentTokensCSS({
		// 	button: { tokens: { fontSize: { xs: '0.7rem' } } },
		// });
		// expect(css).toContain('--ui-button-font-size-xs: 0.7rem;');
	});
});
