import { mount } from '@vue/test-utils';

import { Icon } from './';

/**
 * Мок runtime store: `withDefaults` компонента читает конфиг при обращении
 * к пропсам; `spriteUrlMock` переключает URL-/inline-режим спрайта.
 */
const { spriteUrl } = vi.hoisted(() => ({ spriteUrl: { value: '' } }));

vi.mock('~/runtime', async () => {
	const { defaultComponentConfig } = await import('~/config/components');

	return {
		getConfig: () => ({ components: defaultComponentConfig }),
		getSpriteUrl: () => spriteUrl.value,
	};
});

describe('Icon', () => {
	beforeEach(() => {
		spriteUrl.value = '';
	});

	it('inline-режим (пустой URL): href — same-document #id', () => {
		const wrapper = mount(Icon, { props: { name: 'ui/star' as never } });

		expect(wrapper.get('use').attributes('href')).toBe('#ui/star');
	});

	it('URL-режим: href — sprite.svg#id', () => {
		spriteUrl.value = '/assets/sprite.svg';

		const wrapper = mount(Icon, { props: { name: 'ui/star' as never } });

		expect(wrapper.get('use').attributes('href')).toBe('/assets/sprite.svg#ui/star');
	});

	it('Должен рендерить стабильный класс ui-icon и быть скрытым от скринридера', () => {
		const wrapper = mount(Icon, { props: { name: 'ui/star' as never } });
		const svg = wrapper.get('svg');

		expect(svg.classes()).toContain('ui-icon');
		expect(svg.attributes('aria-hidden')).toBe('true');
		expect(svg.attributes('focusable')).toBe('false');
	});

	/**
	 * Тесты пропа `size` вернутся вместе с решением по `sizeStyle`
	 * (сейчас закомментирован в компоненте — размер следует за font-size, 1em).
	 */
});
