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
  /** Callback when item is selected */
  onSelect?: (item: CommandItemData) => void
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
}

/** Emitted events */
export interface CommandRootEmits {
  (e: 'update:visible', value: boolean): void
  (e: 'update:searchQuery', value: string): void
  (e: 'select', item: CommandItemData): void
}

/** Group definition */
export interface CommandGroupData {
  heading: string
  items: CommandItemData[]
}
