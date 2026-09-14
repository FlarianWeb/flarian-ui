import type { ClassValue } from 'vue';

/**
 * Внутренняя карта классов компонента (`cx`) — типовой контракт стабильного
 * класса: `root` обязан **первым элементом** содержать литерал `ui-<name>`.
 *
 * Зачем: `generateComponentTokensCSS` эмитит конфиг-токены в селектор
 * `.ui-<name>` — если компонент забудет отрендерить этот класс, вся
 * конфигурация токенов молча перестанет применяться. Тип делает такую
 * ошибку ошибкой компиляции: хэшированные классы CSS-модуля имеют тип
 * `string` и на позицию литерала `ui-<name>` не встают.
 *
 * `Name` — имя компонента в kebab-case, совпадающее с ключом зоны
 * `config/components` (для camelCase-ключей — их kebab-версия).
 */
export type UiComponentCx<Name extends string, Slot extends string> = {
	/**
	 * Классы корня: стабильный `ui-<name>` строго первым.
	 */
	root: readonly [`ui-${Name}`, ...ClassValue[]];
} & {
	/**
	 * Остальные слоты — обязательные: карта покрывает все слоты компонента.
	 */
	[K in Exclude<Slot, 'root'>]: ClassValue;
};

/**
 * Внешние классы компонента
 */
export type UiComponentClasses<Slot extends string> = Partial<Record<Slot, ClassValue>>;
