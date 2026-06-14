import { describe, it, expect, beforeEach } from 'vitest'
import { useCommandMenu } from '../useCommandMenu'
import type { CommandItemData } from '../types'

function createItems(): CommandItemData[] {
  return [
    { value: 'home', label: 'Home', keywords: ['dashboard'], group: 'Navigation' },
    { value: 'settings', label: 'Settings', shortcut: '⌘,', group: 'Actions' },
    { value: 'theme', label: 'Toggle theme', group: 'Actions' },
    { value: 'logout', label: 'Sign out', group: 'Actions' },
    { value: 'notifications', label: 'Notifications' },
  ]
}

describe('useCommandMenu', () => {
  let menu: ReturnType<typeof useCommandMenu>

  beforeEach(() => {
    menu = useCommandMenu()
    menu.items.value = createItems()
  })

  it('initializes with default state', () => {
    const m = useCommandMenu()
    expect(m.visible.value).toBe(false)
    expect(m.searchQuery.value).toBe('')
    expect(m.activeIndex.value).toBe(0)
    expect(m.items.value).toEqual([])
    expect(m.filteredItems.value).toEqual([])
    expect(m.groupedItems.value).toEqual([])
  })

  describe('open / close / toggle', () => {
    it('opens the menu and resets active index', () => {
      menu.activeIndex.value = 3
      menu.open()
      expect(menu.visible.value).toBe(true)
      expect(menu.activeIndex.value).toBe(0)
    })

    it('closes the menu and resets search query', () => {
      menu.open()
      menu.searchQuery.value = 'test'
      menu.close()
      expect(menu.visible.value).toBe(false)
      expect(menu.searchQuery.value).toBe('')
    })

    it('toggles visibility', () => {
      menu.toggle()
      expect(menu.visible.value).toBe(true)
      menu.toggle()
      expect(menu.visible.value).toBe(false)
    })
  })

  describe('defaultFilter', () => {
    it('returns all items when query is empty', () => {
      const result = menu.defaultFilter(menu.items.value, '')
      expect(result).toHaveLength(5)
    })

    it('filters by value', () => {
      const result = menu.defaultFilter(menu.items.value, 'home')
      expect(result).toHaveLength(1)
      expect(result[0].value).toBe('home')
    })

    it('filters by label', () => {
      const result = menu.defaultFilter(menu.items.value, 'Notifications')
      expect(result).toHaveLength(1)
    })

    it('filters by keywords', () => {
      const result = menu.defaultFilter(menu.items.value, 'dashboard')
      expect(result).toHaveLength(1)
      expect(result[0].value).toBe('home')
    })

    it('is case-insensitive', () => {
      const result = menu.defaultFilter(menu.items.value, 'HOME')
      expect(result).toHaveLength(1)
    })

    it('returns empty array when no match', () => {
      const result = menu.defaultFilter(menu.items.value, 'zzzzz')
      expect(result).toHaveLength(0)
    })
  })

  describe('filteredItems', () => {
    it('returns all items when no query', () => {
      expect(menu.filteredItems.value).toHaveLength(5)
    })

    it('filters items based on search query', () => {
      menu.searchQuery.value = 'set'
      expect(menu.filteredItems.value).toHaveLength(1)
      expect(menu.filteredItems.value[0].value).toBe('settings')
    })

    it('uses custom filter when provided', () => {
      const customFilter = (items: CommandItemData[], query: string) => {
        if (query === 'all') return items
        return items.filter((i) => i.group === query)
      }
      const m = useCommandMenu(customFilter)
      m.items.value = createItems()
      m.searchQuery.value = 'Actions'
      expect(m.filteredItems.value).toHaveLength(3)
    })

    it('falls back to default filter when custom filter returns null', () => {
      const customFilter = () => null
      const m = useCommandMenu(customFilter)
      m.items.value = createItems()
      m.searchQuery.value = 'home'
      expect(m.filteredItems.value).toHaveLength(1)
    })
  })

  describe('groupItems', () => {
    it('groups items by their group field', () => {
      const filtered = menu.items.value
      const groups = menu.groupItems(filtered)
      // ungrouped (notifications) + Navigation + Actions
      expect(groups).toHaveLength(3)
    })

    it('puts ungrouped items first', () => {
      const groups = menu.groupItems(menu.items.value)
      expect(groups[0].heading).toBe('')
      expect(groups[0].items[0].value).toBe('notifications')
    })

    it('sorts groups alphabetically', () => {
      const groups = menu.groupItems(menu.items.value)
      // After the ungrouped section, the next should be 'Actions', then 'Navigation'
      const headings = groups.map((g) => g.heading)
      expect(headings).toEqual(['', 'Actions', 'Navigation'])
    })
  })

  describe('groupedItems', () => {
    it('computed property returns grouped items', () => {
      expect(menu.groupedItems.value).toHaveLength(3)
    })
  })

  describe('keyboard navigation', () => {
    it('selectNext moves down and wraps around', () => {
      menu.searchQuery.value = '' // all items
      expect(menu.activeIndex.value).toBe(0)
      menu.selectNext()
      expect(menu.activeIndex.value).toBe(1)
      menu.activeIndex.value = 4 // last item
      menu.selectNext()
      expect(menu.activeIndex.value).toBe(0) // wraps
    })

    it('selectPrev moves up and wraps around', () => {
      menu.activeIndex.value = 0
      menu.selectPrev()
      expect(menu.activeIndex.value).toBe(4) // wraps to last
      menu.selectPrev()
      expect(menu.activeIndex.value).toBe(3)
    })

    it('selectNext does nothing with empty items', () => {
      const m = useCommandMenu()
      m.selectNext()
      expect(m.activeIndex.value).toBe(0)
    })

    it('selectPrev does nothing with empty items', () => {
      const m = useCommandMenu()
      m.selectPrev()
      expect(m.activeIndex.value).toBe(0)
    })
  })

  describe('selectCurrent', () => {
    it('selects the currently active item', () => {
      let selected: CommandItemData | undefined
      menu.items.value[0].onSelect = (item) => {
        selected = item
      }
      menu.open()
      menu.selectCurrent()
      expect(selected?.value).toBe('home')
      // Should close after select
      expect(menu.visible.value).toBe(false)
    })

    it('does nothing if no items', () => {
      const m = useCommandMenu()
      m.selectCurrent() // should not throw
    })

    it('skips disabled items', () => {
      let selected = false
      menu.items.value[0].disabled = true
      menu.items.value[0].onSelect = () => {
        selected = true
      }
      menu.open()
      menu.selectCurrent()
      expect(selected).toBe(false)
    })
  })

  describe('selectedValue', () => {
    it('sets selectedValue when item is selected', () => {
      menu.open()
      menu.selectCurrent()
      expect(menu.selectedValue.value).toBe('home')
    })

    it('selectedValue is undefined initially', () => {
      const m = useCommandMenu()
      expect(m.selectedValue.value).toBeUndefined()
    })
  })

  describe('shouldFilter', () => {
    it('filters by default (shouldFilter = true)', () => {
      menu.searchQuery.value = 'home'
      expect(menu.filteredItems.value).toHaveLength(1)
    })

    it('skips built-in filter when shouldFilter is false', () => {
      const m = useCommandMenu({ shouldFilter: false })
      m.items.value = createItems()
      m.searchQuery.value = 'nonexistent'
      // With shouldFilter=false and no custom filter, all items shown
      expect(m.filteredItems.value).toHaveLength(5)
    })

    it('still applies custom filter when shouldFilter is false', () => {
      const customFilter = (items: CommandItemData[], _query: string) =>
        items.filter((i) => i.group === 'Actions')
      const m = useCommandMenu({ filter: customFilter, shouldFilter: false })
      m.items.value = createItems()
      expect(m.filteredItems.value).toHaveLength(3)
    })

    it('fallback to all items when custom filter returns null and shouldFilter is false', () => {
      const customFilter = () => null
      const m = useCommandMenu({ filter: customFilter, shouldFilter: false })
      m.items.value = createItems()
      expect(m.filteredItems.value).toHaveLength(5)
    })
  })

  describe('loop', () => {
    it('wraps by default (loop = true)', () => {
      menu.activeIndex.value = 4 // last item
      menu.selectNext()
      expect(menu.activeIndex.value).toBe(0)
      menu.selectPrev()
      expect(menu.activeIndex.value).toBe(4)
    })

    it('stops at boundaries when loop is false', () => {
      const m = useCommandMenu({ loop: false })
      m.items.value = createItems()
      m.searchQuery.value = '' // all items
      m.activeIndex.value = 0
      m.selectPrev()
      expect(m.activeIndex.value).toBe(0) // stays at 0

      m.activeIndex.value = 4
      m.selectNext()
      expect(m.activeIndex.value).toBe(4) // stays at 4
    })

    it('selectNext moves within bounds when loop is false', () => {
      const m = useCommandMenu({ loop: false })
      m.items.value = createItems()
      m.searchQuery.value = ''
      m.activeIndex.value = 0
      m.selectNext()
      expect(m.activeIndex.value).toBe(1)
      m.selectNext()
      expect(m.activeIndex.value).toBe(2)
    })
  })
})
