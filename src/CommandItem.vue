<script setup lang="ts">
  import { inject, computed, type Component, type VNode } from 'vue'
  import type { CommandItemData } from './types'
  import { CMDK_STATE, CMDK_CLOSE_ON_SELECT, CMDK_SELECT_HANDLER, CMDK_ITEM_INDEX_MAP } from './injectionKeys'
  import { injectStrict } from './utils/injectStrict'

  const props = withDefaults(
    defineProps<{
      value: string
      label?: string
      keywords?: string[]
      shortcut?: string
      disabled?: boolean
      icon?: Component | VNode | (() => VNode)
      onSelect?: (item: CommandItemData) => void
    }>(),
    {
      disabled: false,
    },
  )

  const state = injectStrict(CMDK_STATE, 'CommandItem')
  const getIndexMap = inject(CMDK_ITEM_INDEX_MAP, () => new Map())

  const itemData = computed<CommandItemData>(() => ({
    value: props.value,
    label: props.label,
    keywords: props.keywords,
    shortcut: props.shortcut,
    disabled: props.disabled,
    icon: props.icon,
    onSelect: props.onSelect,
  }))

  const isActive = computed(() => {
    const active = state.filteredItems.value[state.activeIndex.value]
    return active?.value === props.value
  })

  const getCloseOnSelect = inject(CMDK_CLOSE_ON_SELECT, () => true)
  const onItemSelect = inject(CMDK_SELECT_HANDLER, () => {})

  function handleClick() {
    if (props.disabled) return
    props.onSelect?.(itemData.value)
    onItemSelect(itemData.value)
    if (getCloseOnSelect()) state.close()
  }
</script>

<template>
  <div
    data-cmdk-item=""
    role="option"
    :aria-selected="isActive"
    :aria-disabled="disabled"
    :data-value="value"
    :class="{ active: isActive, disabled }"
    @click="handleClick"
    @pointerenter="
      () => {
        const idx = getIndexMap().get(value)
        if (idx !== undefined) state.activeIndex.value = idx
      }
    "
  >
    <slot
      :item="itemData"
      :active="isActive"
    >
      <span
        v-if="icon"
        data-cmdk-item-icon=""
      >
        <component :is="icon" />
      </span>
      <span data-cmdk-item-label>{{ label || value }}</span>
      <span
        v-if="shortcut"
        data-cmdk-item-shortcut
      >
        {{ shortcut }}
      </span>
    </slot>
  </div>
</template>
