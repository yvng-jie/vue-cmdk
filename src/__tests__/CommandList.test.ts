import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import CommandList from '../CommandList.vue'
import { CMDK_STATE, CMDK_LOADING, CMDK_A11Y_IDS } from '../injectionKeys'
import type { UseCommandMenuReturn } from '../useCommandMenu'
import type { CommandItemData } from '../types'

function createMockState(overrides: Partial<UseCommandMenuReturn> = {}): UseCommandMenuReturn {
  const items = ref<CommandItemData[]>([
    { value: 'home', label: 'Home', group: 'Navigation', keywords: ['dashboard'] },
    { value: 'settings', label: 'Settings', group: 'Actions', shortcut: '⌘,' },
    { value: 'notifications', label: 'Notifications' },
  ])
  const searchQuery = ref('')
  const activeIndex = ref(0)
  const visible = ref(true)
  const selectedValue = ref<string | undefined>()

  const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value
    const q = searchQuery.value.toLowerCase()
    return items.value.filter(
      (i) =>
        i.value.toLowerCase().includes(q) ||
        i.label?.toLowerCase().includes(q) ||
        i.keywords?.some((k) => k.toLowerCase().includes(q)),
    )
  })
  const groupedItems = computed(() => {
    const map = new Map<string, CommandItemData[]>()
    for (const item of filteredItems.value) {
      const key = item.group || '__ungrouped__'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(item)
    }
    const groups: { heading: string; items: CommandItemData[] }[] = []
    if (map.has('__ungrouped__')) {
      groups.push({ heading: '', items: map.get('__ungrouped__')! })
      map.delete('__ungrouped__')
    }
    for (const heading of [...map.keys()].sort()) {
      groups.push({ heading, items: map.get(heading)! })
    }
    return groups
  })

  return {
    visible,
    searchQuery,
    activeIndex,
    selectedValue,
    items,
    filteredItems,
    groupedItems,
    toggle: () => {},
    open: () => {},
    close: () => {},
    defaultFilter: (i) => i,
    groupItems: (_i) => [],
    selectNext: () => {},
    selectPrev: () => {},
    selectCurrent: () => {},
    ...overrides,
  }
}

function mountList(state?: UseCommandMenuReturn, loading = false) {
  const s = state ?? createMockState()
  return mount(CommandList, {
    global: {
      provide: {
        [CMDK_STATE as symbol]: s,
        [CMDK_LOADING as symbol]: () => loading,
        [CMDK_A11Y_IDS as symbol]: {
          inputId: 'cmdk-test-input',
          listboxId: 'cmdk-test-listbox',
          optionId: (value: string) => `cmdk-test-option-${value}`,
        },
      },
    },
  })
}

describe('CommandList', () => {
  it('renders all items grouped', () => {
    const wrapper = mountList()
    expect(wrapper.findAll('[data-cmdk-item]')).toHaveLength(3)
  })

  it('renders group headings', () => {
    const wrapper = mountList()
    expect(wrapper.text()).toContain('Navigation')
    expect(wrapper.text()).toContain('Actions')
  })

  it('renders ungrouped items without heading', () => {
    const wrapper = mountList()
    const groups = wrapper.findAll('[data-cmdk-group]')
    const firstGroup = groups[0]
    expect(firstGroup.find('[data-cmdk-group-heading]').exists()).toBe(false)
  })

  it('renders separators between groups', () => {
    const wrapper = mountList()
    const separators = wrapper.findAll('[data-cmdk-separator]')
    // 3 groups → 2 separators
    expect(separators).toHaveLength(2)
  })

  it('shows CommandEmpty when no results', () => {
    const state = createMockState()
    state.searchQuery.value = 'zzzzz'
    const wrapper = mountList(state)
    expect(wrapper.find('[data-cmdk-empty]').exists()).toBe(true)
  })

  it('does not show CommandEmpty when results exist', () => {
    const wrapper = mountList()
    expect(wrapper.find('[data-cmdk-empty]').exists()).toBe(false)
  })

  it('shows CommandLoading when loading', () => {
    const wrapper = mountList(undefined, true)
    expect(wrapper.find('[data-cmdk-loading]').exists()).toBe(true)
  })

  it('hides CommandLoading when not loading', () => {
    const wrapper = mountList(undefined, false)
    expect(wrapper.find('[data-cmdk-loading]').exists()).toBe(false)
  })

  it('passes keywords prop to CommandItem', () => {
    const wrapper = mountList()
    const item = wrapper.find('[data-value="home"]')
    expect(item.exists()).toBe(true)
  })

  it('renders shortcut on items', () => {
    const wrapper = mountList()
    const item = wrapper.find('[data-value="settings"]')
    expect(item.text()).toContain('⌘,')
  })

  it('has aria-live region for screen readers', () => {
    const wrapper = mountList()
    expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
  })

  it('has proper role on the list', () => {
    const wrapper = mountList()
    expect(wrapper.find('[data-cmdk-list]').attributes('role')).toBe('listbox')
  })
})
