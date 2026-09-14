import { buttonDefaults } from '~/config/components/button';
import { prepareContractData } from '~/test-utils';

import { buttonInstanceVars } from './tokens';

import pcssSource from './Button.module.pcss?raw';

const { configTokens, pcssUsages } = prepareContractData(
	pcssSource,
	buttonDefaults.tokens,
	'--ui-button'
);

describe('Button: контракт токенов (TS ↔ pcss)', () => {
	it('каждый конфиг-токен читается в pcss', () => {
		const missing = [...configTokens.keys()].filter(name => !pcssUsages.has(name));

		expect(missing).toEqual([]);
	});

	it('fallback каждого конфиг-токена в pcss равен TS-дефолту', () => {
		const mismatches: string[] = [];

		for (const [name, defaultValue] of configTokens) {
			for (const fallback of pcssUsages.get(name) ?? []) {
				if (fallback !== defaultValue) {
					mismatches.push(`${name}: pcss «${fallback}» ≠ defaults.ts «${defaultValue}»`);
				}
			}
		}

		expect(mismatches).toEqual([]);
	});

	it('pcss не читает незадекларированных --ui-button-* переменных', () => {
		const known = new Set([...configTokens.keys(), ...buttonInstanceVars]);
		const unknown = [...pcssUsages.keys()].filter(name => !known.has(name));

		expect(unknown).toEqual([]);
	});

	it('каждая инстанс-переменная из buttonInstanceVars читается в pcss', () => {
		const missing = buttonInstanceVars.filter(name => !pcssUsages.has(name));

		expect(missing).toEqual([]);
	});

	it('инстанс-переменная не совпадает с РАЗМЕРНЫМ конфиг-токеном', () => {
		const sizeSuffix = /-(xs|sm|md|lg|xl)$/;
		const badOverlap = buttonInstanceVars.filter(
			name => configTokens.has(name) && sizeSuffix.test(name)
		);

		expect(badOverlap).toEqual([]);
	});
});
