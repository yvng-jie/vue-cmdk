import { ref, computed, watch, onUnmounted, type Ref, type ComputedRef } from 'vue'
import type { CommandItemData, CommandGroupData } from './types'

export type FilterFn = (items: CommandItemData[], query: string) => CommandItemData[] | null

export interface UseCommandMenuReturn {
  visible: Ref<boolean>
  searchQuery: Ref<string>
  activeIndex: Ref<number>
  items: Ref<CommandItemData[]>
  toggle: () => void
  open: () => void
  close: () => void
  defaultFilter: (allItems: CommandItemData[], query: string) => CommandItemData[]
  groupItems: (filtered: CommandItemData[]) => CommandGroupData[]
  filteredItems: ComputedRef<CommandItemData[]>
  groupedItems: ComputedRef<CommandGroupData[]>
  selectNext: () => void
  selectPrev: () => void
  selectCurrent: () => void
}

/** Map display characters to KeyboardEvent modifier properties */
const MODIFIER_MAP: Record<string, 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'> = {
  '⌘': 'metaKey',
  '⌃': 'ctrlKey',
  '⌥': 'altKey',
  '⇧': 'shiftKey',
}

/** Parse a shortcut string like "⌘S" or "⌘⇧F" into a key+modifiers descriptor */
function parseShortcut(shortcut: string): {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
} | null {
  let remaining = shortcut
  const mods: Partial<Record<'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey', boolean>> = {}
  let changed = true
  while (changed && remaining.length > 0) {
    changed = false
    for (const [symbol, prop] of Object.entries(MODIFIER_MAP)) {
      if (remaining.startsWith(symbol)) {
        mods[prop] = true
        remaining = remaining.slice(symbol.length)
        changed = true
        break
      }
    }
  }
  if (!remaining) return null
  return { ...mods, key: remaining.toLowerCase() }
}

/** Check if a KeyboardEvent matches a parsed shortcut descriptor */
function eventMatchesShortcut(e: KeyboardEvent, desc: ReturnType<typeof parseShortcut>): boolean {
  if (!desc) return false
  return (
    e.key.toLowerCase() === desc.key &&
    !!e.metaKey === !!desc.metaKey &&
    !!e.ctrlKey === !!desc.ctrlKey &&
    !!e.altKey === !!desc.altKey &&
    !!e.shiftKey === !!desc.shiftKey
  )
}

export function useCommandMenu(
  customFilter?: FilterFn,
  onItemSelect?: (item: CommandItemData) => void,
): UseCommandMenuReturn {
  const visible = ref(false)
  const searchQuery = ref('')
  const activeIndex = ref(0)
  const items = ref<CommandItemData[]>([])

  const toggle = () => {
    visible.value = !visible.value
  }
  const open = () => {
    visible.value = true
    activeIndex.value = 0
  }
  const close = () => {
    visible.value = false
    searchQuery.value = ''
  }

  /** Default filter: simple case-insensitive match against value, label, and keywords */
  function defaultFilter(allItems: CommandItemData[], query: string): CommandItemData[] {
    if (!query.trim()) return allItems
    const q = query.toLowerCase()
    return allItems.filter((item) => {
      if (item.value.toLowerCase().includes(q)) return true
      if (item.label?.toLowerCase().includes(q)) return true
      if (item.keywords?.some((k) => k.toLowerCase().includes(q))) return true
      return false
    })
  }

  /** Group filtered items by their `group` field */
  function groupItems(filtered: CommandItemData[]): CommandGroupData[] {
    const map = new Map<string, CommandItemData[]>()
    for (const item of filtered) {
      const key = item.group || '__ungrouped__'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    const groups: CommandGroupData[] = []
    // Put ungrouped items first, then alphabetical groups
    if (map.has('__ungrouped__')) {
      groups.push({ heading: '', items: map.get('__ungrouped__')! })
      map.delete('__ungrouped__')
    }
    for (const [heading, groupItems] of map) {
      groups.push({ heading, items: groupItems })
    }
    return groups
  }

  const filteredItems = computed(() => {
    if (customFilter) {
      const result = customFilter(items.value, searchQuery.value)
      if (result !== null) return result
    }
    return defaultFilter(items.value, searchQuery.value)
  })
  const groupedItems = computed(() => groupItems(filteredItems.value))

  function selectNext() {
    const total = filteredItems.value.length
    if (total === 0) return
    activeIndex.value = (activeIndex.value + 1) % total
  }

  function selectPrev() {
    const total = filteredItems.value.length
    if (total === 0) return
    activeIndex.value = (activeIndex.value - 1 + total) % total
  }

  function selectCurrent() {
    const item = filteredItems.value[activeIndex.value]
    if (item && !item.disabled) {
      item.onSelect?.(item)
      close()
    }
  }

  /** Handle global keyboard shortcuts defined in item.shortcut */
  function onShortcutKeydown(e: KeyboardEvent) {
    for (const item of items.value) {
      if (item.disabled || !item.shortcut) continue
      const desc = parseShortcut(item.shortcut)
      if (eventMatchesShortcut(e, desc)) {
        e.preventDefault()
        e.stopPropagation()
        item.onSelect?.(item)
        onItemSelect?.(item)
        close()
        return
      }
    }
  }

  // Rebuild shortcut map whenever items change (already watched by parent),
  // and register global listener if items have shortcuts
  let cleanupShortcuts: (() => void) | null = null

  watch(
    items,
    (val) => {
      if (cleanupShortcuts) {
        cleanupShortcuts()
        cleanupShortcuts = null
      }
      const hasShortcuts = val.some((i: CommandItemData) => i.shortcut)
      if (hasShortcuts && typeof window !== 'undefined') {
        window.addEventListener('keydown', onShortcutKeydown)
        cleanupShortcuts = () => window.removeEventListener('keydown', onShortcutKeydown)
      }
    },
    { immediate: true, flush: 'sync' },
  )

  onUnmounted(() => {
    if (cleanupShortcuts) cleanupShortcuts()
  })

  return {
    visible,
    searchQuery,
    activeIndex,
    items,
    toggle,
    open,
    close,
    defaultFilter,
    groupItems,
    filteredItems,
    groupedItems,
    selectNext,
    selectPrev,
    selectCurrent,
  }
}
