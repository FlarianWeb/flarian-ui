import { getConfig, type RuntimeConfig } from '~/runtime';

/**
 * Доступ к resolved-конфигу пакета (read-only).
 *
 * Возвращает конфиг, запечённый плагином при сборке (или дефолты, если плагин
 * не подключён): список тем, атрибуты схемы/темы, дефолты компонентов, a11y.
 * Конфиг статичен после инициализации приложения — не реактивен.
 *
 * @example
 * const config = useConfig()
 * config.theme.list      // ['ocean', 'forest']
 * config.scheme.attribute // 'data-scheme'
 */
export const useConfig = (): Readonly<RuntimeConfig> => getConfig();
