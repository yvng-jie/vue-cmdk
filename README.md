<p align="center">
  <img src="https://img.shields.io/npm/v/vue-command-kit?color=blue&label=version" alt="npm">
  <img src="https://img.shields.io/badge/vue-3.4%2B-brightgreen" alt="vue">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="license">
  <img src="https://img.shields.io/badge/bundle-5.0kB_gzip-green" alt="size">
  <img src="https://img.shields.io/badge/tests-102_passed-brightgreen" alt="tests">
</p>

<h1 align="center">⌘K — vue-cmdk</h1>
<p align="center">
  <b>A fast, composable, unstyled command palette for Vue 3.</b><br>
  Press <kbd>⌘K</kbd> and take control.
</p>

<p align="center">
  <img src="./demo.gif" alt="vue-cmdk demo" width="720">
</p>

## ✨ Features

- **🧩 Compound component API** — `<Command.Dialog>`, `<Command.Input>`, `<Command.Item>`, etc.
- **💄 Unstyled** — Bring your own CSS, zero opinions, full design control
- **🔍 Built-in search** — Fast case-insensitive filtering with keyword matching
- **⌨️ Keyboard-first** — Arrow keys, Enter, Escape — all built-in, no config needed
- **🔊 Global shortcut** — Register shortcuts on items (e.g. `⌘S`) and they work globally
- **📦 Tiny** — 5 kB gzipped, **zero runtime dependencies** (peer: `vue` only)
- **🎯 TypeScript** — Full type inference and declaration files
- **🔄 Dynamic items** — Pass items as a reactive array, swap anytime
- **🛠 Custom filter** — Provide your own filter function
- **♿ Accessible** — ARIA attributes, focus trap, `aria-live` region
- **🧪 Tested** — 102 unit tests across 8 test suites

## 🚀 Install

```bash
npm install vue-command-kit
```

## Quick Start

### Simple — items prop

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Command } from 'vue-command-kit'
import type { CommandItemData } from 'vue-command-kit'

const visible = ref(false)

const items: CommandItemData[] = [
  { value: 'settings', label: 'Open settings', shortcut: '⌘,' },
  { value: 'home', label: 'Go to home', shortcut: '⌘H' },
]

function onSelect(item: CommandItemData) {
  console.log('selected:', item.value)
}
</script>

<template>
  <button @click="visible = true">Open (⌘K)</button>

  <Command.Dialog
    :visible="visible"
    :items="items"
    @update:visible="visible = $event"
    @select="onSelect"
  />
</template>
```

### Advanced — custom slot content

```vue
<Command.Dialog :visible="visible" @update:visible="visible = $event">
  <template #header>
    <Command.Input placeholder="Search..." />
  </template>
  <template #body>
    <Command.List>
      <Command.Group heading="Favorites">
        <Command.Item value="home" label="Home" />
      </Command.Group>
    </Command.List>
  </template>
</Command.Dialog>
```

### With custom filter

```vue
<script setup lang="ts">
import { Command } from 'vue-command-kit'

function myFilter(items: CommandItemData[], query: string) {
  return items.filter((item) => item.label?.includes(query))
}
</script>

<template>
  <Command.Dialog :filter="myFilter" ... />
</template>
```

### With v-model:searchQuery

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Command } from 'vue-command-kit'
import type { CommandItemData } from 'vue-command-kit'

const visible = ref(false)
const query = ref('')

const items: CommandItemData[] = [
  { value: 'home', label: 'Home', keywords: ['dashboard'] },
  { value: 'settings', label: 'Settings' },
]
</script>

<template>
  <Command.Dialog
    :visible="visible"
    :items="items"
    v-model:searchQuery="query"
    @update:visible="visible = $event"
  />
</template>
```

### Async data + loading

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { Command } from 'vue-command-kit'
import type { CommandItemData } from 'vue-command-kit'

const visible = ref(false)
const loading = ref(false)
const items = ref<CommandItemData[]>([])

watch(visible, async (v) => {
  if (v) {
    loading.value = true
    const data = await fetch('/api/commands').then((r) => r.json())
    items.value = data.map((d: any) => ({
      value: d.id,
      label: d.name,
      group: d.category,
    }))
    loading.value = false
  }
})
</script>

<template>
  <Command.Dialog
    :visible="visible"
    :items="items"
    :loading="loading"
    @update:visible="visible = $event"
    @select="console.log('selected', $event)"
  />
