/**
 * Оборачивает сгенерированный CSS в `@layer flarian-ui`.
 *
 * Все стили пакета живут в одном каскадном слое: любой unlayered CSS потребителя
 * выигрывает у них автоматически, без `!important` и войн специфичности.
 * Несколько блоков `@layer flarian-ui` в разных файлах сливаются по спецификации.
 */
export const wrapLayer = (css: string): string => `@layer flarian-ui {\n${css}\n}`;
