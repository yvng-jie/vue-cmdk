<script setup lang="ts">
  import { CMDK_STATE } from './injectionKeys'
  import { injectStrict } from './utils/injectStrict'

  const state = injectStrict(CMDK_STATE, 'CommandEmpty')
</script>

<template>
  <div
    v-if="state.searchQuery.value && state.filteredItems.value.length === 0"
    data-cmdk-empty=""
  >
    <slot>
      <span>No results found.</span>
    </slot>
  </div>
</template>
