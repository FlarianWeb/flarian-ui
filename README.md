# @flarian/ui
Vue 3 UI-kit с build-time темизацией: конфиг плагина запекается в CSS-переменные `--ui-*`, в рантайм едут только дефолты пропсов. Работает с Vite/Nuxt (полный пайплайн), webpack/Rspack/esbuild/Rollup (inline-режим) и без бандлера (CDN).

Подробности каждого механизма - в JSDoc соответствующего файла.
Внутреннее устройство - [ARCHITECTURE.md](./ARCHITECTURE.md),
разработка компонентов - [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Быстрый старт
```ts
// vite.config.ts
import { uiPlugin, defineUIPluginOptions } from '@flarian/ui/vite';

export default defineConfig({
	plugins: [vue(), uiPlugin(defineUIPluginOptions({ /* конфиг */ }))],
});
```

```ts
// main.ts
import { flarianUI } from '@flarian/ui';

createApp(App).use(flarianUI).mount('#app');
```

`defineUIPluginOptions` не обязателен, но сужает `theme.default`/`surface.default` до реальных ключей. Zero-config полностью рабочий: тема `base`, поверхность `base`, встроенные иконки, анти-FOUC скрипт вставляется автоматически.

Nuxt: модуль `@flarian/ui/nuxt`, конфиг - в ключе `flarianUI`.

---

## Конфиг плагина (зоны)
| Зона            | Что настраивает                             | Семантика                                            |
| --------------- | ------------------------------------------- | ---------------------------------------------------- |
| `theme`         | Акцентные темы (`base`/`onBase`)            | `list` - замена, `extend` - дополнение               |
| `surface`       | Нейтральная шкала 50–950 + статусные цвета  | `list` - замена, `extend` - дополнение               |
| `scheme`        | Переключение dark/light                     | deepMerge                                            |
| `colors`        | Семантические цвета (`bg`, `fg`, `border`…) | deepMerge                                            |
| `tokens`        | Шкалы: radius, fontSize, space, shadow…     | deepMerge                                            |
| `typography`    | Шрифт, межстрочные, веса                    | deepMerge                                            |
| `component`     | Пропсы-дефолты и CSS-токены компонентов     | props - deepMerge; tokens - diff-эмиссия             |
| `icons`         | Кастомные SVG-наборы (`namespace/name`)     | добавление к встроенным `ui/*`                       |
| `a11y`          | `motion`/`transparency` дефолты             | deepMerge                                            |
| `storagePrefix` | Ключи localStorage и DOM-id элементов кита  | обязателен при нескольких приложениях на origin      |
| `foucScript`    | Автовставка анти-FOUC скрипта               | `false` для MF-remote (скрипт вставляет только host) |
| `projectRoot`   | Корень для генерируемых файлов              | нужен для rollup/esbuild                             |

Точные типы, дефолты и краевые случаи: `src/plugin/types.ts` и `src/config/<зона>/`.

---

## Темизация в рантайме
Переключатели пишут атрибуты на `<html>` и значение в localStorage;
CSS реагирует селекторами `[data-scheme]`, `[data-theme]`, `[data-surface]`:

```ts
const { scheme, setScheme, toggleScheme } = useScheme(); // dark/light; 'auto' следует за ОС
const { theme, setTheme, clearTheme } = useTheme(); // null = «не выбрано», default покрыт :root
const { surface, setSurface } = useSurface(); // всегда валидный ключ
useMotion(); useTransparency(); // a11y: атрибуты no-motion / no-transparency
```

Scoped-темизация: `data-theme`/`data-surface` на любом элементе перекрашивает
только его поддерево.

---

## Кастомизация компонентов (4 уровня)
1. **Конфиг-токены** (build-time): 
```js
const config = {
  component: { 
    button: {
      tokens: {
        paddingY: {
          md: '0.75rem'
        }
      }
    } 
  }
};
```
   → переменная `--ui-button-padding-y-md` в стабильном классе `.ui-button`. Эмитится только переданный diff; дефолты и полный список токенов - `src/config/components/<имя>/defaults.ts`.
2. **CSS потребителя**: стили кита в `@layer flarian-ui` - любой ваш unlayered-класс выигрывает без `!important`. Стабильный хук - `.ui-button`.
3. **Инстанс-переменные**: `--ui-button-color`, `--ui-button-padding-x` и т.д. UI-KIT их только читает; заданная (style/класс/родитель) перебивает ось целиком. Список - `buttonInstanceVars` в `types.ts` компонента.
4. **Styles API**: проп `classes` - свои классы на внутренние слоты.

---

## Свой вариант кнопки (без обёрток)
```ts
// main.ts - до app.use(flarianUI)
import styles from './button-variants.module.css';
import { registerVariants } from '@flarian/ui';

registerVariants('button', { promo: styles.promo });
```

```ts
// env.d.ts - типобезопасность <Button variant="promo">
declare module '@flarian/ui' {
	interface RegistryButtonVariant { promo: true }
}
```

CSS-контракт варианта: класс должен читать `--_color`/`--_on-color` (их ставит ось `color`) и описать свои `:hover`/`:active`.

---

## Микрофронтенды и SSR
- MF: `@flarian/ui` - shared singleton; у remote'ов `foucScript: false`; при отдельных копиях пакета задавайте разные `storagePrefix`.
- SSR/Nuxt: состояние composables живёт per-app (per-request), все обращения к DOM/localStorage под guard'ами.

---

## Exports
| Импорт                     | Что это                                             |
| -------------------------- | --------------------------------------------------- |
| `@flarian/ui`              | Компоненты, composables, `registerVariants`, типы   |
| `@flarian/ui/vite` (и др.) | Плагин: `/rollup`, `/webpack`, `/rspack`, `/esbuild`|
| `@flarian/ui/nuxt`         | Nuxt-модуль                                         |
| `@flarian/ui/runtime`      | `provideConfig`/`provideSprite`/`provideStyle`      |
| `@flarian/ui/inject`       | Служебный inject-модуль (подменяется плагином)      |
| `@flarian/ui/styles`       | Статичный CSS компонентов                           |
| `@flarian/ui/theme.css`    | Дефолтная тема без плагина                          |

CDN-режим (IIFE, без бандлера): `dist/flarian-ui.iife.js` + ручные `FlarianUI.provideConfig()`/`provideSprite()` - см. `src/cdn/index.ts`.
