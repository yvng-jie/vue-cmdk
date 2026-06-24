import { computed, provide, watch } from 'vue'
import type { CommandItemData, CommandRootEmits } from './types'
import { useCommandMenu, type FilterFn, type UseCommandMenuOptions } from './useCommandMenu'
import {
  CMDK_STATE,
  CMDK_LOADING,
  CMDK_CLOSE_ON_SELECT,
  CMDK_SELECT_HANDLER,
  CMDK_ITEM_INDEX_MAP,
} from './injectionKeys'

export interface UseCommandRootOptions {
  filter?: FilterFn
  loading?: boolean
  closeOnSelect?: boolean
  shouldFilter?: boolean
  loop?: boolean
  value?: string
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

  const menuOptions: UseCommandMenuOptions = { filter, shouldFilter, loop }

  const state = useCommandMenu(menuOptions, (item: CommandItemData) => {
    emit('select', item)
    emit('update:value', item.value)
    onItemSelect?.(item)
    if (closeOnSelect) state.close()
  })

  // Sync controlled value prop → internal selectedValue
  watch(
    () => options.value,
    (v) => {
      if (v !== undefined) state.selectedValue.value = v
    },
    { immediate: true },
  )

  provide(CMDK_STATE, state)
  provide(CMDK_LOADING, () => loading)
  provide(CMDK_CLOSE_ON_SELECT, () => closeOnSelect)
  provide(CMDK_SELECT_HANDLER, (item: CommandItemData) => {
    emit('select', item)
    emit('update:value', item.value)
    onItemSelect?.(item)
    if (closeOnSelect) state.close()
  })

  /** O(1) value→index lookup for hover targetting */
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
