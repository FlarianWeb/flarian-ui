<template lang="pug">
Story(id='button', group='Buttons', title='Button')
	Variant(title='Playground', :init-state='initState')
		template(#default='{ state }')
			StoryPreview
				Button(
					:color='state.color',
					:direction='state.direction',
					:disabled='state.disabled',
					:icon='state.icon',
					:label='state.label',
					:loading='state.loading',
					:radius='state.radius',
					:size='state.size',
					:variant='state.variant'
				)
		template(#controls='{ state }')
			HstSelect(v-model='state.direction', title='Direction', :options='directionOptions')
			HstSelect(v-model='state.variant', title='Variant', :options='variantOptions')
			HstSelect(v-model='state.color', title='Color', :options='colorOptions')
			HstSelect(v-model='state.size', title='Size', :options='sizeOptions')
			HstSelect(v-model='state.radius', title='Radius', :options='radiusOptions')
			HstText(v-model='state.label', title='Label')
			ControlWrapper(label='Icon')
				ControlIconPicker(v-model='state.icon', :options='iconOptions')
			HstCheckbox(
				title='Loading',
				:model-value='state.loading',
				@update:model-value='state.loading = toBool($event)'
			)
			HstCheckbox(
				title='Disabled',
				:model-value='state.disabled',
				@update:model-value='state.disabled = toBool($event)'
			)

	Variant(title='Matrix')
		StoryPreview
			div(:class='$style.matrix')
				template(v-for='v in variants', :key='v')
					div(:class='$style.matrixLabel') {{ v }}
					div(:class='$style.row')
						Button(
							v-for='c in uiColor',
							:key='c',
							:color='c',
							:variant='v'
						) {{ c }}

	Variant(title='Sizes')
		StoryPreview
			div(:class='$style.row')
				Button(v-for='s in uiSize', :key='s', :size='s') {{ s }}

	Variant(title='Radius')
		StoryPreview
			div(:class='$style.row')
				Button(v-for='r in uiRadius', :key='r', :radius='r') {{ r }}

	Variant(title='Icons')
		StoryPreview
			div(:class='$style.row')
				Button(:icon='storyIcon') Icon
				Button(variant='outlined', :icon='storyIcon') Outlined
				Button(variant='ghost', :icon='storyIcon') Ghost
				Button(variant='link', :icon='storyIcon') Link
			div(:class='[$style.row, $style.rowTop]')
				Button
					template(#icon) ★
					| Via slot
				Button(:icon='storyIcon')
					| Trailing
					template(#trailing)
						Icon(name='ui/star')
				Button(loading, :icon='storyIcon') Spinner
				Button(aria-label='Избранное', :icon='storyIcon')

	Variant(title='Icon only (квадратная форма)')
		StoryPreview
			div(:class='$style.row')
				Button(
					v-for='s in uiSize',
					:key='s',
					aria-label='Избранное',
					:icon='storyIcon',
					:size='s'
				)
			div(:class='$style.row')
				Button(aria-label='Счётчик')
					template(#trailing)
						Icon(name='ui/star')

	Variant(title='States')
		StoryPreview
			div(:class='$style.row')
				Button Default
				Button(disabled) Disabled
				Button(loading) Loading
				Button(disabled, variant='outlined') Outlined disabled

	Variant(title='Customization')
		StoryPreview
			div(:class='$style.row')
				Button(style='--ui-button-color: #9933ff') Public var color
				Button(style='--ui-button-radius: 0') Public var radius
				Button(style='--ui-button-padding-y: 0.9375rem; --ui-button-padding-x: 2rem') Public var geometry
				Button(style='--ui-button-hover-color: var(--ui-color-black)') Hover black
				Button(data-theme='red') Scoped theme

	Variant(title='Events')
		StoryPreview
			div(:class='$style.row')
				Button(@click='logEvent("click", $event)') Click me
</template>

<docs lang="md">
# Button

Кнопка с осями оформления: `variant` (форма) × `color` (цвет) × `size`
(геометрия) × `radius` (скругление), с опциональными иконками и loading.

## Использование

```vue
<Button variant="solid" color="base" size="md">Сохранить</Button>
<Button variant="soft" color="error">Удалить</Button>
<Button type="submit">Отправить форму</Button>
```

## Props

| Prop        | Тип                                                    | По умолчанию | Описание                                    |
| ----------- | ------------------------------------------------------ | ------------ | ------------------------------------------- |
| `variant`   | `'solid' \| 'outlined' \| 'soft' \| 'ghost' \| 'link'` | `'solid'`    | Визуальный вариант (форма)                  |
| `color`     | `UiColor` (`base/neutral/success/warning/error/info`)  | `'base'`     | Цветовая ось                                |
| `direction` | `'row' \| 'column'`                                    | `'row'`      | Направление элементов                       |
| `size`      | `UiSize`                                               | `'md'`       | Размер кнопки (высоты 24/32/40/48/56px)     |
| `radius`    | `UiRadius`                                             | `'xs'`       | Радиус скругления                           |
| `type`      | `'button' \| 'submit' \| 'reset'`                      | `'button'`   | Нативный type                               |
| `disabled`  | `boolean`                                              | `false`      | Отключённое состояние (нативный `disabled`) |
| `loading`   | `boolean`                                              | `false`      | Спиннер + `aria-busy`, активация гасится    |
| `label`     | `string`                                               | —            | Текст — альтернатива дефолтному слоту       |
| `icon`      | `UiIcon`                                               | —            | Иконка слева — альтернатива слоту `icon`    |
| `classes`   | `ButtonClasses`                                        | —            | Внешние классы по слотам (Styles API)       |

Дефолты `variant`/`color`/`size`/`radius` переопределяются глобально через
`uiPlugin({ component: { button: { … } } })`.

Кнопка без текста обязана иметь доступное имя — передайте обычный атрибут
`aria-label` (fallthrough на корневой `<button>`), отдельного пропа нет.

**Icon-only:** если виден только `icon` ИЛИ только `trailing` (без текста),
кнопка автоматически становится квадратной — горизонтальный паддинг
выравнивается по вертикальному. Если заняты обе стороны без текста между
ними — неоднозначно, квадратная форма не применяется.

## События

| Событие | Payload      | Описание                             |
| ------- | ------------ | ------------------------------------ |
| `click` | `MouseEvent` | Не эмитится при `disabled`/`loading` |

## Слоты

| Слот       | Описание                                                   |
| ---------- | ---------------------------------------------------------- |
| `default`  | Контент кнопки (приоритетнее пропа `label`)                |
| `icon`     | Слева от текста (приоритетнее пропа `icon`)                |
| `trailing` | Произвольный контент справа: иконка, счётчик, бейдж и т.п. |

## Конфиг-токены (`uiPlugin`)

Геометрия и деривация состояний настраиваются build-time — плагин эмитит
только переданный diff в стабильный класс `.ui-button` (в `:root` ничего
не попадает), дефолты живут в CSS компонента:

```ts
uiPlugin({
	component: {
		button: {
			props: { size: 'lg' },
			tokens: {
				paddingY: { md: '0.75rem' }, // --ui-button-padding-y-md
				paddingX: { md: '1.25rem' }, // --ui-button-padding-x-md
				hoverMix: '25%', // сила hover-сдвига всех вариантов
			},
		},
	},
});
```

Те же переменные (`--ui-button-<prop>-<size>`) можно задать и обычным CSS.
Полный список токенов и их дефолтов — `config/components/button/defaults.ts`.

## Инстанс-переменные (Styles API)

По умолчанию **не определены** — их отсутствие означает «работает ось».
Работают и глобально (`:root { … }`), и точечно (`style`/класс на кнопке или
её родителе) — выигрывают у значения любой оси и у конфиг-токенов.

Актуальный список — `buttonInstanceVars` в `types.ts` компонента (контракт
проверяется `Button.contract.spec.ts`):

| Переменная                 | Перебивает       | Назначение                          |
| -------------------------- | ---------------- | ----------------------------------- |
| `--ui-button-color`        | ось `color`      | Основной цвет                       |
| `--ui-button-on-color`     | ось `color`      | Цвет контента поверх solid          |
| `--ui-button-hover-color`  | деривацию hover  | Цвет hover-состояния целиком        |
| `--ui-button-active-color` | деривацию active | Цвет active-состояния целиком       |
| `--ui-button-padding-y`    | ось `size`       | Вертикальные отступы (высота)       |
| `--ui-button-padding-x`    | ось `size`       | Горизонтальные отступы              |
| `--ui-button-font-size`    | ось `size`       | Размер шрифта (иконки следуют, 1em) |
| `--ui-button-line-height`  | ось `size`       | Высота строки                       |
| `--ui-button-gap-x`        | ось `size`       | Отступ между иконкой и текстом      |
| `--ui-button-gap-y`        | ось `size`       | Вертикальный отступ (column)        |
| `--ui-button-radius`       | ось `radius`     | Скругление                          |

## Слоты стилизации (`classes`)

`root` · `iconSlot` · `labelSlot` · `trailingSlot` · `icon` · `spinner` — стили кита живут в
`@layer flarian-ui`, поэтому внешний unlayered-класс выигрывает без
`!important`.
</docs>

<script setup lang="ts">
	import {
		Button,
		type ButtonProps,
		Icon,
		// type UiColor,
		uiColor,
		type UiIcon,
		uiIcon,
		// type UiRadius,
		uiRadius,
		// type UiSize,
		uiSize,
	} from '@flarian/ui';
	import { logEvent } from 'histoire/client';

	import { getConfig } from '~/runtime';
	import { typedObjectValues } from '~/utils';

	const directions = ['row', 'column'] as const;
	const variants = ['solid', 'outlined', 'soft', 'ghost', 'link'] as const;

	// type ButtonDirection = (typeof directions)[number];
	// type Variant = (typeof variants)[number];

	const directionOptions = Object.fromEntries(directions.map(v => [v, v]));
	const variantOptions = Object.fromEntries(variants.map(v => [v, v]));
	const colorOptions = { ...uiColor };
	const sizeOptions = { ...uiSize };
	const radiusOptions = { ...uiRadius };
	const iconOptions = typedObjectValues(uiIcon);
	const storyIcon: UiIcon = 'ui/star';

	/**
	 * `HstCheckbox` эмитит `boolean | 'true' | 'false'` — нормализуем к boolean.
	 */
	const toBool = (value: 'false' | 'true' | boolean): boolean =>
		value === true || value === 'true';

	function initState(): ButtonProps {
		return {
			label: 'Button',
			variant: getConfig().components.button.props.variant,
			color: getConfig().components.button.props.color,
			size: getConfig().components.button.props.size,
			radius: getConfig().components.button.props.radius,
			icon: undefined,
			loading: false,
			disabled: false,
			direction: getConfig().components.button.props.direction,
		};
	}
</script>

<style module>
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
		padding: 0.5rem 1.5rem;
	}

	.rowTop {
		align-items: flex-start;
	}

	.matrix {
		padding: 1rem 0;
	}

	.matrixLabel {
		padding: 0.75rem 1.5rem 0;
		font-family: var(--ui-font-family);
		font-size: var(--ui-font-size-xs);
		color: color-mix(in srgb, var(--ui-color-fg) 55%, transparent);
	}
</style>
