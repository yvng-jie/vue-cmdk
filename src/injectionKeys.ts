import type { InjectionKey } from 'vue'
import type { CommandItemData } from './types'
import type { UseCommandMenuReturn } from './useCommandMenu'

export const CMDK_STATE: InjectionKey<UseCommandMenuReturn> = Symbol('cmdk-state')
export const CMDK_LOADING: InjectionKey<() => boolean> = Symbol('cmdk-loading')
export const CMDK_CLOSE_ON_SELECT: InjectionKey<() => boolean> = Symbol('cmdk-close-on-select')
export const CMDK_SELECT_HANDLER: InjectionKey<(item: CommandItemData) => void> =
  Symbol('cmdk-select-handler')
export const CMDK_ITEM_INDEX_MAP: InjectionKey<() => Map<string, number>> =
  Symbol('cmdk-item-index-map')
export const CMDK_A11Y_IDS: InjectionKey<{
  inputId: string
  listboxId: string
  optionId: (value: string) => string
}> = Symbol('cmdk-a11y-ids')
