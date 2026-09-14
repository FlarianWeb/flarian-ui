<template lang="pug">
div(:class='styles.root')
	slot
</template>

<script setup lang="ts">
	const styles = useCssModule('styles');
</script>

<style lang="css" module="styles" src="./styles.module.pcss" />
