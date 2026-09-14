import { describe, expect, it } from 'vitest';

import { prepareContractData } from './css-token-contract';

describe('prepareContractData', () => {
	const prefix = '--ui-button';

	it('разворачивает плоские и вложенные токены', () => {
		const tokens = {
			gap: '0.25rem',
			padding: {
				x: '1rem',
				y: '0.5rem',
			},
		};

		const { configTokens } = prepareContractData('', tokens, prefix);

		expect(Object.fromEntries(configTokens)).toEqual({
			'--ui-button-gap': '0.25rem',
			'--ui-button-padding-x': '1rem',
			'--ui-button-padding-y': '0.5rem',
		});
	});

	it('находит простые var() с fallback', () => {
		const css = `
			.root {
				gap: var(--ui-button-gap, 0.25rem);
				padding: var(--ui-button-padding-x, 1rem);
			}
		`;

		const { pcssUsages } = prepareContractData(css, {}, prefix);

		expect(Object.fromEntries(pcssUsages)).toEqual({
			'--ui-button-gap': ['0.25rem'],
			'--ui-button-padding-x': ['1rem'],
		});
	});

	it('находит вложенные var() внутри fallback', () => {
		const css = `
			.solid {
				background: var(
					--ui-button-hover-color,
					color-mix(
						in oklab,
						var(--ui-color-bg) var(--ui-button-hover-mix, 10%),
						var(--_color)
					)
				);
			}
		`;

		const { pcssUsages } = prepareContractData(css, {}, prefix);

		expect(pcssUsages.get('--ui-button-hover-color')).toEqual([
			'color-mix( in oklab, var(--ui-color-bg) var(--ui-button-hover-mix, 10%), var(--_color) )',
		]);
		expect(pcssUsages.get('--ui-button-hover-mix')).toEqual(['10%']);
	});

	it('собирает несколько разных fallback одного имени', () => {
		const css = `
			.base { color: var(--ui-button-color, var(--ui-color-base)); }
			.success { color: var(--ui-button-color, var(--ui-color-success)); }
		`;

		const { pcssUsages } = prepareContractData(css, {}, prefix);

		expect(pcssUsages.get('--ui-button-color')).toEqual([
			'var(--ui-color-base)',
			'var(--ui-color-success)',
		]);
	});

	it('игнорирует переменные с другим префиксом', () => {
		const css = `
			.root {
				color: var(--ui-input-color, red);
				gap: var(--ui-button-gap, 0.25rem);
			}
		`;

		const { pcssUsages } = prepareContractData(css, {}, prefix);

		expect(pcssUsages.has('--ui-input-color')).toBe(false);
		expect(pcssUsages.get('--ui-button-gap')).toEqual(['0.25rem']);
	});

	it('игнорирует закомментированные var()', () => {
		const css = `
			.root {
				/* gap: var(--ui-button-gap, 0.25rem); */
				padding: var(--ui-button-padding-x, 1rem);
			}
		`;

		const { pcssUsages } = prepareContractData(css, {}, prefix);

		expect(pcssUsages.has('--ui-button-gap')).toBe(false);
		expect(pcssUsages.get('--ui-button-padding-x')).toEqual(['1rem']);
	});

	it('не падает на незакрытом var(', () => {
		const css = 'color: var(--ui-button-color, red';

		expect(() => prepareContractData(css, {}, prefix)).not.toThrow();
	});

	it('обрабатывает var() без fallback', () => {
		const css = 'color: var(--ui-button-color);';

		const { pcssUsages } = prepareContractData(css, {}, prefix);

		expect(pcssUsages.get('--ui-button-color')).toEqual(['']);
	});

	it('схлопывает пробелы и переносы строк', () => {
		const css = `
			.root {
				gap: var(
					--ui-button-gap   ,
					0.25rem
				);
			}
		`;

		const { pcssUsages } = prepareContractData(css, {}, prefix);

		expect(pcssUsages.get('--ui-button-gap')).toEqual(['0.25rem']);
	});
});
