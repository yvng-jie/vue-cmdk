<script setup lang="ts">
  import { inject, computed } from 'vue'
  import type { CommandGroupData } from './types'
  import { CMDK_STATE, CMDK_LOADING } from './injectionKeys'
  import { injectStrict } from './utils/injectStrict'
  import CommandEmpty from './CommandEmpty.vue'
  import CommandLoading from './CommandLoading.vue'
  import CommandGroup from './CommandGroup.vue'
  import CommandItem from './CommandItem.vue'
  import CommandSeparator from './CommandSeparator.vue'

  const state = injectStrict(CMDK_STATE, 'CommandList')
  const getLoading = inject(CMDK_LOADING, () => false)

  const grouped = computed(() => state.groupedItems.value as CommandGroupData[])
</script>

<template>
  <div
    data-cmdk-list=""
    role="listbox"
  >
    <div
      aria-live="polite"
      aria-atomic="true"
      class="sr-only"
    >
      <template v-if="state.searchQuery.value && state.filteredItems.value.length === 0">No results found</template>
      <template v-else-if="getLoading()">Loading</template>
      <template v-else>{{ state.filteredItems.value.length }} items</template>
    </div>
    <CommandEmpty />
    <CommandLoading :loading="getLoading()" />

    <template
      v-for="group in grouped"
      :key="group.heading || '__ungrouped__'"
    >
      <CommandGroup :heading="group.heading">
        <CommandItem
          v-for="item in group.items"
          :key="item.value"
          :value="item.value"
          :label="item.label"
          :shortcut="item.shortcut"
          :disabled="item.disabled"
          :icon="item.icon"
          :on-select="item.onSelect"
        />
      </CommandGroup>
      <CommandSeparator v-if="group !== grouped[grouped.length - 1]" />
    </template>
  </div>
</template>
