# Changelog

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
