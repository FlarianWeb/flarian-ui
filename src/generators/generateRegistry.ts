import fs from 'node:fs';
import path from 'node:path';

/**
 * Пишет module augmentation `.d.ts`, расширяющий реестровый интерфейс
 * (`RegistryTheme`, `RegistrySurface`, `RegistryIcon`) переданными именами.
 * Общая реализация для всех auto-generated registry-файлов пакета — сужает
 * `UiTheme`/`UiSurface`/`UiIcon` (и типы, которые их используют — `theme.value`
 * в `useTheme()`, параметр `setTheme()`, …) до реально сконфигурированных значений.
 */
export const writeRegistryAugmentation = (
	interfaceName: string,
	keys: string[],
	outputPath: string,
	packageName: string
): void => {
	const entries = keys.map(key => `\t\t'${key}': true;`).join('\n');

	const lines = [
		'// Авто-генерируется плагином uiPlugin. Не редактировать вручную.',
		'export {};',
		`declare module '${packageName}' {`,
		`\tinterface ${interfaceName} {`,
		entries,
		'\t}',
		'}',
		'',
	];

	fs.mkdirSync(path.dirname(outputPath), { recursive: true });
	fs.writeFileSync(outputPath, lines.join('\n'));
};
