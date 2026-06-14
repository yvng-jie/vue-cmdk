import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CommandItem from '../CommandItem.vue'
import {
  CMDK_STATE,
  CMDK_CLOSE_ON_SELECT,
  CMDK_SELECT_HANDLER,
  CMDK_ITEM_INDEX_MAP,
} from '../injectionKeys'
import { ref, computed } from 'vue'
import type { UseCommandMenuReturn } from '../useCommandMenu'
import type { CommandItemData } from '../types'

function createMockState(): UseCommandMenuReturn {
  const items = ref<CommandItemData[]>([
    { value: 'home', label: 'Home' },
    { value: 'settings', label: 'Settings' },
  ])

  const filteredItems = computed(() => items.value)
  const groupedItems = computed(() => [{ heading: '', items: items.value }])
  const activeIndex = ref(0)
  const visible = ref(true)
  const searchQuery = ref('')

  const selectedValue = ref<string | undefined>()

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
    close: () => {
      visible.value = false
    },
    defaultFilter: (i) => i,
    groupItems: (i) => [{ heading: '', items: i }],
    selectNext: () => {
      activeIndex.value = Math.min(activeIndex.value + 1, filteredItems.value.length - 1)
    },
    selectPrev: () => {
      activeIndex.value = Math.max(activeIndex.value - 1, 0)
    },
    selectCurrent: () => {},
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mountItem(props: any, state?: UseCommandMenuReturn) {
  const s = state ?? createMockState()
  return mount(CommandItem, {
    props,
    global: {
      provide: {
        [CMDK_STATE as symbol]: s,
        [CMDK_CLOSE_ON_SELECT as symbol]: () => true,
        [CMDK_SELECT_HANDLER as symbol]: () => {},
        [CMDK_ITEM_INDEX_MAP as symbol]: () =>
          new Map<string, number>([
            ['home', 0],
            ['settings', 1],
          ]),
      },
    },
  })
}

describe('CommandItem', () => {
  it('renders label or falls back to value', () => {
    const wrapper = mountItem({ value: 'test', label: 'Test Label' })
    expect(wrapper.text()).toContain('Test Label')
  })

  it('falls back to value when no label', () => {
    const wrapper = mountItem({ value: 'test-value' })
    expect(wrapper.text()).toContain('test-value')
  })

  it('renders shortcut when provided', () => {
    const wrapper = mountItem({ value: 'test', label: 'Test', shortcut: '⌘T' })
    expect(wrapper.text()).toContain('⌘T')
  })

  it('sets aria-selected based on active state', () => {
    const wrapper = mountItem({ value: 'home', label: 'Home' })
    expect(wrapper.attributes('aria-selected')).toBe('true')
  })

  it('sets aria-disabled when disabled', () => {
    const wrapper = mountItem({ value: 'test', label: 'Test', disabled: true })
    expect(wrapper.attributes('aria-disabled')).toBe('true')
  })

  it('renders default slot content', () => {
    const wrapper = mountItem({ value: 'test', label: 'Test' })
    expect(wrapper.find('[data-cmdk-item-label]').exists()).toBe(true)
  })

  it('emits select on click', async () => {
    let selected = false
    const wrapper = mountItem({
      value: 'test',
      label: 'Test',
      onSelect: () => {
        selected = true
      },
    })
    await wrapper.trigger('click')
    expect(selected).toBe(true)
  })

  it('does not select when disabled', async () => {
    let selected = false
    const wrapper = mountItem({
      value: 'test',
      label: 'Test',
      disabled: true,
      onSelect: () => {
        selected = true
      },
    })
    await wrapper.trigger('click')
    expect(selected).toBe(false)
  })

  it('has proper role and attributes', () => {
    const wrapper = mountItem({ value: 'test', label: 'Test' })
    expect(wrapper.attributes('role')).toBe('option')
    expect(wrapper.attributes('data-value')).toBe('test')
  })
})
