<script setup lang="ts">
import { inject, computed, isVNode, type Component, type VNode } from 'vue'
import type { CommandItemData } from './types'
import { CMDK_A11Y_IDS, CMDK_STATE, CMDK_SELECT_HANDLER, CMDK_ITEM_INDEX_MAP } from './injectionKeys'
import { injectStrict } from './utils/injectStrict'
import { highlightText } from './utils/highlight'

const props = withDefaults(
  defineProps<{
    value: string
    label?: string
    keywords?: string[]
    shortcut?: string
    disabled?: boolean
    forceMount?: boolean
    icon?: Component | VNode | (() => VNode)
    onSelect?: (item: CommandItemData) => void
  }>(),
  {
    disabled: false,
    forceMount: false,
    label: undefined,
    keywords: undefined,
    shortcut: undefined,
    icon: undefined,
    onSelect: undefined,
  },
)

const state = injectStrict(CMDK_STATE, 'CommandItem')
const a11y = injectStrict(CMDK_A11Y_IDS, 'CommandItem')
const getIndexMap = inject(CMDK_ITEM_INDEX_MAP, () => new Map())

const itemData = computed<CommandItemData>(() => ({
  value: props.value,
  label: props.label,
  keywords: props.keywords,
  shortcut: props.shortcut,
  disabled: props.disabled,
  forceMount: props.forceMount,
  icon: props.icon,
  onSelect: props.onSelect,
}))

const iconComponent = computed(() => {
  if (!props.icon) return null
  if (isVNode(props.icon)) {
    return () => props.icon as VNode
  }
  return props.icon
})

const isActive = computed(() => {
  const active = state.filteredItems.value[state.activeIndex.value]
  return active?.value === props.value
})

const onItemSelect = inject(CMDK_SELECT_HANDLER, () => {})

const displayLabel = computed(() => props.label || props.value)
const highlightedLabel = computed(() => {
  const query = state.searchQuery.value
  if (!query.trim()) return null
  return highlightText(displayLabel.value, query)
})

function handleClick() {
  if (props.disabled) return
  props.onSelect?.(itemData.value)
  onItemSelect(itemData.value)
}
</script>

<template>
  <div
    :id="a11y.optionId(value)"
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
        v-if="iconComponent"
        data-cmdk-item-icon=""
      >
        <component :is="iconComponent" />
      </span>
      <span data-cmdk-item-label>
        <template v-if="highlightedLabel">
          <template
            v-for="(segment, idx) in highlightedLabel"
            :key="idx"
          >
            <mark v-if="segment.highlighted">{{ segment.text }}</mark>
            <span v-else>{{ segment.text }}</span>
          </template>
        </template>
        <template v-else>{{ displayLabel }}</template>
      </span>
      <span
        v-if="shortcut"
        data-cmdk-item-shortcut
      >
        {{ shortcut }}
      </span>
    </slot>
  </div>
</template>
