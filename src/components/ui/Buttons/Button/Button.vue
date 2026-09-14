<template lang="pug">
button(
	v-bind='attrs',
	:class='cx.root',
	:aria-busy='loading || undefined',
	:aria-disabled='loading || undefined',
	:disabled='disabled',
	:type='type',
	@click='onClick'
)
	Transition(
		mode='out-in',
		:enter-active-class='transition.fadeEnterActive',
		:enter-from-class='transition.fadeEnterFrom',
		:leave-active-class='transition.fadeLeaveActive',
		:leave-to-class='transition.fadeLeaveTo'
	)
		span(
			v-if='loading',
			:class='cx.spinner',
			aria-hidden='true',
			key='spinner'
		)
		span(v-else-if='hasIcon', :class='cx.iconSlot', key='icon')
			slot(name='icon')
				Icon(v-if='icon', :class='cx.icon', :name='icon')
	span(v-if='hasLabel', :class='cx.labelSlot')
		slot {{ label }}
	span(v-if='hasTrailing', :class='cx.trailingSlot')
		slot(name='trailing')
</template>

<script setup lang="ts">
	import { Icon } from '~/components/ui/Display/Icon';
	import { getVariantClass } from '~/registry';
	import { getConfig } from '~/runtime';

	import { type ButtonCx, type ButtonProps, buttonVariant } from './types';

	import transition from '~/components/shared/transitions.module.pcss';

	/**
	 * Композиции слотов и стили.
	 */
	const attrs = useAttrs();
	const slots = useSlots();
	const styles = useCssModule('styles');

	/**
	 * Параметры кнопки.
	 */
	const {
		direction = getConfig().components.button.props.direction,
		variant = getConfig().components.button.props.variant,
		color = getConfig().components.button.props.color,
		size = getConfig().components.button.props.size,
		radius = getConfig().components.button.props.radius,
		type = 'button',
		disabled = false,
		loading = false,
		label,
		icon,
		classes,
	} = defineProps<ButtonProps>();

	/**
	 * События кнопки.
	 */
	const emit = defineEmits<{ click: [event: MouseEvent] }>();

	/**
	 * Проверяем наличие слотов и иконок в кнопке.
	 */
	const hasIcon = computed(() => !!slots.icon || !!icon);
	const hasLabel = computed(() => !!slots.default || !!label);
	const hasTrailing = computed(() => !!slots.trailing);

	/**
	 * Icon-only: единственный видимый контент - `icon` или `trailing`
	 */
	const isIconOnly = computed(
		() =>
			(hasIcon.value && !hasLabel.value && !hasTrailing.value) ||
			(hasTrailing.value && !hasLabel.value && !hasIcon.value)
	);

	/**
	 * Карта классов по слотам. `UiComponentClasses` требуется стабильный `ui-button` первым в root
	 */
	const cx = computed((): ButtonCx => ({
		root: [
			'ui-button',
			styles.root,
			styles[`direction-${direction}`],
			variant in buttonVariant
				? styles[`variant-${variant}`]
				: getVariantClass('button', variant),
			styles[`color-${color}`],
			styles[`size-${size}`],
			styles[`radius-${radius}`],
			loading && styles.loading,
			isIconOnly.value && styles.iconOnly,
			classes?.root,
		],
		labelSlot: [styles.labelSlot, classes?.labelSlot],
		iconSlot: [styles.iconSlot, classes?.iconSlot],
		trailingSlot: [styles.trailingSlot, classes?.trailingSlot],
		icon: [styles.icon, classes?.icon],
		spinner: [styles.spinner, classes?.spinner],
	}));

	/**
	 * Обработчики событий.
	 */
	const onClick = (event: MouseEvent): void => {
		if (disabled || loading) {
			event.preventDefault();
			event.stopPropagation();

			return;
		}

		emit('click', event);
	};
</script>

<style lang="postcss" module="styles" src="./Button.module.pcss" />
