/**
 * Этот файл читает только языковой плагин `@flarian/language-plugin-css-modules`, чтобы вывести типы классов CSS-модулей.
 * Сборка его не видит: `vite.config.ts` передаёт плагины прямо в `css.postcss`, и тогда Vite конфиг-файлы не ищет.
 * Здесь достаточно того, что меняет имена классов, — `postcss-nested`; обёртка в `@layer` на имена не влияет.
 */
module.exports = { plugins: { 'postcss-nested': {} } };
