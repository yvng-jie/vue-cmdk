<p align="center">
  <img src="https://img.shields.io/npm/v/vue-command-kit?color=blue&label=version" alt="npm">
  <img src="https://img.shields.io/badge/vue-3.4%2B-brightgreen" alt="vue">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="license">
  <img src="https://img.shields.io/badge/bundle-5.0kB_gzip-green" alt="size">
  <img src="https://img.shields.io/badge/tests-117_passed-brightgreen" alt="tests">
</p>

<h1 align="center">⌘K — vue-cmdk</h1>
<p align="center">
  A fast, composable, unstyled command palette for Vue 3.
</p>

## Features

- **Compound component API** — Declarative composition with `<Command.Dialog>`, `<Command.Input>`, `<Command.Item>`, and more
- **Built-in search** — Case-insensitive filtering with keyword matching and result highlighting
- **Force render** — `forceMount` prop keeps items in the DOM when filtered out (for animations)
- **Keyboard-first** — Arrow key navigation, Enter to select, Escape to close, global shortcuts
- **Unstyled** — Zero CSS opinions; bring your own styles
- **TypeScript** — Full type inference, exported types, and declaration files
- **Zero runtime dependencies** — Peer dependency only on `vue ^3.4.0`

## Installation

```bash
npm install vue-command-kit
```

## Quick Start

### With items prop

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

### With custom slot content

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

## API

### Components

| Component             | Description                                    |
| --------------------- | ---------------------------------------------- |
| `<Command.Dialog>`    | Modal dialog with mask, transition, focus trap |
| `<Command.Menu>`      | Inline command menu (non-modal) with slots     |
| `<Command.Input>`     | Search input with keyboard navigation          |
| `<Command.List>`      | Scrollable list rendering grouped items        |
| `<Command.Group>`     | Group of items with heading                    |
| `<Command.Item>`      | Single selectable command item                 |
| `<Command.Separator>` | Visual separator with optional `alwaysRender`  |
| `<Command.Empty>`     | Shown when no results match                    |
| `<Command.Loading>`   | Loading indicator                              |

### `<Command.Dialog>` Props

| Prop            | Type                    | Default                         | Description                                    |
| --------------- | ----------------------- | ------------------------------- | ---------------------------------------------- |
| `visible`       | `boolean`               | `false`                         | Controlled open state                          |
| `items`         | `CommandItemData[]`     | `[]`                            | Items to display                               |
| `searchQuery`   | `string`                | —                               | Search query (`v-model:searchQuery`)           |
| `value`         | `string`                | —                               | Selected item value (`v-model:value`)          |
| `placeholder`   | `string`                | `'Type a command or search...'` | Input placeholder                              |
| `filter`        | `FilterFn`              | —                               | Custom filter function                         |
| `loading`       | `boolean`               | `false`                         | Show loading state                             |
| `autoFocus`     | `boolean`               | `true`                          | Auto-focus input on open                       |
| `closeOnSelect` | `boolean`               | `true`                          | Close dialog after selection                   |
| `shouldFilter`  | `boolean`               | `true`                          | When `false`, skip built-in filtering          |
| `loop`          | `boolean`               | `true`                          | When `false`, keyboard nav stops at boundaries |
| `label`         | `string`                | `'Command menu'`                | `aria-label` for the dialog                    |
| `container`     | `string \| HTMLElement` | `'body'`                        | Teleport target for the dialog                 |

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
  value: string
  label?: string
  keywords?: string[]
  shortcut?: string
  group?: string
  disabled?: boolean
  forceMount?: boolean
  icon?: Component | VNode | (() => VNode)
  onSelect?: (item: CommandItemData) => void
}
```

### `useCommandMenu()`

The composable provides programmatic control outside of `Command.Dialog` / `Command.Menu`.

```ts
import { useCommandMenu } from 'vue-command-kit'

const menu = useCommandMenu()
menu.items.value = [...]
menu.open()
menu.close()
menu.toggle()
```

| Return            | Type                     | Description                             |
| ----------------- | ------------------------ | --------------------------------------- |
| `visible`         | `Ref<boolean>`           | Open state                              |
| `searchQuery`     | `Ref<string>`            | Current search query                    |
| `activeIndex`     | `Ref<number>`            | Currently highlighted item index        |
| `items`           | `Ref<CommandItemData[]>` | Raw item list                           |
| `filteredItems`   | `ComputedRef<...>`       | Items after filtering                   |
| `groupedItems`    | `ComputedRef<...>`       | Filtered items grouped by `group` field |
| `open()`          | `() => void`             | Open the menu                           |
| `close()`         | `() => void`             | Close and reset search                  |
| `toggle()`        | `() => void`             | Toggle open state                       |
| `selectNext()`    | `() => void`             | Move active index down                  |
| `selectPrev()`    | `() => void`             | Move active index up                    |
| `selectCurrent()` | `() => void`             | Select currently active item            |

## Bundle Size

| Format  | Size    |
| ------- | ------- |
| ESM     | 17.0 kB |
| UMD     | 13.5 kB |
| Gzipped | 5.0 kB  |

## License

MIT &copy; [yvng-jie](https://github.com/yvng-jie)

---

<p align="center">
  <a href="./CONTRIBUTING.md">Contributing Guide</a>
</p>
