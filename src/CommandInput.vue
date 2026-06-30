<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { CommandItemData } from './types'
import { CMDK_A11Y_IDS, CMDK_STATE, CMDK_SELECT_HANDLER } from './injectionKeys'
import { injectStrict } from './utils/injectStrict'

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    autoFocus?: boolean
  }>(),
  {
    label: 'Command menu',
    placeholder: 'Type a command or search...',
    autoFocus: true,
  },
)

const state = injectStrict(CMDK_STATE, 'CommandInput')
const a11y = injectStrict(CMDK_A11Y_IDS, 'CommandInput')
const onItemSelect = inject(CMDK_SELECT_HANDLER, () => {})

const inputRef = ref<HTMLInputElement | null>(null)
defineExpose({ inputRef })

const activeDescendant = computed(() => {
  const activeItem = state.filteredItems.value[state.activeIndex.value]
  if (!state.visible.value || !activeItem) return undefined
  return a11y.optionId(activeItem.value)
})

function onInput(e: Event) {
  state.searchQuery.value = (e.target as HTMLInputElement).value
  state.activeIndex.value = 0
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
    :id="a11y.inputId"
    :value="state.searchQuery.value"
    :aria-activedescendant="activeDescendant"
    :aria-controls="a11y.listboxId"
    :aria-expanded="state.visible.value"
    :aria-haspopup="'listbox'"
    :aria-label="props.label"
    aria-autocomplete="list"
    :placeholder="placeholder"
    role="combobox"
    autocomplete="off"
    autocorrect="off"
    spellcheck="false"
    :autofocus="autoFocus"
    @input="onInput"
    @keydown="onKeydown"
  />
</template>
