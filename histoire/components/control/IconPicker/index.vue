<template lang="pug">
div(:class='styles.grid')
	button(
		v-for='name in options',
		:key='name',
		:class='[styles.btn, model === name && styles.active]',
		:title='name',
		@click='model === name ? (model = undefined) : (model = name)'
	)
		Icon(:name='name')
</template>

<script setup lang="ts">
	import { Icon } from '@flarian/ui';

	import type { IconPickerModel, IconPickerProps } from './types';

	const { options } = defineProps<IconPickerProps>();
	const model = defineModel<IconPickerModel>({ default: undefined });

	const styles = useCssModule('styles');
</script>

<style lang="postcss" module="styles" src="./styles.module.pcss" />
