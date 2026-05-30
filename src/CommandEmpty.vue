<script setup lang="ts">
  import { inject } from 'vue'
  import { CMDK_STATE } from './injectionKeys'

  const state = inject(CMDK_STATE)!
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
