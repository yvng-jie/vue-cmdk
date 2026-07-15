import { ref, computed, watch, onUnmounted, type Ref, type ComputedRef } from 'vue'
import type { CommandItemData, CommandGroupData, CommandPage } from './types'
import { parseShortcut, eventMatchesShortcut } from './utils/shortcut'

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
  /** Page navigation stack for sub-menus */
  pageStack: Ref<CommandPage[]>
  /** Whether there is a parent page to go back to */
  canGoBack: ComputedRef<boolean>
  /** Title of the current page (from the item that opened it) */
  pageTitle: ComputedRef<string>
  /** Push a sub-page onto the stack */
  pushPage: (subItems: CommandItemData[], title: string) => void
  /** Pop back to the parent page */
  goBack: () => void
}

const UNGROUPED_KEY = '__ungrouped__'

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

  /* ── Page stack for nested sub-menus ── */
  const pageStack = ref<CommandPage[]>([])
  const canGoBack = computed(() => pageStack.value.length > 0)
  const pageTitle = computed(() => {
    if (pageStack.value.length === 0) return ''
    return pageStack.value[pageStack.value.length - 1].title
  })

  function pushPage(subItems: CommandItemData[], title: string) {
    pageStack.value.push({
      items: items.value,
      searchQuery: searchQuery.value,
      activeIndex: activeIndex.value,
      title,
    })
    items.value = subItems
    searchQuery.value = ''
    activeIndex.value = 0
  }

  function goBack() {
    if (pageStack.value.length === 0) return
    const prev = pageStack.value.pop()!
    items.value = prev.items
    searchQuery.value = prev.searchQuery
    activeIndex.value = prev.activeIndex
  }

  const toggle = () => {
    visible.value = !visible.value
  }
  const open = () => {
    visible.value = true
    activeIndex.value = 0
    pageStack.value = []
  }
  const close = () => {
    visible.value = false
    searchQuery.value = ''
    pageStack.value = []
  }

  /** Default filter: simple case-insensitive match against value, label, and keywords */
  function defaultFilter(allItems: CommandItemData[], query: string): CommandItemData[] {
    if (!query.trim()) return allItems
    const q = query.toLowerCase()
    return allItems.filter((item) => {
      if (item.forceMount) return true
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
      // If the item has children, navigate to sub-page instead of selecting
      if (item.children && item.children.length > 0) {
        pushPage(item.children, item.label || item.value)
        return
      }
      selectedValue.value = item.value
      item.onSelect?.(item)
      onItemSelect?.(item)
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

  // Rebuild shortcut map whenever items array is replaced, and register
  // global listener if items have shortcuts
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
    { immediate: true },
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
    pageStack,
    canGoBack,
    pageTitle,
    pushPage,
    goBack,
  }
}
