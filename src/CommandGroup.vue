<script setup lang="ts">
defineProps<{
  heading?: string
}>()
</script>

<template>
  <div data-cmdk-group="" role="group">
    <div v-if="heading" data-cmdk-group-heading="" role="presentation">
      {{ heading }}
    </div>
    <div data-cmdk-group-items="" role="group">
      <slot />
    </div>
  </div>
</template>
