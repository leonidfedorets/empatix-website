# Live Visual Editing in Admin

Goal: в админке вместо форм с полями — реальная страница сайта в iframe; кликаешь на блок (Hero, Service card, Team member, FAQ item и т.д.) — справа открывается панель редактирования, изменения сразу видны на превью.

## How it will look

```text
┌───────────────────────────────────────────────────────────────┐
│  [Page: Home ▼]  [Desktop|Tablet|Mobile]   [Discard] [Publish]│
├──────────────────────────────────────────┬────────────────────┤
│                                          │                    │
│   ┌────────────────────────────────┐     │  Editing: Hero     │
│   │   Hero (hovered = blue outline)│     │  ──────────────    │
│   │   [click → opens panel →]      │     │  Title  [______]   │
│   └────────────────────────────────┘     │  Subtitle [____]   │
│                                          │  CTA    [______]   │
│   ┌────────────────────────────────┐     │  Image  [pick…]    │
│   │   Services grid                │     │                    │
│   └────────────────────────────────┘     │  [Save changes]    │
│                                          │                    │
│   …rest of the live page…                │                    │
└──────────────────────────────────────────┴────────────────────┘
```

Левая часть — настоящий сайт (тот же код, что и публичный), правая — динамическая форма по схеме выбранного блока.

## What changes

1. **Public site читает контент из БД** (сейчас всё хардкод). Hero, Services, Team, Testimonials, FAQ, Contact, SEO — все компоненты переключаются на данные из `content_sections` / `content_items` с фолбэком на текущий текст (seed уже в миграции).
2. **Editable-обёртка** `<Editable section="hero" field="title">…</Editable>` помечает блок `data-editable`. В обычном режиме — прозрачна. В админ-режиме — добавляет hover-outline и клик.
3. **Новый роут `/admin/editor`** с iframe на `/?edit=1`. Iframe и админ общаются через `postMessage`:
   - iframe → admin: `{type:'select', section, itemId?, field?}` при клике
   - admin → iframe: `{type:'patch', section, data}` при изменении поля (live preview без сохранения)
   - admin → iframe: `{type:'reload'}` после Save
4. **Боковая панель редактирования** — переиспользует существующий `FieldRenderer` и схемы из `src/lib/admin/schemas.ts`. Для текста — inline TipTap, для картинок — `MediaLibrary` пикер.
5. **Save/Publish** — кнопка в шапке: пишет в `content_sections` / `content_items` через уже существующие server functions (`adminUpsertSection`, `adminUpsertItem`). Опционально — draft vs published (поле `status` уже есть в схеме).
6. **Старые роуты** `/admin/content/$section` и `/admin/collections/$type` остаются как fallback (табличный режим для массового редактирования), но `/admin` по умолчанию открывает визуальный редактор.

## Pages covered in v1

Только главная (`/`): Hero, AI Solutions (6 карточек), Services, Team, Testimonials, FAQ, Contact, SEO-мета. Остальные страницы (`/services`, `/about`, `/cases`, …) добавим тем же механизмом следом — структура одна и та же.

## Out of scope (можно потом)

- Drag & drop порядка блоков на странице
- Создание новых страниц через админку (page builder)
- Версионность с дифом и rollback UI (таблица `audit_log` уже копит изменения)
- Multi-language

## Tech notes (для разработчика)

- Public reads: server fn `getPublicContent({sections:[...], collections:[...]})` через server publishable client, в loader `/` + `ensureQueryData`.
- Edit mode флаг: `?edit=1` + проверка `getMyRoles()` в iframe; если не админ — `edit=1` игнорируется.
- postMessage origin: проверяем `event.origin === window.location.origin`.
- Live patch: оптимистичный апдейт React Query кэша внутри iframe, без записи в БД до Save.
- Outline: глобальный CSS `[data-editable]:hover { outline: 2px solid hsl(var(--primary)); }` только когда `<html data-edit-mode>` выставлен.

## Deliverables

- Server fn `getPublicContent` + перевод компонентов главной на данные из БД.
- `<Editable>` обёртка + edit-mode стили.
- Роут `/admin/editor` с iframe, sidebar-панелью, postMessage-мостом, кнопкой Publish.
- Обновление навигации `/admin` — Editor становится главным экраном, табличные редакторы — во второй пункт меню.
