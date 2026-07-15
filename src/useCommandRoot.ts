import { computed, provide, unref, watch, type Ref } from 'vue'
import type { CommandItemData, CommandRootEmits } from './types'
import { useCommandMenu, type FilterFn, type UseCommandMenuOptions } from './useCommandMenu'
import {
  CMDK_STATE,
  CMDK_LOADING,
  CMDK_CLOSE_ON_SELECT,
  CMDK_SELECT_HANDLER,
  CMDK_ITEM_INDEX_MAP,
  CMDK_A11Y_IDS,
} from './injectionKeys'

export interface UseCommandRootOptions {
  filter?: FilterFn
  loading?: boolean | Ref<boolean>
  closeOnSelect?: boolean
  shouldFilter?: boolean
  loop?: boolean
  value?: string
}

let cmdkInstanceCount = 0

function createOptionId(baseId: string, value: string): string {
  return `${baseId}-option-${
    value
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'item'
  }`
}

export interface UseCommandRootReturn {
  state: ReturnType<typeof useCommandMenu>
  handleSelect: (item: CommandItemData) => void
}

/**
 * Shared composable for root command components (Menu, Dialog).
 *
 * - Creates the command menu state
 * - Provides all injection keys so child components can consume them
 * - Returns the state and a select handler
 */
export function useCommandRoot(
  options: UseCommandRootOptions,
  emit: CommandRootEmits,
  onItemSelect?: (item: CommandItemData) => void,
): UseCommandRootReturn {
  const {
    filter,
    loading = false,
    closeOnSelect = true,
    shouldFilter = true,
    loop = true,
  } = options
  const getLoading = () => unref(loading)

  const menuOptions: UseCommandMenuOptions = { filter, shouldFilter, loop }

  const state = useCommandMenu(menuOptions, (item: CommandItemData) => {
    emit('select', item)
    emit('update:value', item.value)
    onItemSelect?.(item)
    if (closeOnSelect) state.close()
  })

  watch(
    () => options.value,
    (v) => {
      if (v !== undefined) state.selectedValue.value = v
    },
    { immediate: true },
  )

  provide(CMDK_STATE, state)
  provide(CMDK_LOADING, getLoading)
  provide(CMDK_CLOSE_ON_SELECT, () => closeOnSelect)
  provide(CMDK_SELECT_HANDLER, (item: CommandItemData) => {
    // If the item has children, navigate to sub-page instead of emitting select
    if (item.children && item.children.length > 0) {
      state.pushPage(item.children, item.label || item.value)
      return
    }
    emit('select', item)
    emit('update:value', item.value)
    onItemSelect?.(item)
    if (closeOnSelect) state.close()
  })

  const baseId = `cmdk-${++cmdkInstanceCount}`
  provide(CMDK_A11Y_IDS, {
    inputId: `${baseId}-input`,
    listboxId: `${baseId}-listbox`,
    optionId: (value: string) => createOptionId(baseId, value),
  })

  /** O(1) value to index lookup for hover targetting. */
  const valueIndexMap = computed(() => {
    const map = new Map<string, number>()
    state.filteredItems.value.forEach((item, idx) => map.set(item.value, idx))
    return map
  })
  provide(CMDK_ITEM_INDEX_MAP, () => valueIndexMap.value)

  function handleSelect(item: CommandItemData) {
    emit('select', item)
    emit('update:value', item.value)
    onItemSelect?.(item)
    if (closeOnSelect) state.close()
  }

  return { state, handleSelect }
}
