# Масштабирование @flarian/ui

Долги, которые дешевле закрыть до роста числа компонентов. Каждый пункт —
с триггером «когда делать». Закрытое из этого списка: scaffold
(`pnpm scaffold`), контракт-спека токенов (`Button.contract.spec.ts`),
моки тестов из реального `defaultComponentConfig`.

## 1. Общий тест-хелпер `mountWithConfig` — при 3-м компоненте

Мок `~/runtime` сейчас копируется в каждую спеку (уже из реального
`defaultComponentConfig`, гнить не будет — но копия есть копия). Когда
компонентов станет три — вынести в `test/mountWithConfig.ts`: один мок +
возможность точечно переопределить зону конфига в тесте.

## 2. Линт CSS-контракта — до 3-го компонента

Правила из CONTRIBUTING (длительности только `var(--ui-duration-*)`,
полупрозрачность только `color-mix(…, transparent)`, без hex-хардкодов)
ничем не форсятся, а их нарушение тихо ломает `[no-motion]`/`[no-transparency]`
всего кита. Сделать stylelint-правило или AST-чек в тесте по `*.module.pcss`.

## 3. `useInteractive` — при 3-м интерактивном компоненте

`Button`, будущие `IconButton`/`Tab`/`Chip` делят semantics: `disabled` vs
`aria-disabled`, `loading`/`aria-busy`, гашение активации, focus-visible-рецепт.
Извлекать из 2–3 реальных компонентов (не проектировать заранее): composable
с `a11yAttrs` + общий CSS-рецепт фокуса.

## 4. Пер-компонентный tree-shaking CSS — при ~15–20 компонентах

Сейчас статичный CSS пакета един. Вариант: preserveModules + inject-css.
Конфликтует с обещанием «без лоадеров» в webpack-режиме — нужен дизайн.

## 5. Vitest browser mode — по готовности к тяжёлой dev-зависимости

jsdom не считает каскад: контракт-спека проверяет текст pcss, а не computed
style. Playwright-провайдер дал бы честную проверку осей/тем/`[no-motion]`.

## 6. Overlay-семейство (Tooltip/Dropdown/Modal) — заметка на будущее

Решения зафиксированы, чтобы не передумывать:

- Форма: слот `target` + `<Teleport>` с собственным корнем `.overlay` —
  у каждой стороны телепорта свой var-скоуп, наследование приватных `--_*`
  через границу телепорта не требуется.
- Презентация своя на тип: Modal — card-like; Menu — список с roving
  tabindex; Tooltip — «пузырь» без фокуса. Не «Card на всё».
- Общий примитив: позиционирование (floating-ui / CSS Anchor Positioning) +
  dismiss (outside-click, ESC) + controlled/uncontrolled `open`. A11y —
  специфичен каждому типу.
- Слот `target`: предпочесть `asChild`/mergeProps (без лишней ноды),
  решить до публичного API.
