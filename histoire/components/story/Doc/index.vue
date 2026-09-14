<template lang="pug">
div(:class='styles.card')
	//- div(:class='$style.header')
	//- code(:class='$style.name') {{ name }}
	//- div(v-if='deps?.length', :class='$style.meta')
	//- span(:class='$style.depsLabel') uses:
	//- code(v-for='d in deps', :key='d', :class='$style.dep') {{ d }}
	//- p(v-if='when', :class='$style.when') {{ when }}
	pre(:class='styles.pre')
		code(ref='codeBlock', v-once, :class='styles.code')
			slot
</template>

<script setup lang="ts">
	import hljs from 'highlight.js/lib/core';
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import { onMounted, ref } from 'vue';

	import type { Props } from './types';

	import 'highlight.js/styles/vs2015.css';

	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);

	defineOptions({ name: 'StoryDoc' });

	const styles = useCssModule('styles');

	/**
	 * Define props
	 */
	defineProps<Props>();

	const codeBlock = ref<HTMLElement>();

	onMounted(() => {
		if (!codeBlock.value) {
			return;
		}

		hljs.highlightElement(codeBlock.value);
	});
</script>

<style lang="postcss" module="styles" src="./styles.module.pcss" />
