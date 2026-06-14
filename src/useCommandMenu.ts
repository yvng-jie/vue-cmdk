import { ref, computed, watch, onUnmounted, type Ref, type ComputedRef } from 'vue'
import type { CommandItemData, CommandGroupData } from './types'

export type FilterFn = (items: CommandItemData[], query: string) => CommandItemData[] | null

export interface UseCommandMenuOptions {
  /** Custom filter function */
  filter?: FilterFn
  /** When false, skip built-in filtering */
  shouldFilter?: boolean
  /** When false, keyboard navigation stops at boundaries */
  loop?: boolean
}

export interface UseCommandMenuReturn {
  visible: Ref<boolean>
  searchQuery: Ref<string>
  activeIndex: Ref<number>
  selectedValue: Ref<string | undefined>
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

const UNGROUPED_KEY = '__ungrouped__'

/** Map display characters to KeyboardEvent modifier properties */
const MODIFIER_MAP: Record<string, 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'> = {
  '⌘': 'metaKey',
  '⌃': 'ctrlKey',
  '⌥': 'altKey',
  '⇧': 'shiftKey',
}

/** Regex to match leading modifier symbols followed by a key character */
const MODIFIER_PATTERN = /^([⌘⌃⌥⇧]+)(.+)$/

/** Parse a shortcut string like "⌘S" or "⌘⇧F" into a key+modifiers descriptor */
function parseShortcut(shortcut: string): {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
} | null {
  if (!shortcut) return null
  const match = MODIFIER_PATTERN.exec(shortcut)
  if (!match) return { key: shortcut.toLowerCase() }

  const [, modSymbols, key] = match
  const mods: Partial<Record<'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey', boolean>> = {}
  for (const ch of modSymbols) {
    const prop = MODIFIER_MAP[ch]
    if (prop) mods[prop] = true
  }
  return { ...mods, key: key.toLowerCase() }
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
  optionsOrFilter?: UseCommandMenuOptions | FilterFn,
  onItemSelect?: (item: CommandItemData) => void,
): UseCommandMenuReturn {
  // Normalize overload: allow passing a FilterFn directly as first arg
  const opts: UseCommandMenuOptions =
    typeof optionsOrFilter === 'function' ? { filter: optionsOrFilter } : (optionsOrFilter ?? {})

  const { filter: customFilter, shouldFilter = true, loop = true } = opts

  const visible = ref(false)
  const searchQuery = ref('')
  const activeIndex = ref(0)
  const selectedValue = ref<string | undefined>()
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
      const key = item.group || UNGROUPED_KEY
      if (!map.has(key)) {
        map.set(key, [item])
      } else {
        map.get(key)!.push(item)
      }
    }
    const groups: CommandGroupData[] = []
    // Put ungrouped items first, then alphabetical groups
    if (map.has(UNGROUPED_KEY)) {
      groups.push({ heading: '', items: map.get(UNGROUPED_KEY)! })
      map.delete(UNGROUPED_KEY)
    }
    for (const heading of [...map.keys()].sort()) {
      groups.push({ heading, items: map.get(heading)! })
    }
    return groups
  }

  const filteredItems = computed(() => {
    if (customFilter) {
      const result = customFilter(items.value, searchQuery.value)
      if (result !== null) return result
    }
    if (!shouldFilter) return items.value
    return defaultFilter(items.value, searchQuery.value)
  })
  const groupedItems = computed(() => groupItems(filteredItems.value))

  function selectNext() {
    const total = filteredItems.value.length
    if (total === 0) return
    if (loop) {
      activeIndex.value = (activeIndex.value + 1) % total
    } else {
      activeIndex.value = Math.min(activeIndex.value + 1, total - 1)
    }
  }

  function selectPrev() {
    const total = filteredItems.value.length
    if (total === 0) return
    if (loop) {
      activeIndex.value = (activeIndex.value - 1 + total) % total
    } else {
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
    }
  }

  function selectCurrent() {
    const item = filteredItems.value[activeIndex.value]
    if (item && !item.disabled) {
      selectedValue.value = item.value
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
        selectedValue.value = item.value
        item.onSelect?.(item)
        onItemSelect?.(item)
        close()
        return
      }
    }
  }

  // Rebuild shortcut map whenever items change (deep: true also catches
  // in-place mutations like push/splice), and register global listener
  // if items have shortcuts
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
    { immediate: true, deep: true, flush: 'post' },
  )

  onUnmounted(() => {
    if (cleanupShortcuts) cleanupShortcuts()
  })

  return {
    visible,
    searchQuery,
    activeIndex,
    selectedValue,
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
