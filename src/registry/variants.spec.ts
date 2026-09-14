import { getVariantClass, registerVariants } from './variants';

/**
 * Потребитель типизирует имена через module augmentation
 * (`declare module '@flarian/ui' { interface RegistryButtonVariant { … } }`).
 * В спеке пакета аугментация была бы глобальной для всего typecheck
 * (расширила бы `ButtonVariant` везде), поэтому здесь имена кастуются —
 * проверяется рантайм-контракт реестра, а типовой контракт демонстрирует
 * JSDoc `registry/variants.ts`.
 */
const variants = (map: Record<string, string>) =>
	registerVariants('button', map as Parameters<typeof registerVariants>[1]);

describe('registry/variants', () => {
	it('незарегистрированный вариант даёт undefined', () => {
		expect(getVariantClass('button', 'nope')).toBeUndefined();
	});

	it('регистрирует и возвращает класс варианта', () => {
		variants({ promo: '_promo_ab12c' });

		expect(getVariantClass('button', 'promo')).toBe('_promo_ab12c');
	});

	it('повторная регистрация дополняет реестр, не затирая прежние варианты', () => {
		variants({ festive: '_festive_cd34e' });

		expect(getVariantClass('button', 'promo')).toBe('_promo_ab12c');
		expect(getVariantClass('button', 'festive')).toBe('_festive_cd34e');
	});

	it('перерегистрация имени заменяет класс', () => {
		variants({ promo: '_promo_v2' });

		expect(getVariantClass('button', 'promo')).toBe('_promo_v2');
	});
});
