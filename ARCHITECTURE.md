# Архитектура @flarian/ui
Как пакет устроен изнутри. Детали каждого механизма в JSDoc его файла; здесь только карта: что откуда протекает и какой файл за что отвечает.

---

## Поток данных
```
UIPluginOptions (конфиг потребителя)
        │
        ▼
resolveUIConfig()  ← ЕДИНСТВЕННАЯ точка резолвинга всех зон
        │
        ├─ CSS-генераторы ──► доставка CSS (3 режима, см. ниже)
        ├─ generateInject ──► runtime store (provideConfig)
        ├─ generateFoucScript ──► блокирующий скрипт в <head>
        └─ writeRegistries ──► *.d.ts (module augmentation) в src/generated потребителя
```

Runtime: `app.use(flarianUI)` регистрирует компоненты, кладёт per-app контейнер
состояния (SSR) и «прогревает» composables - те в свою очередь ставят атрибуты на `<html>`. Компоненты читают дефолты пропсов из store лениво в `defineProps`.

---

## resolveUIConfig - ключевой инвариант
`src/config/resolveUIConfig.ts`. Все потребители resolved-конфига обязаны получать его отсюда (дублирование мержей по месту потребления даёт дрейф зон).
Компонентная зона **намеренно несимметрична**:
- `componentsRuntime` - props, смерженные с дефолтами → runtime store;
- `componentTokensDiff` - СЫРОЙ `options.component` → CSS (diff-эмиссия: эмитится только то, что потребитель передал; дефолты живут fallback'ами в pcss). Если сделать это **симметрично** то resolver зальёт в CSS дефолты всех токенов даже если они не используются в клиенте, предохранитель: `resolveUIConfig.spec.ts`.

---

## Генераторы (`src/generators/`)
Все генераторы - чистые функции «resolved-конфиг → строка», покрыты тестами.
| Генератор                   | Вход → Выход                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `generateThemeCSS`          | темы → `:root` (default, анти-FOUC fallback) + `[data-theme='x']` с `--ui-theme-*`                  |
| `generateSurfaceCSS`        | поверхности → `:root` + `[data-surface='x']` с `--ui-surface-<step>` и статусными цветами           |
| `generateColorsCSS`         | colors+scheme → `--ui-color-*` в `:root` и `[data-scheme]`                                          |
| `generateTokensCSS`         | шкалы+типографика → `--ui-<шкала>-<ключ>` в `:root` + a11y-правила `[no-motion]`/`[no-transparency]`|
| `generateComponentTokensCSS`| diff токенов → `.ui-<component> { --ui-<component>-<путь>: … }` (не добавляются в `:root`)            |
| `generateInject`            | resolved → JS-код модуля `@flarian/ui/inject` (provideConfig + CSS + спрайт)                        |
| `generateFoucScript`        | resolved → инлайн-IIFE: scheme/theme/surface из localStorage до первой отрисовки                    |
| `generateIcons`             | SVG-папки → спрайт `<symbol>` + augmentation `RegistryIcon` + runtime-константы                     |
| `generateRegistry`          | ключи list → augmentation `RegistryTheme`/`RegistrySurface` (сужение `UiTheme`/`UiSurface`)         |
| `wrapLayer` / `onBaseColor` | обёртка в `@layer flarian-ui` / контраст `onBase: 'auto'` по светлоте                               |

---

## Доставка (unplugin, `src/plugin/index.ts`)
Одна фабрика на все бандлеры, три режима:

1. **vite/rollup** - CSS как 4 виртуальных модуля `\0flarian-ui-*.css`
   (проходят CSS-пайплайн потребителя), спрайт: dev - inline в DOM,
   build - emitFile + `ROLLUP_FILE_URL`.
2. **webpack/rspack/esbuild** - весь CSS одной строкой через `provideStyle`,
   спрайт inline. FOUC-скрипт вставляется вручную:
   `generateFoucScript(resolveUIConfig(options))`.
3. **без плагина / CDN** - статичный `dist/flarian-ui.inject.js` с дефолтами;
   IIFE-бандл + ручные `provideConfig`/`provideSprite`.

Точка инъекции - модуль `@flarian/ui/inject`: side-effect импорт в
`src/app/index.ts`, external в сборке; плагин перехватывает его в `resolveId`
и подменяет сгенерированным кодом.

`config/` рантайм-независим от Vue и достижим из `vite.config`:
дефолты - литералы, импорты относительные; типы могут выводиться из props
компонента через `import type` (стирается компилятором).

---

## Слои CSS-переменных
| Слой | Шаблон | Описание |
| --- | --- | --- |
| Сырые | `--ui-theme-*`, `--ui-surface-*` | `generateThemeCSS`/`generateSurfaceCSS` |
| Семантика | `--ui-color-*` | `generateColorsCSS` кроме зарезервированных, добавлена защита от использования статусных цветов `surface` |
| Компонент → Конфиг-токены | `--ui--<var-name>-<size>` | Ось пишет в приватную `--_padding-y` |
| Компонент → инстанс-вары | `--ui-<var-name>` | Переопределяют ось; UI-KIT их **не объявляет** |
| Компонент → приватные | `--_*` | Транспортная «ось-класс → .root» |

Весь CSS поставляемый из UI-KIT обёрнут в `@layer flarian-ui`: unlayered-CSS потребителя выигрывает по умолчанию.
Стабильный класс `.ui-<component>` на корне - селектор для конфиг-токенов и публичный хук стилизации (типовой контракт - `UiComponentClasses`).

`--ui-color-*` - **Общий неймспейс двух генераторов:** 
- `generateColorsCSS` владеет схем-зависимой семантикой (bg/fg/border…)
- `generateSurfaceCSS` владеет схемой статусных цветов и их on-вариантами:
   - `error` `warning` `success` `info`
   - `on-error` `on-warning` `on-success` `on-info`
Ownership - per-переменная, пересечение имён запрещено `generateColorsCSS` выбросит ошибку сборки при попытке задать зарезервированное имя (`isReservedColorKey` в `generateSurfaceCSS.ts`).

---

## Runtime (`src/runtime`, `src/composables`, `src/registry`)
- **Store** - module-scope singleton: `provideConfig` (вызывается inject-кодом до `app.use`), `getConfig` - lazy, `provideSprite`/`provideStyle`, `DOM-id` из `storagePrefix`.
- **Composables** - единый паттерн `resolveInitial → ensureState → applyToDOM`; состояние в per-app контейнере (`appState.ts`, provide/inject через `runWithContext`) с фолбэком на модульный синглтон вне приложения. В SSR режиме каждый запрос получает свой контейнер.
- **Registry** - типовые реестры `RegistryTheme`/`RegistrySurface`/`RegistryIcon` (module augmentation, генерирует плагин) + runtime-реестр вариантов компонентов (`registerVariants`/`getVariantClass`).

---

## Готчи (не «исправлять»)

- `PACKAGE_NAME = ['@flarian','ui'].join('/')` - Rolldown переписывает строковые вхождения имени собственного пакета; литерал сломал бы augmentation у потребителя (`declare module '.'`).
- `resolveId` уводит в виртуальный модуль уже отрезолвленный `flarian-ui.inject.js`, иначе `sideEffects`- whitelist package.json дал бы tree-shaking'у выкинуть сгенерированный код.
- Diff-эмиссия держится на сыром `componentTokensDiff` - см. выше.
- data-атрибут не ставится, когда значение равно default (покрыт `:root`); логика продублирована в composables и FOUC-скрипте - менять синхронно.
- dev-спрайт доставляется inline в DOM, а не middleware - histoire ломал порядок чужих middleware.

---

## Сборка пакета
`pnpm build` = vite build (8 ESM-entry + dist-артефакты: статичный inject, styles.css, theme.css) → vue-tsc (d.ts) → tsc-alias → CDN-сборка (iife). Histoire-режим отличается от библиотечной сборки только env-флагом `HISTOIRE` (vite.config.ts подключает uiPlugin вместо distArtifactsPlugin) - витрина догфудит боевой плагин.
