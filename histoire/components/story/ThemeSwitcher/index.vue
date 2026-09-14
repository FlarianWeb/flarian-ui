<template lang="pug">
div(ref='root', :class='$style.root')
	button(
		:class='[$style.trigger, theme === null && $style.noTheme]',
		:title='`Тема: ${theme ?? "нет"}`',
		@click='toggle'
	)
	div(v-if='isOpen', :class='$style.popover')
		button(
			:class='[$style.swatch, $style.noTheme, theme === null && $style.active]',
			title='Без темы',
			@click='select(null)'
		)
		button(
			v-for='name in themeNames',
			:key='name',
			:class='[$style.swatch, name === theme && $style.active]',
			:data-theme='name',
			:title='name',
			@click='select(name)'
		)
</template>

<script setup lang="ts">
	import { type UiTheme, useConfig, useTheme } from '@flarian/ui';

	const { theme, setTheme, clearTheme } = useTheme();
	const { theme: themeConfig } = useConfig();

	const root = ref<HTMLElement | null>(null);
	const isOpen = ref(false);

	/**
	 * Только имена (`UiTheme[]`, тот же тип, что и у setTheme()) — публичный
	 * интерфейс, без сырого конфига плагина. Цвет свотча берётся не из JS,
	 * а из CSS: `data-theme` на самой кнопке включает scoped-темизацию,
	 * `--ui-theme-base` внутри неё резолвится в цвет этой темы (см. .swatch).
	 */
	const themeNames = computed(() => themeConfig.list);

	const select = (key: null | UiTheme) => {
		if (key === null) {
			clearTheme();
		} else {
			setTheme(key);
		}

		isOpen.value = false;
	};

	const toggle = () => {
		isOpen.value = !isOpen.value;
	};

	const onClickOutside = (e: MouseEvent) => {
		if (root.value && !root.value.contains(e.target as Node)) {
			isOpen.value = false;
		}
	};

	onMounted(() => document.addEventListener('click', onClickOutside));
	onUnmounted(() => document.removeEventListener('click', onClickOutside));
</script>

<style module>
	.root {
		position: relative;
		display: flex;
		align-items: center;
	}

	.trigger {
		--_bg: var(--ui-theme-base, transparent);
		--_border: var(--ui-theme-base, var(--ui-color-fg));

		cursor: pointer;
		flex-shrink: 0;
		width: 15px;
		height: 15px;
		padding: 0;
		background: var(--_bg);
		border: 1.5px solid var(--_border);
		border-radius: 50%;
		transition: transform 0.15s;

		&:hover {
			transform: scale(1.15);
		}
	}

	.noTheme {
		--_bg: transparent;
		--_border: var(--ui-color-fg);
	}

	.popover {
		position: absolute;
		z-index: 9999;
		top: calc(100% + 10px);
		right: 0;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 12px;
		padding: 16px;
		background: color-mix(in srgb, var(--ui-color-box) 90%, transparent);
		backdrop-filter: blur(8px);
		border-radius: 16px;
		box-shadow: var(--ui-shadow-sm);
	}

	.swatch {
		--_bg: var(--ui-theme-base, transparent);
		--_border: var(--ui-theme-base, var(--ui-color-fg));

		cursor: pointer;
		width: 15px;
		height: 15px;
		padding: 0;
		background: var(--_bg);
		border: 1.5px solid var(--_border);
		border-radius: 50%;
		transition: transform 0.15s;

		&.noTheme {
			--_bg: transparent;
			--_border: var(--ui-color-fg);
		}

		&:hover {
			transform: scale(1.2);
		}

		&.active {
			outline: 2px solid var(--_border);
			outline-offset: 2px;
		}
	}
</style>
