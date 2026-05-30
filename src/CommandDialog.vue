<script setup lang="ts">
  import { watch, provide, nextTick } from 'vue'
  import type { CommandItemData } from './types'
  import type { FilterFn } from './useCommandMenu'
  import { useCommandMenu } from './useCommandMenu'
  import { CMDK_STATE, CMDK_LOADING, CMDK_CLOSE_ON_SELECT, CMDK_SELECT_HANDLER } from './injectionKeys'
  import CommandInput from './CommandInput.vue'
  import CommandList from './CommandList.vue'

  const props = withDefaults(
    defineProps<{
      visible?: boolean
      placeholder?: string
      autoFocus?: boolean
      closeOnSelect?: boolean
      /** Command items to display */
      items?: CommandItemData[]
      /** Custom filter function. Return items to display, or null to use the default filter. */
      filter?: FilterFn
      /** Show loading state */
      loading?: boolean
    }>(),
    {
      visible: false,
      placeholder: 'Type a command or search...',
      autoFocus: true,
      closeOnSelect: true,
      items: () => [],
      loading: false,
    },
  )

  const emit = defineEmits<{
    (e: 'update:visible', value: boolean): void
    (e: 'select', item: CommandItemData): void
  }>()

  const state = useCommandMenu(props.filter, handleItemSelect)
  provide(CMDK_STATE, state)
  provide(CMDK_LOADING, () => props.loading)
  provide(CMDK_CLOSE_ON_SELECT, () => props.closeOnSelect)

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

  watch(state.visible, async (v) => {
    emit('update:visible', v)
    if (v) {
      await nextTick()
      const input = document.querySelector<HTMLInputElement>('[data-cmdk-input]')
      input?.focus()
    }
  })

  /** Called by CommandItem when an item is selected */
  function handleItemSelect(item: CommandItemData) {
    emit('select', item)
    if (props.closeOnSelect) {
      state.close()
    }
  }
  provide(CMDK_SELECT_HANDLER, handleItemSelect)

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
      const wrapper = e.currentTarget as HTMLElement
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
  <Teleport to="body">
    <Transition name="cmdk-dialog">
      <div
        v-if="state.visible.value"
        data-cmdk-dialog=""
        @keydown="onKeydown"
      >
        <div
          data-cmdk-dialog-mask=""
          @click="closeOnMask"
        />
        <div data-cmdk-dialog-wrapper="">
          <div data-cmdk-dialog-header="">
            <slot name="header">
              <CommandInput
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
          <div
            v-if="$slots.footer"
            data-cmdk-dialog-footer=""
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
