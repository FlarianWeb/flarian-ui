/**
 * Входная точка CDN iife-бандла — глобальный объект `FlarianUI`.
 *
 * Помимо основного API пакета экспортирует функции runtime store:
 * без бандлера конфиг и спрайт передаются вручную до `app.use(FlarianUI.flarianUI)`.
 *
 * @example
 * <link rel="stylesheet" href=".../dist/flarian-ui.iife.css" />
 * <link rel="stylesheet" href=".../dist/theme.css" />
 * <script src="https://unpkg.com/vue@3"></script>
 * <script src=".../dist/flarian-ui.iife.js"></script>
 * <script>
 *   FlarianUI.provideSprite({ url: '.../dist/flarian-ui.sprite.svg' });
 *   FlarianUI.provideConfig({ theme: { attribute: 'data-theme', list: ['ocean'], default: 'ocean' } });
 *   const app = Vue.createApp(...);
 *   app.use(FlarianUI.flarianUI);
 * </script>
 */
export * from '~/index';
export { getConfig, getSpriteUrl, provideConfig, provideSprite, provideStyle } from '~/runtime';
