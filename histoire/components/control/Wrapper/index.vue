<template lang="pug">
div(:class='styles.root')
	div(:class='styles.label') {{ label }}
	div(:class='styles.content')
		slot
</template>

<script setup lang="ts">
	import type { WrapperProps } from './types';

	const { label } = defineProps<WrapperProps>();

	const styles = useCssModule('styles');
</script>

<style lang="postcss" module="styles" src="./styles.module.pcss" />
