/**
 * Scaffold нового компонента: `pnpm scaffold <Group>/<Name>`,
 * например `pnpm scaffold Display/Badge`.
 *
 * Генерирует папку компонента (vue + pcss + types + index + story)
 * и конфиг-зону (`src/config/components/<name>`), а также регистрирует
 * компонент в баррелях (`src/components/index.ts`,
 * `src/config/components/{types,defaults}.ts`). Существующие файлы
 * никогда не перезаписывает. Экспорт из публичного API (`src/index.ts`)
 * остаётся ручным решением — скрипт напомнит.
 *
 * После генерации: `pnpm lint:fix && pnpm typecheck`.
 */
/* eslint-disable no-console -- CLI-скрипт: console — его интерфейс вывода */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const arg = process.argv[2];

if (!arg || !/^[A-Z][A-Za-z]+\/[A-Z][A-Za-z]+$/.test(arg)) {
	console.error(
		'Использование: pnpm scaffold <Group>/<Name>, например: pnpm scaffold Display/Badge'
	);
	process.exit(1);
}

const [group, name] = arg.split('/');
const camel = name[0].toLowerCase() + name.slice(1);
const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const componentDir = path.join(root, 'src/components/ui', group, name);
const configDir = path.join(root, 'src/config/components', camel);

/**
 * Пишет файл, только если его ещё нет — scaffold не перезаписывает работу.
 */
const write = (filePath: string, content: string): void => {
	if (existsSync(filePath)) {
		console.log(`- пропущен (существует): ${path.relative(root, filePath)}`);

		return;
	}

	mkdirSync(path.dirname(filePath), { recursive: true });
	writeFileSync(filePath, content);
	console.log(`+ создан: ${path.relative(root, filePath)}`);
};

/**
 * Вставляет фрагмент в существующий файл по якорю. Файл не трогается,
 * если фрагмент уже есть; при отсутствии якоря печатает ручную инструкцию.
 */
const insert = (filePath: string, anchor: string, addition: string, manual: string): void => {
	const source = readFileSync(filePath, 'utf-8');

	if (source.includes(addition.trim())) {
		return;
	}

	if (!source.includes(anchor)) {
		console.warn(
			`! не найден якорь в ${path.relative(root, filePath)} — добавьте вручную:\n${manual}`
		);

		return;
	}

	writeFileSync(filePath, source.replace(anchor, `${addition}${anchor}`));
	console.log(`~ обновлён: ${path.relative(root, filePath)}`);
};

write(
	path.join(componentDir, `${name}.vue`),
	`<template lang="pug">
div(:class='cx.root')
	slot
</template>

<script setup lang="ts">
	import type { UiComponentClasses } from '~/components/shared/classes';

	import type { ${name}Props, ${name}Slot } from './types';

	const styles = useCssModule('styles');

	const { classes } = defineProps<${name}Props>();

	/**
	 * Карта классов по слотам. \`UiComponentClasses\` типом требует стабильный
	 * \`ui-${kebab}\` первым в root — в него плагин эмитит конфиг-токены,
	 * на него же может опираться CSS потребителя.
	 */
	const cx = computed((): UiComponentClasses<'${kebab}', ${name}Slot> => ({
		root: ['ui-${kebab}', styles.root, classes?.root],
	}));
</script>

<style lang="postcss" module="styles" src="./${name}.module.pcss" />
`
);

write(
	path.join(componentDir, `${name}.module.pcss`),
	`/**
 * Стили \`${name}\`. Конфиг-токены задаются fallback'ами
 * \`var(--ui-${kebab}-*, значение)\`; их дефолты дублируются
 * в \`config/components/${camel}/defaults.ts\` — при появлении tokens
 * добавьте контракт-спеку по образцу \`Button.contract.spec.ts\`.
 */

.root {
	display: inline-flex;
}
`
);

write(
	path.join(componentDir, 'types.ts'),
	`import type { ClassValue } from 'vue';

/**
 * Внутренние слоты стилизации (Styles API) и карта внешних классов.
 */
export type ${name}Slot = 'root';
export type ${name}Classes = Partial<Record<${name}Slot, ClassValue>>;

/**
 * ${name} props.
 */
export type ${name}Props = {
	/**
	 * Переопределение CSS-классов по внутренним слотам (Styles API).
	 */
	classes?: ${name}Classes;
};
`
);

write(
	path.join(componentDir, 'index.ts'),
	`export { default as ${name} } from './${name}.vue';
export { type ${name}Props, type ${name}Classes, type ${name}Slot } from './types';
`
);

write(
	path.join(componentDir, 'story', `${name}.story.vue`),
	`<template lang="pug">
Story(id='${kebab}', group='${group}', title='${name}')
	Variant(title='Playground')
		StoryPreview
			${name} Контент
</template>

<script setup lang="ts">
	import { ${name} } from '@flarian/ui';
</script>
`
);

write(
	path.join(configDir, 'types.ts'),
	`/**
 * Resolved конфигурация компонента \`${name}\`.
 * CSS-токенов пока нет — только дефолты пропсов (см. \`ButtonConfig\`
 * как образец компонента с tokens).
 */
export type ${name}Config = {
	/**
	 * Resolved props — дефолты \`defineProps\` destructure.
	 */
	props: Record<string, never>;
};
`
);

write(
	path.join(configDir, 'defaults.ts'),
	`import type { ${name}Config } from './types';

export const ${camel}Defaults = {
	props: {},
} satisfies ${name}Config;
`
);

write(
	path.join(configDir, 'index.ts'),
	`export { ${camel}Defaults } from './defaults';
export type { ${name}Config } from './types';
`
);

insert(
	path.join(root, 'src/components/index.ts'),
	"export { Icon } from './ui/Display/Icon';",
	`export { ${name} } from './ui/${group}/${name}';\n`,
	`export { ${name} } from './ui/${group}/${name}';`
);

insert(
	path.join(root, 'src/config/components/types.ts'),
	"import type { IconConfig } from './icon';",
	`import type { ${name}Config } from './${camel}';\n`,
	`import type { ${name}Config } from './${camel}';`
);

insert(
	path.join(root, 'src/config/components/types.ts'),
	`
	/**
	 * Resolved конфигурация \`UiIcon\`.
	 */
	icon: IconConfig;`,
	`
	/**
	 * Resolved конфигурация \`Ui${name}\`.
	 */
	${camel}: ${name}Config;`,
	`${camel}: ${name}Config; (поле в DefaultComponentConfig)`
);

insert(
	path.join(root, 'src/config/components/defaults.ts'),
	"import { iconDefaults } from './icon';",
	`import { ${camel}Defaults } from './${camel}';\n`,
	`import { ${camel}Defaults } from './${camel}';`
);

insert(
	path.join(root, 'src/config/components/defaults.ts'),
	'	icon: iconDefaults,',
	`	${camel}: ${camel}Defaults,\n`,
	`${camel}: ${camel}Defaults, (поле в defaultComponentConfig)`
);

console.log(`
Готово. Осталось вручную:
1. Экспортировать публичный API в src/index.ts:
   export { ${name}, type ${name}Props, type ${name}Classes, type ${name}Slot } from '~/components/ui/${group}/${name}';
2. pnpm lint:fix && pnpm typecheck (проверит классы CSS-модуля и регистрации).
`);
