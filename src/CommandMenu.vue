<script setup lang="ts">
  import { provide, watch } from 'vue'
  import type { CommandRootProps, CommandRootEmits } from './types'
  import { useCommandRoot } from './useCommandRoot'

  const props = withDefaults(defineProps<CommandRootProps>(), {
    placeholder: 'Type a command or search...',
    autoFocus: true,
    closeOnSelect: true,
  })

  const emit = defineEmits<CommandRootEmits>()

  const { state, handleSelect } = useCommandRoot(
    {
      filter: props.filter,
      loading: props.loading,
      closeOnSelect: props.closeOnSelect,
    },
    emit,
  )

  // Sync visible prop with internal state
  state.visible.value = props.visible ?? true
  state.searchQuery.value = props.searchQuery ?? ''

  provide('cmdk-filter', props.filter)

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
