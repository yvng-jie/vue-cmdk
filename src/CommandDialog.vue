<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { CommandDialogProps, CommandRootEmits } from './types'
import { useCommandRoot } from './useCommandRoot'
import CommandInput from './CommandInput.vue'
import CommandList from './CommandList.vue'

const props = withDefaults(defineProps<CommandDialogProps>(), {
  visible: false,
  placeholder: 'Type a command or search...',
  autoFocus: true,
  closeOnSelect: true,
  items: () => [],
  loading: false,
  shouldFilter: true,
  loop: true,
})

const emit = defineEmits<CommandRootEmits>()

const { state } = useCommandRoot(
  {
    filter: props.filter,
    loading: props.loading,
    closeOnSelect: props.closeOnSelect,
    shouldFilter: props.shouldFilter,
    loop: props.loop,
    value: props.value,
  },
  emit,
)

const commandInputRef = ref<InstanceType<typeof CommandInput> | null>(null)

// Sync items prop with internal state
watch(
  () => props.items,
  (v) => {
    state.items.value = v
  },
  { immediate: true },
)

// Sync visible prop with internal state
watch(
  () => props.visible,
  (v) => {
    state.visible.value = v
  },
  { immediate: true },
)

// Also sync searchQuery prop with internal state (for v-model:searchQuery)
watch(
  () => props.searchQuery,
  (v) => {
    if (v !== undefined) state.searchQuery.value = v
  },
)
watch(state.searchQuery, (v) => emit('update:searchQuery', v))

watch(state.visible, async (v) => {
  emit('update:visible', v)
  if (v) {
    await nextTick()
    commandInputRef.value?.inputRef?.focus()
  }
})

function closeOnMask(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    state.close()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    state.close()
  }
  // Focus trap: keep Tab/Shift+Tab inside the dialog
  if (e.key === 'Tab') {
    const wrapper = e.currentTarget as EventTarget & HTMLElement
    const focusable = wrapper.querySelectorAll<HTMLElement>(
      'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault()
        last.focus()
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }
}
</script>

<template>
  <Teleport :to="container ?? 'body'">
    <Transition name="cmdk-dialog">
      <div
        v-if="state.visible.value"
        data-cmdk-dialog=""
        role="dialog"
        aria-modal="true"
        :aria-label="props.label ?? 'Command menu'"
        @keydown="onKeydown"
      >
        <div data-cmdk-dialog-mask="" aria-hidden="true" @click="closeOnMask" />
        <div data-cmdk-dialog-wrapper="">
          <div data-cmdk-dialog-header="">
            <slot name="header">
              <CommandInput
                ref="commandInputRef"
                :placeholder="placeholder"
                :auto-focus="autoFocus"
              />
            </slot>
          </div>
          <div data-cmdk-dialog-body="">
            <slot name="body">
              <CommandList />
            </slot>
          </div>
          <div v-if="$slots.footer" data-cmdk-dialog-footer="">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