</template>
```

## 📖 API

### Components

| Component             | Description                                    |
| --------------------- | ---------------------------------------------- |
| `<Command.Dialog>`    | Modal dialog with mask, transition, focus trap |
| `<Command.Menu>`      | Inline command menu (non-modal) with slots     |
| `<Command.Input>`     | Search input with keyboard navigation          |
| `<Command.List>`      | Scrollable list rendering grouped items        |
| `<Command.Group>`     | Group of items with heading                    |
| `<Command.Item>`      | Single selectable command item                 |
| `<Command.Empty>`     | Shown when no results match                    |
| `<Command.Separator>` | Visual separator                               |
| `<Command.Loading>`   | Loading indicator                              |

### `<Command.Dialog>` Props

| Prop            | Type                | Default                         | Description                                    |
| --------------- | ------------------- | ------------------------------- | ---------------------------------------------- |
| `visible`       | `boolean`           | `false`                         | Controlled open state                          |
| `items`         | `CommandItemData[]` | `[]`                            | Items to display                               |
| `searchQuery`   | `string`            | `''`                            | Search query (`v-model:searchQuery`)           |
| `value`         | `string`            | —                               | Selected item value (`v-model:value`)          |
| `placeholder`   | `string`            | `'Type a command or search...'` | Input placeholder                              |
| `filter`        | `FilterFn`          | —                               | Custom filter function                         |
| `loading`       | `boolean`           | `false`                         | Show loading state                             |
| `autoFocus`     | `boolean`           | `true`                          | Auto-focus input on open                       |
| `closeOnSelect` | `boolean`           | `true`                          | Close dialog after selection                   |
| `shouldFilter`  | `boolean`           | `true`                          | When `false`, skip built-in filtering          |
| `loop`          | `boolean`           | `true`                          | When `false`, keyboard nav stops at boundaries |
| `label`         | `string`            | `'Command menu'`                | `aria-label` for the dialog                    |

### `<Command.Dialog>` Events

| Event                | Payload           | Description                       |
| -------------------- | ----------------- | --------------------------------- |
| `update:visible`     | `boolean`         | Emitted when visibility changes   |
| `update:searchQuery` | `string`          | Emitted when search query changes |
| `update:value`       | `string`          | Emitted when an item is selected  |
| `select`             | `CommandItemData` | Emitted when an item is selected  |

### `CommandItemData`

```ts
interface CommandItemData {
  /** Unique value for this item */
  value: string
  /** Display label (falls back to value) */
  label?: string
  /** Optional keywords for search matching */
  keywords?: string[]
  /** Optional shortcut display (e.g. "⌘S") */
  shortcut?: string
  /** Group this item belongs to */
  group?: string
  /** Disabled state */
  disabled?: boolean
  /** Custom render icon or prefix */
  icon?: Component | VNode | (() => VNode)
  /** Callback when item is selected */
  onSelect?: (item: CommandItemData) => void
}
```

### `useCommandMenu()` Composable

Use the composable for programmatic control outside of `Command.Dialog` / `Command.Menu`.

```ts
import { useCommandMenu } from 'vue-command-kit'
import type { UseCommandMenuReturn, FilterFn } from 'vue-command-kit'

