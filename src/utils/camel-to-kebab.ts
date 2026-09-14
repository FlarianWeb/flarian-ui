/**
 * Преобразует camelCase строку в kebab-case.
 * Используется генераторами CSS для имён переменных: `onEmphasis` → `on-emphasis`.
 */
export const camelToKebab = (str: string): string => str.replace(/([A-Z])/g, '-$1').toLowerCase();
