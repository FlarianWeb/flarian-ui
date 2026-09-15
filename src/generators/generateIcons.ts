import fs from 'node:fs';
import path from 'node:path';

import { writeRegistryAugmentation } from './generateRegistry';

const toCamelCase = (id: string): string =>
	id
		.split(/[-/]/)
		.map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1)))
		.join('');

/**
 * Читает SVG-файлы из директории, превращает каждый в `<symbol>`.
 * Возвращает сырые символы (без обёртки `<svg>`) и список id (`namespace/name`).
 */
export const buildIcons = (dir: string, namespace: string): { ids: string[]; symbols: string } => {
	const ids: string[] = [];
	let symbols = '';

	if (!fs.existsSync(dir)) {
		return { symbols: '', ids };
	}

	/**
	 * Порядок `readdirSync` зависит от файловой системы: без сортировки на Linux
	 * `src/generated/icons.ts` и спрайт расходились бы с собранными на macOS.
	 */
	const files = fs
		.readdirSync(dir)
		.filter(f => f.endsWith('.svg'))
		.sort();

	for (const file of files) {
		const iconName = path.basename(file, '.svg');
		const id = `${namespace}/${iconName}`;

		ids.push(id);

		const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
		const symbol = raw.replace(
			/<svg([^>]*)>([\s\S]*?)<\/svg>/i,
			`<symbol id="${id}"$1>$2</symbol>`
		);

		symbols += symbol + '\n';
	}

	return { symbols, ids };
};

/**
 * Оборачивает символы в корневой `<svg>` спрайта.
 */
export const wrapSprite = (symbols: string): string =>
	`<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n${symbols}</svg>`;

/**
 * Записывает `src/generated/icons.ts` — `iconNames` и тип `BuiltInIcon`.
 * Перезаписывается при каждом запуске и при HMR изменения SVG.
 */
const ensureDir = (outputPath: string): void => {
	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
};

export const writeIconTypes = (ids: string[], outputPath: string): void => {
	const entries = ids
		.map(id => {
			const key = toCamelCase(id);

			return `\t${key}: '${id}',`;
		})
		.join('\n');

	const lines = [
		'// Авто-генерируется плагином uiPlugin из src/assets/icons/ui/.',
		'// Не редактировать вручную — изменения будут перезаписаны.',
		'',
		`export const iconNames = {\n${entries}\n} as const;`,
		'',
		'export type BuiltInIcon = (typeof iconNames)[keyof typeof iconNames];',
		'',
	];

	ensureDir(outputPath);
	fs.writeFileSync(outputPath, lines.join('\n'));
};

/**
 * Генерирует файл module augmentation в проекте пользователя.
 * Расширяет `RegistryIcon` кастомными иконками → `UiIcon` автоматически включает их.
 */
export const writeIconAugmentation = (
	ids: string[],
	outputPath: string,
	packageName: string
): void => writeRegistryAugmentation('RegistryIcon', ids, outputPath, packageName);

/**
 * Генерирует runtime-константу кастомных иконок в проекте пользователя.
 * Паттерн ключей: `${namespace}${PascalCase(filename)}` — аналог `uiIcon.uiBell`.
 *
 * @example
 * // namespace='test', ids=['test/brand', 'test/star']
 * export const testIcon = { testBrand: 'test/brand', testStar: 'test/star' } as const;
 */
export const writeIconConstants = (
	idsByNamespace: Record<string, string[]>,
	outputPath: string
): void => {
	const blocks = Object.entries(idsByNamespace).map(([namespace, ids]) => {
		const entries = ids
			.map(id => {
				const key = toCamelCase(id);

				return `\t${key}: '${id}',`;
			})
			.join('\n');
		const constName = `${namespace}Icon`;

		return `export const ${constName} = {\n${entries}\n} as const;`;
	});

	const lines = [
		'// Авто-генерируется плагином uiPlugin. Не редактировать вручную.',
		'',
		...blocks,
		'',
	];

	ensureDir(outputPath);
	fs.writeFileSync(outputPath, lines.join('\n'));
};
