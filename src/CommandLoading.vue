<script setup lang="ts">
defineProps<{
  loading?: boolean
}>()
</script>

<template>
  <div v-if="loading" data-cmdk-loading="">
    <slot>
      <span>Loading...</span>
    </slot>
  </div>
</template>