const menu: UseCommandMenuReturn = useCommandMenu(customFilter?)
menu.items.value = [...]
menu.open()
menu.close()
menu.toggle()
```

Returns:

| Return            | Type                      | Description                                      |
| ----------------- | ------------------------- | ------------------------------------------------ |
| `visible`         | `Ref<boolean>`            | Open state                                       |
| `searchQuery`     | `Ref<string>`             | Current search query                             |
| `activeIndex`     | `Ref<number>`             | Currently highlighted item index                 |
| `items`           | `Ref<CommandItemData[]>`  | Raw item list                                    |
| `filteredItems`   | `ComputedRef<...>`        | Items after filtering                            |
| `groupedItems`    | `ComputedRef<...>`        | Filtered items grouped by `group` field          |
| `open()`          | `() => void`              | Open the menu                                    |
| `close()`         | `() => void`              | Close and reset search                           |
| `toggle()`        | `() => void`              | Toggle open state                                |
| `selectNext()`    | `() => void`              | Move active index down                           |
| `selectPrev()`    | `() => void`              | Move active index up                             |
| `selectCurrent()` | `() => void`              | Select currently active item                     |
| `defaultFilter()` | `(items, query) => items` | Default filter implementation (case-insensitive) |

## 📦 Bundle Size

| Format  | Size       |
| ------- | ---------- |
| ESM     | 17.0 kB    |
| UMD     | 13.5 kB    |
| Gzipped | **5.0 kB** |

Zero runtime dependencies. Peer dependency only on `vue ^3.4.0`.

## 🗺️ Roadmap

### v0.2.0 — Upcoming

| Feature                     | Description                                                                  |
| --------------------------- | ---------------------------------------------------------------------------- |
| `forceMount` prop           | Keep `CommandItem` / `CommandGroup` DOM mounted when hidden (for animations) |
| Search highlight            | Highlight matching text in search results with `<mark>`                      |
| `closeOnSelect` fix         | `selectCurrent()` respects the `closeOnSelect` prop                          |
| `alwaysRender` on Separator | Control whether `CommandSeparator` always renders                            |
| Dialog `container` prop     | Custom Teleport target for `CommandDialog`                                   |

### v0.5.0 / v1.0.0 — Future

| Feature                      | Description                                                      |
| ---------------------------- | ---------------------------------------------------------------- |
| Nested items / Pages         | Multi-level sub-menu navigation via value path matching          |
| `autoValue`                  | Auto-detect item value from slot textContent                     |
| `useCommandState()` selector | Subscribe to specific state slices, avoid full-object reactivity |
| Programmatic focus           | Expose `focus()` on `CommandInput`                               |

## 🤝 Acknowledgements

vue-cmdk is inspired by [`cmdk`](https://github.com/pacocoursey/cmdk) by [@pacocoursey](https://github.com/pacocoursey) — a fast, unstyled command menu for React.

### Keyboard

| Key      | Action                                 |
| -------- | -------------------------------------- |
| `↑` `↓`  | Navigate items (wraps around)          |
| `Enter`  | Select current item                    |
| `Escape` | Close dialog                           |
| `Tab`    | Moves focus within dialog (focus trap) |

## 🤝 Contributing

### Prerequisites

- **Node.js** >= 22.13
- **pnpm** >= 11.x

### Setup

```bash
# Clone the repo
git clone https://github.com/yvng-jie/vue-cmdk.git
cd vue-cmdk

# Install dependencies
pnpm install

# Start demo dev server
pnpm dev
```

### Scripts

| Command           | Description                               |
| ----------------- | ----------------------------------------- |
| `pnpm dev`        | Start demo dev server at `localhost:5173` |
| `pnpm build`      | Build the library + type declarations     |
| `pnpm typecheck`  | Run TypeScript type checking              |
| `pnpm test`       | Run unit tests (Vitest)                   |
| `pnpm test:watch` | Run tests in watch mode                   |
| `pnpm lint`       | ESLint + Prettier check                   |
| `pnpm lint:fix`   | Auto-fix lint and formatting issues       |
| `pnpm format`     | Format code with Prettier                 |
| `pnpm preview`    | Preview production build                  |
| `pnpm build:demo` | Build demo site to `dist-demo/`           |

### Project Structure

```
src/
├── __tests__/            # 8 test suites (102 tests)
│   ├── useCommandMenu.test.ts
│   ├── CommandDialog.test.ts
│   ├── CommandList.test.ts
│   ├── CommandInput.test.ts
│   ├── CommandItem.test.ts
│   ├── useCommandRoot.test.ts
│   ├── parseShortcut.test.ts
│   └── injectStrict.test.ts
├── useCommandMenu.ts     # core composable (state, filter, shortcuts)
├── useCommandRoot.ts     # shared composable (provide/inject wiring)
├── types.ts              # TypeScript type definitions
├── injectionKeys.ts      # provide/inject keys
├── utils/
│   └── injectStrict.ts   # type-safe inject helper
├── CommandMenu.vue       # inline command menu
├── CommandDialog.vue     # modal dialog command palette
├── CommandInput.vue      # search input
├── CommandList.vue       # scrollable filtered list
├── CommandGroup.vue      # group with heading
├── CommandItem.vue       # single selectable item
├── CommandEmpty.vue      # empty state
├── CommandSeparator.vue  # visual separator
├── CommandLoading.vue    # loading indicator
├── index.ts              # barrel exports
└── env.d.ts              # type shims
demo/
├── App.vue               # demo application
├── main.ts               # demo entry
└── style.css             # demo styles
```

### Pull Request Process

1. Fork the repo and create a feature branch from `main`
2. Make your changes and run `pnpm typecheck && pnpm test && pnpm build`
3. Test your changes with `pnpm dev` (demo app)
4. Update `CHANGELOG.md` with a description of your changes
5. Submit a PR with a clear description of what and why

PRs and issues are welcome!

## 📄 License

MIT © [yvng-jie](https://github.com/yvng-jie)

---

<p align="center">
  <sub>Made with ❤️ for the Vue community. Thanks to <a href="https://github.com/xiaoluoboding">@xiaoluoboding</a> for the original <a href="https://github.com/xiaoluoboding/vue-command-palette">vue-command-palette</a>.</sub>
</p>
