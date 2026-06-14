<script setup lang="ts">
import { inject, ref, computed } from 'vue'
import type { CommandItemData } from './types'
import { CMDK_STATE, CMDK_SELECT_HANDLER } from './injectionKeys'
import { injectStrict } from './utils/injectStrict'

withDefaults(
  defineProps<{
    placeholder?: string
    autoFocus?: boolean
  }>(),
  {
    placeholder: 'Type a command or search...',
    autoFocus: true,
  },
)

const state = injectStrict(CMDK_STATE, 'CommandInput')
const onItemSelect = inject(CMDK_SELECT_HANDLER, () => {})

const inputRef = ref<HTMLInputElement | null>(null)
defineExpose({ inputRef })

const activeDescendantId = computed(() => {
  const active = state.filteredItems.value[state.activeIndex.value]
  return active ? `cmdk-item-${active.value}` : undefined
})

function onInput(e: Event) {
  const target = e.target as (EventTarget & HTMLInputElement) | null
  if (target) {
    state.searchQuery.value = target.value
    state.activeIndex.value = 0
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    state.selectNext()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    state.selectPrev()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const item = state.filteredItems.value[state.activeIndex.value] as CommandItemData | undefined
    if (item && !item.disabled) {
      item.onSelect?.(item)
      onItemSelect(item)
    }
  }
}
</script>

<template>
  <input
    ref="inputRef"
    data-cmdk-input=""
    :value="state.searchQuery.value"
    :placeholder="placeholder"
    role="searchbox"
    :aria-activedescendant="activeDescendantId"
    autocomplete="off"
    autocorrect="off"
    spellcheck="false"
    :autofocus="autoFocus"
    @input="onInput"
    @keydown="onKeydown"
  />
</template>
