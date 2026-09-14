<template lang="pug">
svg(:class='cx.root', aria-hidden='true', focusable='false')
	use(:href='href')
</template>

<script setup lang="ts">
	import type { UiComponentCx } from '~/components/shared/classes';
	import type { UiSize } from '~/components/shared/props';
	import type { UiIcon } from '~/registry';
	import { getConfig, getSpriteUrl } from '~/runtime';

	type Props = {
		name: UiIcon;
		size?: number | UiSize;
	};

	const styles = useCssModule();

	const props = withDefaults(defineProps<Props>(), {
		size: getConfig().components.icon.props.size,
	});

	// const sizeMap: Record<UiSize, string> = {
	// 	xs: 'var(--ui-font-size-xs)',
	// 	sm: 'var(--ui-font-size-sm)',
	// 	md: 'var(--ui-font-size-md)',
	// 	lg: 'var(--ui-font-size-lg)',
	// 	xl: 'var(--ui-font-size-xl)',
	// };

	/**
	 * URL-режим — `sprite.svg#id`, inline-режим (пустой URL) — same-document `#id`.
	 */
	const href = computed(() => `${getSpriteUrl()}#${props.name}`);

	/**
	 * `UiComponentCx` типом требует стабильный `ui-icon` первым в root —
	 * в него плагин эмитит конфиг-токены компонента.
	 */
	const cx = computed((): UiComponentCx<'icon', 'root'> => ({
		root: ['ui-icon', styles.icon],
	}));

	// const sizeStyle = computed(() => {
	// 	const size = props.size;
	// 	const value = typeof size === 'number' ? `${size}px` : sizeMap[size];

	// 	return { width: value, height: value };
	// });
</script>

<style module>
	/*
	* `--ui-icon-size` — публичный хук Icon: единственное место, которое
	* решает, как применить размер. Любой предок (например Button через
	* свой класс `.icon`) может задать эту переменную вместо того, чтобы
	* состязаться за `width`/`height` напрямую — конфликт специфичности
	* между двумя `.icon`-правилами из разных компонентов невозможен,
	* потому что конкурирующей записи `width`/`height` тут только одна.
	*/
	.icon {
		display: block;
		flex-shrink: 0;
		width: var(--ui-icon-size, 1em);
		height: var(--ui-icon-size, 1em);
		fill: currentcolor;
	}
</style>
