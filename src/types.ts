import type { Component, VNode } from 'vue'

/** A single command item */
export interface CommandItemData {
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
  /** Whether to force this item to always appear in filtered results */
  forceMount?: boolean
  /** Callback when item is selected */
  onSelect?: (item: CommandItemData) => void
  /** Sub-page items. When set, selecting this item opens a sub-menu instead of closing */
  children?: CommandItemData[]
}

/** Props shared across command components */
export interface CommandRootProps {
  /** Controlled open state */
  visible?: boolean
  /** Search query (v-model) */
  searchQuery?: string
  /** Placeholder for search input */
  placeholder?: string
  /** Custom filter function. Return items to display, or null to use default filter */
  filter?: (items: CommandItemData[], query: string) => CommandItemData[]
  /** Auto-focus input on open */
  autoFocus?: boolean
  /** Close after selecting an item */
  closeOnSelect?: boolean
  /** Whether the menu is loading */
  loading?: boolean
  /** aria-label for the dialog/menu */
  label?: string
  /** When false, skip built-in filtering and show all items (custom filter still applies) */
  shouldFilter?: boolean
  /** When false, keyboard navigation stops at boundaries instead of wrapping around */
  loop?: boolean
  /** Controlled selected item value (v-model) */
  value?: string
}

/** Emitted events */
export interface CommandRootEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'update:searchQuery', value: string): void
  (e: 'update:value', value: string): void
  (e: 'select', item: CommandItemData): void
}

/** Props for CommandDialog — extends shared root props with items array */
export interface CommandDialogProps extends CommandRootProps {
  /** Command items to display */
  items?: CommandItemData[]
  /** Teleport target for the dialog (defaults to 'body') */
  container?: string | HTMLElement
}

/** Group definition */
export interface CommandGroupData {
  heading: string
  items: CommandItemData[]
}

/** A snapshot of a page in the navigation stack */
export interface CommandPage {
  items: CommandItemData[]
  searchQuery: string
  activeIndex: number
  title: string
}
