# Changelog

## 0.2.0 (2026-06-24)

### ✨ Features

- **forceMount prop** — `CommandItem` and `CommandGroup` support `forceMount`; marked items bypass search filtering (cmdk parity)
- **Search highlight** — Matching text in search results is wrapped in `<mark>` for visual feedback
- **`alwaysRender` on Separator** — `CommandSeparator` accepts `alwaysRender` prop; `CommandList` accepts `alwaysRenderSeparator` to keep separators visible regardless of group count
- **Dialog `container` prop** — `CommandDialog` accepts a `container` prop to customize the Teleport target (defaults to `'body'`)
- **Export shortcut utils** — `parseShortcut` and `eventMatchesShortcut` exported from `vue-command-kit`

### 🐛 Bug Fixes

- **selectCurrent** — Now invokes the `onItemSelect` callback so `v-model:value` updates correctly (fixes C1)
- **CMDK_SELECT_HANDLER** — Emits `update:value` when an item is selected via keyboard (fixes C2)
- **handleSelect** — Emits `update:value` when an item is selected via slot scope (fixes C3)
- **CommandItem** — Removed duplicate `state.close()` on click (already handled by the select handler) (fixes C4)
- **CommandMenu** — Default `visible` changed to `false`; `aria-expanded` now dynamically reflects state; added `aria-label`
- **CommandList** — `CMDK_LOADING` injection unified to `injectStrict`

### ⚡ Performance

- **Shortcut watcher** — Removed `deep: true` from the items watch; listener rebuilds only when the items array is replaced

### 📖 Documentation

- **README** — Rewritten: shorter (~200 lines), more formal tone, reduced examples from 5 to 2
- **CONTRIBUTING.md** — Now contains the full contributing guide (prerequisites, scripts, project structure, PR process)
- **CHANGELOG** — Added 0.2.0 entries

### 🧪 Testing

- **highlight.test.ts** — New suite: 9 tests for `highlightText` utility
- **parseShortcut.test.ts** — Refactored to import from `utils/shortcut.ts` instead of duplicating logic
- **useCommandRoot.test.ts** — Added `update:value` emission test
- **useCommandMenu.test.ts** — Added `selectCurrent` callback test and `forceMount` filter tests
- **CommandItem.test.ts** — Added search highlight rendering test
- Total: **117 tests** across **9 test suites**

---

## 0.1.2 (2026-06-14)

### 🐛 Bug Fixes

- **`CommandList`** — Pass `keywords` prop to `CommandItem` so declarative items with `keywords` are searchable (fixes B1)
- **`CommandDialog`** — Replace duplicate emits type with shared `CommandRootEmits` (fixes B3)
- **`useCommandRoot`** — Add `{ immediate: true }` to value watcher so initial `value` prop syncs correctly (fixes Q4)

### ⚡ Performance

- **Shortcut listener** — Add `deep: true` to the `items` watch so in-place mutations (push/splice) trigger re-registration of global keyboard listeners (fixes Q3)

### 🏗️ Refactoring

- **`CommandList`** — Remove redundant `grouped` computed; use `state.groupedItems.value` directly (fixes Q1)
- **`CommandList`** — Replace object-reference separator comparison with index-based comparison (fixes Q2)
- **`useCommandMenu`** — Extract `__ungrouped__` magic string into module-level `UNGROUPED_KEY` constant (fixes Q5)
- **`CommandMenu`** — Add `visible: true` to defaults and use `{ immediate: true }` watch instead of direct state assignment in setup (fixes Q4)

### 🧪 Testing

- **New test suite** — `parseShortcut.test.ts` (14 tests): unit tests for shortcut parsing and event matching
- **New test suite** — `CommandDialog.test.ts` (11 tests): visible state, mask click, Escape key, slots, v-model, aria-label
- **New test suite** — `CommandList.test.ts` (12 tests): group rendering, separators, empty/loading states, aria-live, keywords passthrough
- **New test suite** — `CommandInput.test.ts` (11 tests): input value, keyboard navigation, aria-activedescendant, ref expose
- **New test suite** — `useCommandRoot.test.ts` (8 tests): state creation, handleSelect, closeOnSelect, value sync

### 📖 Documentation

- **Demo comparison table** — Mark `shouldFilter`, `loop`, `label` as done (were already implemented but table was outdated)

---

## 0.1.1 (2026-05-31)

### 🏗️ Refactoring

- **`useCommandRoot`** — Extract shared composable, eliminate duplicated logic between `CommandMenu` and `CommandDialog`
- **`injectStrict`** — Type-safe inject utility, throws clear error instead of `!` assertion

### ✨ Features

- **`searchQuery` v-model** — `CommandDialog` now supports `v-model:searchQuery`, consistent with `CommandMenu`

### ⚡ Performance

- **`parseShortcut`** — Rewritten with regex for cleaner parsing
- **Hover index** — Replaced `findIndex` O(n) with `Map.get` O(1) lookup

### 🐛 Bug Fixes

- **Input focus** — Replaced `document.querySelector` with Vue template ref
- **Package files** — Fixed `dist/utils/*.d.ts` not included in npm package

### 📦 Build

- **Type export** — Auto-generated `dist/index.d.ts` from component list
- **GIF demo** — Added usage demo to README

---

## 0.1.0 (2026-05-30)

### 🎉 Initial Release

- 🧩 **Compound component API** — `Command.Dialog`, `Command.Input`, `Command.Item`, etc.
- 💄 **Unstyled** — Bring your own CSS, zero opinions, full design control
- 🔍 **Built-in search** — Fast case-insensitive filtering with keyword matching
- ⌨️ **Keyboard-first** — Arrow keys, Enter, Escape — all built-in, no config needed
- 📦 **Zero runtime dependencies** — Peer dependency only on Vue 3.4+
- 🎯 **Full TypeScript support** — Type inference and declaration files
- 🔄 **Dynamic items** — Pass items as a reactive array, swap anytime
- 🛠 **Custom filter** — Provide your own filter function
- ♿ **Accessible** — ARIA attributes, focus trap, `aria-live` region
- 🔒 **Focus trap** — Tab cycling stays within the dialog
- 🔔 **Global shortcut listener** — Auto-registers keyboard shortcuts from item definitions
