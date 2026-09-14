import { mount } from '@vue/test-utils';

import { registerVariants } from '~/registry';

import { Button } from './';

/**
 * Мок runtime store: значения читаются дефолтами `defineProps` destructure
 * при доступе к пропсам — мок обязан отдавать все конфигурируемые поля,
 * иначе классы осей соберутся из `undefined`. Берём реальные дефолты пакета,
 * чтобы спека не разъезжалась с конфигом.
 */
vi.mock('~/runtime', async () => {
	const { defaultComponentConfig } = await import('~/config/components');

	return {
		getConfig: () => ({ components: defaultComponentConfig }),
		getSpriteUrl: () => '',
	};
});

describe('Button', () => {
	it('Должен рендериться с дефолтами из конфига и type="button"', () => {
		const wrapper = mount(Button, { slots: { default: 'Сохранить' } });
		const button = wrapper.get('button');

		expect(button.text()).toBe('Сохранить');
		expect(button.attributes('type')).toBe('button');
		expect(button.attributes('disabled')).toBeUndefined();
		expect(button.classes().some(c => c.includes('variant-solid'))).toBe(true);
		expect(button.classes().some(c => c.includes('color-base'))).toBe(true);
		expect(button.classes().some(c => c.includes('size-md'))).toBe(true);
		expect(button.classes().some(c => c.includes('direction-row'))).toBe(true);
	});

	it('Должен рендерить стабильный класс ui-button (в него эмитятся конфиг-токены)', () => {
		const wrapper = mount(Button);

		expect(wrapper.get('button').classes()).toContain('ui-button');
	});

	it('Должен применять служебный класс root', () => {
		const wrapper = mount(Button);
		const classes = wrapper.get('button').classes();

		expect(classes.some(c => c.includes('root'))).toBe(true);
	});

	it('Должен применять классы осей variant, color и size из пропсов', () => {
		const wrapper = mount(Button, {
			props: { variant: 'outlined', color: 'error', size: 'lg' },
		});
		const button = wrapper.get('button');

		expect(button.classes().some(c => c.includes('variant-outlined'))).toBe(true);
		expect(button.classes().some(c => c.includes('color-error'))).toBe(true);
		expect(button.classes().some(c => c.includes('size-lg'))).toBe(true);
	});

	it('Должен применять класс оси radius из пропа без инлайн-стилей', () => {
		const wrapper = mount(Button, { props: { radius: 'full' } });
		const button = wrapper.get('button');

		expect(button.classes().some(c => c.includes('radius-full'))).toBe(true);
		expect(button.attributes('style')).toBeUndefined();
	});

	it('Должен пробрасывать нативный type', () => {
		const wrapper = mount(Button, { props: { type: 'submit' } });

		expect(wrapper.get('button').attributes('type')).toBe('submit');
	});

	it('Должен рендерить label-проп как альтернативу дефолтному слоту', () => {
		const wrapper = mount(Button, { props: { label: 'Из пропа' } });

		expect(wrapper.get('button').text()).toBe('Из пропа');
	});

	it('Должен отключаться через проп disabled', () => {
		const wrapper = mount(Button, { props: { disabled: true } });

		expect(wrapper.get('button').attributes('disabled')).toBeDefined();
	});

	it('Должен оставаться в tab-order при loading: aria-busy/aria-disabled вместо нативного disabled', () => {
		const wrapper = mount(Button, { props: { loading: true } });
		const button = wrapper.get('button');

		expect(button.attributes('disabled')).toBeUndefined();
		expect(button.attributes('aria-busy')).toBe('true');
		expect(button.attributes('aria-disabled')).toBe('true');
	});

	it('Должен эмитить click с нативным событием', async () => {
		const wrapper = mount(Button, { slots: { default: 'Click' } });

		await wrapper.get('button').trigger('click');

		expect(wrapper.emitted('click')).toHaveLength(1);
		expect(wrapper.emitted('click')?.[0][0]).toBeInstanceOf(MouseEvent);
	});

	it('Должен гасить click при loading', async () => {
		const wrapper = mount(Button, { props: { loading: true } });

		await wrapper.get('button').trigger('click');

		expect(wrapper.emitted('click')).toBeUndefined();
	});

	it('Должен пробрасывать aria-label как fallthrough-атрибут для кнопки без текста', () => {
		const wrapper = mount(Button, {
			attrs: { 'aria-label': 'Избранное' },
			props: { icon: 'ui/star' },
		});

		expect(wrapper.get('button').attributes('aria-label')).toBe('Избранное');
	});

	it('Должен рендерить иконку из пропа icon', () => {
		const wrapper = mount(Button, { props: { icon: 'ui/star' } });

		expect(wrapper.findComponent({ name: 'Icon' }).exists()).toBe(true);
	});

	it('Должен рендерить содержимое слота icon вместо дефолтной иконки', () => {
		const wrapper = mount(Button, {
			props: { icon: 'ui/star' },
			slots: { icon: '<span class="custom-icon">★</span>' },
		});

		expect(wrapper.find('.custom-icon').exists()).toBe(true);
	});

	it('Должен рендерить произвольный контент в слоте trailing', () => {
		const wrapper = mount(Button, {
			slots: { default: 'Отправить', trailing: '<span class="countdown">10</span>' },
		});

		expect(wrapper.find('.countdown').exists()).toBe(true);
	});

	it('Должен показывать спиннер вместо левой иконки при loading', () => {
		const wrapper = mount(Button, { props: { loading: true, icon: 'ui/star' } });

		expect(wrapper.find('[aria-hidden="true"]').exists()).toBe(true);
		expect(wrapper.findComponent({ name: 'Icon' }).exists()).toBe(false);
	});

	it('Должен мёржить внешние классы через проп classes', () => {
		const wrapper = mount(Button, {
			props: { classes: { root: 'my-root' }, icon: 'ui/star' },
		});

		expect(wrapper.get('button').classes()).toContain('my-root');
	});

	it('Должен применять класс пользовательского варианта из registry', () => {
		registerVariants('button', { promo: '_promo_class' } as never);

		const wrapper = mount(Button, { props: { variant: 'promo' as never } });

		expect(wrapper.get('button').classes()).toContain('_promo_class');
	});

	describe('icon-only (квадратная форма)', () => {
		const isIconOnly = (wrapper: ReturnType<typeof mount>): boolean =>
			wrapper
				.get('button')
				.classes()
				.some(c => c.includes('iconOnly'));

		it('только icon (без label и trailing) — iconOnly', () => {
			const wrapper = mount(Button, { props: { icon: 'ui/star' } });

			expect(isIconOnly(wrapper)).toBe(true);
		});

		it('только trailing (без label и icon) — iconOnly', () => {
			const wrapper = mount(Button, { slots: { trailing: '<span>10</span>' } });

			expect(isIconOnly(wrapper)).toBe(true);
		});

		it('только label — не iconOnly', () => {
			const wrapper = mount(Button, { props: { label: 'Сохранить' } });

			expect(isIconOnly(wrapper)).toBe(false);
		});

		it('icon + label — не iconOnly', () => {
			const wrapper = mount(Button, { props: { icon: 'ui/star', label: 'Сохранить' } });

			expect(isIconOnly(wrapper)).toBe(false);
		});

		it('trailing + label — не iconOnly', () => {
			const wrapper = mount(Button, {
				props: { label: 'Отправить' },
				slots: { trailing: '<span>10</span>' },
			});

			expect(isIconOnly(wrapper)).toBe(false);
		});

		it('icon + trailing без label — неоднозначно, не iconOnly', () => {
			const wrapper = mount(Button, {
				props: { icon: 'ui/star' },
				slots: { trailing: '<span>10</span>' },
			});

			expect(isIconOnly(wrapper)).toBe(false);
		});

		it('ничего нет (пустая кнопка) — не iconOnly', () => {
			const wrapper = mount(Button);

			expect(isIconOnly(wrapper)).toBe(false);
		});
	});
});
