<template lang="pug">
Story(id='icon', group='Display', title='Icon')
	Variant(title='Playground', :init-state='initState')
		template(#default='{ state }')
			Icon(v-if='state.name', :name='state.name', :size='state.size')
		template(#controls='{ state }')
			ControlWrapper(label='Icon')
				ControlIconPicker(v-model='state.name', :options='allIcons')
			HstSelect(v-model='state.size', title='Size', :options='sizeOptions')

	Variant(title='Built-in icons (ui/*)')
		div(:class='$style.grid')
			div(
				v-for='[, name] in builtinEntries',
				:key='name',
				:class='$style.item',
				:title='name'
			)
				Icon(size='md', :name='name')
				span(:class='$style.label') {{ name.replace('ui/', '') }}

	Variant(title='Custom icons (test/*)')
		div(:class='$style.grid')
			div(
				v-for='name in testIcons',
				:key='name',
				:class='$style.item',
				:title='name'
			)
				Icon(size='md', :name='name')
				span(:class='$style.label') {{ name }}

	Variant(title='Sizes')
		div(:class='$style.row')
			Icon(
				v-for='s in uiSize',
				:key='s',
				name='ui/bell',
				:size='s'
			)
</template>

<script setup lang="ts">
	import { Icon, type UiIcon, uiIcon, type UiSize, uiSize } from '@flarian/ui';

	import { typedObjectEntries, typedObjectValues } from '~/utils';

	const builtinEntries = typedObjectEntries(uiIcon);
	const testIcons = ['test/brand', 'test/star'] satisfies UiIcon[];
	const allIcons = [...typedObjectValues(uiIcon), ...testIcons];

	const sizeOptions = { ...uiSize };

	/**
	 * `name` допускает `undefined`: клик по активной иконке в пикере очищает выбор.
	 */
	const initState = (): { name: UiIcon | undefined; size: UiSize } => ({
		name: 'ui/bell',
		size: 'md',
	});
</script>

<style module>
	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		padding: 1.5rem;
	}

	.item {
		cursor: default;
		user-select: none;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		align-items: center;
		width: 5rem;
		font-size: var(--ui-font-size-xs);
		color: var(--ui-color-fg);
		text-align: center;
	}

	.label {
		overflow: hidden;
		max-width: 100%;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		padding: 1.5rem;
	}
</style>
