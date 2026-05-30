<script setup lang="ts">
  import { provide, watch, computed, type Ref } from 'vue'
  import type { CommandItemData, CommandRootProps, CommandRootEmits } from './types'
  import { useCommandMenu } from './useCommandMenu'
  import { CMDK_STATE, CMDK_LOADING, CMDK_CLOSE_ON_SELECT, CMDK_SELECT_HANDLER } from './injectionKeys'

  const props = withDefaults(defineProps<CommandRootProps>(), {
    placeholder: 'Type a command or search...',
    autoFocus: true,
    closeOnSelect: true,
  })

  const emit = defineEmits<CommandRootEmits>()

  const state = useCommandMenu(props.filter, (item: CommandItemData) => {
    emit('select', item)
    if (props.closeOnSelect) state.close()
  })

  // Sync visible prop with internal state
  state.visible.value = props.visible ?? true
  state.searchQuery.value = props.searchQuery ?? ''

  // Provide state to child components
  provide(CMDK_STATE, state)
  provide('cmdk-filter', props.filter)
  provide(CMDK_LOADING, () => props.loading ?? false)
  provide(CMDK_CLOSE_ON_SELECT, () => props.closeOnSelect)
  provide(CMDK_SELECT_HANDLER, (item: CommandItemData) => {
    emit('select', item)
    if (props.closeOnSelect) state.close()
  })
  watch(
    () => props.visible,
    (v) => {
      if (v !== undefined) state.visible.value = v
    },
  )
  watch(state.visible, (v) => emit('update:visible', v))

  watch(
    () => props.searchQuery,
    (v) => {
      if (v !== undefined) state.searchQuery.value = v
    },
  )
  watch(state.searchQuery, (v) => emit('update:searchQuery', v))

  function handleSelect(item: CommandItemData) {
    emit('select', item)
    if (props.closeOnSelect) state.close()
  }

  // Expose public API
  defineExpose({
    open: state.open,
    close: state.close,
    toggle: state.toggle,
    searchQuery: state.searchQuery,
    items: state.items,
    filteredItems: state.filteredItems,
  })
</script>

<template>
  <div
    data-cmdk-root=""
    role="combobox"
    aria-expanded="true"
    aria-haspopup="listbox"
  >
    <slot
      :items="state.items"
      :filtered-items="state.filteredItems"
      :search-query="state.searchQuery"
      :select-next="state.selectNext"
      :select-prev="state.selectPrev"
      :select-current="state.selectCurrent"
      :handle-select="handleSelect"
    />
  </div>
</template>
