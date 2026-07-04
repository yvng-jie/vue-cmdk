import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, computed } from 'vue'
import CommandInput from '../CommandInput.vue'
import { CMDK_STATE, CMDK_SELECT_HANDLER, CMDK_A11Y_IDS } from '../injectionKeys'
import type { UseCommandMenuReturn } from '../useCommandMenu'
import type { CommandItemData } from '../types'

function createMockState(overrides: Partial<UseCommandMenuReturn> = {}): UseCommandMenuReturn {
  const searchQuery = ref('')
  const activeIndex = ref(0)
  const items = ref<CommandItemData[]>([
    { value: 'home', label: 'Home' },
    { value: 'settings', label: 'Settings' },
    { value: 'theme', label: 'Toggle theme' },
  ])
  const visible = ref(true)
  const selectedValue = ref<string | undefined>()

  const filteredItems = computed(() => {
    if (!searchQuery.value) return items.value
    const q = searchQuery.value.toLowerCase()
    return items.value.filter(
      (i) => i.value.toLowerCase().includes(q) || i.label?.toLowerCase().includes(q),
    )
  })
  const groupedItems = computed(() => [{ heading: '', items: filteredItems.value }])

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
    groupItems: (i) => [{ heading: '', items: i }],
    selectNext: () => {
      const total = filteredItems.value.length
      if (total > 0) activeIndex.value = (activeIndex.value + 1) % total
    },
    selectPrev: () => {
      const total = filteredItems.value.length
      if (total > 0) activeIndex.value = (activeIndex.value - 1 + total) % total
    },
    selectCurrent: () => {},
    ...overrides,
  }
}

function mountInput(state?: UseCommandMenuReturn) {
  const s = state ?? createMockState()
  return mount(CommandInput, {
    props: {
      placeholder: 'Search...',
      autoFocus: true,
    },
    global: {
      provide: {
        [CMDK_STATE as symbol]: s,
        [CMDK_SELECT_HANDLER as symbol]: () => {},
        [CMDK_A11Y_IDS as symbol]: {
          inputId: 'cmdk-test-input',
          listboxId: 'cmdk-test-listbox',
          optionId: (value: string) => `cmdk-test-option-${value}`,
        },
      },
    },
  })
}

describe('CommandInput', () => {
  it('renders input with placeholder', () => {
    const wrapper = mountInput()
    const input = wrapper.find('[data-cmdk-input]')
    expect(input.exists()).toBe(true)
    expect(input.attributes('placeholder')).toBe('Search...')
  })

  it('has combobox role', () => {
    const wrapper = mountInput()
    expect(wrapper.find('[data-cmdk-input]').attributes('role')).toBe('combobox')
  })

  it('has autocomplete and spellcheck disabled', () => {
    const wrapper = mountInput()
    const input = wrapper.find('[data-cmdk-input]')
    expect(input.attributes('autocomplete')).toBe('off')
    expect(input.attributes('autocorrect')).toBe('off')
    expect(input.attributes('spellcheck')).toBe('false')
  })

  it('updates searchQuery on input', async () => {
    const state = createMockState()
    const wrapper = mountInput(state)
    const input = wrapper.find('[data-cmdk-input]')
    await input.setValue('test')
    expect(state.searchQuery.value).toBe('test')
  })

  it('resets activeIndex on input', async () => {
    const state = createMockState()
    state.activeIndex.value = 2
    const wrapper = mountInput(state)
    await wrapper.find('[data-cmdk-input]').setValue('new')
    expect(state.activeIndex.value).toBe(0)
  })

  it('calls selectNext on ArrowDown', async () => {
    const state = createMockState()
    const wrapper = mountInput(state)
    const input = wrapper.find('[data-cmdk-input]')
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(state.activeIndex.value).toBe(1)
  })

  it('calls selectPrev on ArrowUp', async () => {
    const state = createMockState()
    state.activeIndex.value = 1
    const wrapper = mountInput(state)
    await wrapper.find('[data-cmdk-input]').trigger('keydown', { key: 'ArrowUp' })
    expect(state.activeIndex.value).toBe(0)
  })

  it('selects current item on Enter', async () => {
    const state = createMockState()
    let selected = false
    const onItemSelect = (_item: CommandItemData) => {
      selected = true
    }
    const wrapper = mount(CommandInput, {
      props: { placeholder: 'Search...', autoFocus: true },
      global: {
        provide: {
          [CMDK_STATE as symbol]: state,
          [CMDK_SELECT_HANDLER as symbol]: onItemSelect,
          [CMDK_A11Y_IDS as symbol]: {
            inputId: 'cmdk-test-input',
            listboxId: 'cmdk-test-listbox',
            optionId: (value: string) => `cmdk-test-option-${value}`,
          },
        },
      },
    })
    await wrapper.find('[data-cmdk-input]').trigger('keydown', { key: 'Enter' })
    expect(selected).toBe(true)
  })

  it('sets aria-activedescendant based on active item', () => {
    const state = createMockState()
    const wrapper = mountInput(state)
    const input = wrapper.find('[data-cmdk-input]')
    expect(input.attributes('aria-activedescendant')).toBe('cmdk-test-option-home')
  })

  it('updates aria-activedescendant when activeIndex changes', async () => {
    const state = createMockState()
    const wrapper = mountInput(state)
    state.activeIndex.value = 1
    await wrapper.vm.$nextTick()
    const input = wrapper.find('[data-cmdk-input]')
    expect(input.attributes('aria-activedescendant')).toBe('cmdk-test-option-settings')
  })

  it('exposes inputRef', () => {
    const wrapper = mountInput()
    expect(wrapper.vm.inputRef).toBeTruthy()
  })
})
