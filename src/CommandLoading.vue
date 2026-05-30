<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      loading?: boolean
    }>(),
    {
      loading: false,
    },
  )
</script>

<template>
  <div
    v-if="loading"
    data-cmdk-loading=""
  >
    <slot>
      <span>Loading...</span>
    </slot>
  </div>
</template>
