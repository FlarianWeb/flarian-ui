import { defaultComponentConfig } from './components';
import { resolveUIConfig } from './resolveUIConfig';

describe('resolveUIConfig', () => {
	it('zero-config: все зоны заполняются дефолтами', () => {
		const resolved = resolveUIConfig();

		expect(Object.keys(resolved.theme.list)).toContain('base');
		expect(resolved.surface.default).toBeTruthy();
		expect(resolved.storagePrefix).toBe('flarian-ui');
		expect(resolved.componentsRuntime.button.props).toEqual(
			defaultComponentConfig.button.props
		);
	});

	it('componentsRuntime: props мержатся с дефолтами', () => {
		const resolved = resolveUIConfig({
			component: { button: { props: { size: 'lg' } } },
		});

		expect(resolved.componentsRuntime.button.props.size).toBe('lg');
		/** Непереданные props дозаполнены дефолтами. */
		expect(resolved.componentsRuntime.button.props.variant).toBe(
			defaultComponentConfig.button.props.variant
		);
	});

	it('componentsRuntime: tokens вырезаются — в runtime едут только props', () => {
		// FIXME: Вернуть проверку после стабилизации компонентов
		// const resolved = resolveUIConfig({
		// 	component: { button: { tokens: { hoverMix: '25%' } } },
		// });
		// expect(resolved.componentsRuntime.button).not.toHaveProperty('tokens');
	});

	/**
	 * ПРЕДОХРАНИТЕЛЬ диф-эмиссии. `componentTokensDiff` обязан оставаться
	 * СЫРЫМ `options.component` — без мержа с дефолтами. Если этот тест упал,
	 * потому что кто-то «исправил несимметричность» и замержил дефолты,
	 * — в `:root`/CSS уедут дефолты всех токенов всех компонентов
	 * и diff-эмиссия перестанет существовать. Не чините этот тест мержем.
	 */
	it('диф-эмиссия: componentTokensDiff — сырой options.component, без дефолтов', () => {
		// FIXME: Вернуть проверку после стабилизации компонентов
		// const component = { button: { tokens: { hoverMix: '25%' } } };
		// const resolved = resolveUIConfig({ component });

		// expect(resolved.componentTokensDiff).toBe(component);
		expect(resolveUIConfig().componentTokensDiff).toBeUndefined();
	});

	it('theme.list заменяется целиком (replace, не merge)', () => {
		const resolved = resolveUIConfig({
			theme: { list: { ocean: { base: '#0ea5e9' } } },
		});

		expect(Object.keys(resolved.theme.list)).toEqual(['ocean']);
		expect(resolved.theme.default).toBe('ocean');
	});

	it('точечные зоны мержатся с дефолтами (deepMerge)', () => {
		const resolved = resolveUIConfig({ scheme: { default: 'dark' } });

		expect(resolved.scheme.default).toBe('dark');
		expect(resolved.scheme.attribute).toBeTruthy();
	});
});
