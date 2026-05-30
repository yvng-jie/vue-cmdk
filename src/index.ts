import CommandMenu from './CommandMenu.vue'
import CommandDialog from './CommandDialog.vue'
import CommandInput from './CommandInput.vue'
import CommandList from './CommandList.vue'
import CommandGroup from './CommandGroup.vue'
import CommandItem from './CommandItem.vue'
import CommandEmpty from './CommandEmpty.vue'
import CommandSeparator from './CommandSeparator.vue'
import CommandLoading from './CommandLoading.vue'

export { useCommandMenu } from './useCommandMenu'
export type * from './types'

/**
 * Namespaced `Command` object for the `<Command.Item />` syntax.
 */
export interface CommandComponents {
  Menu: typeof CommandMenu
  Dialog: typeof CommandDialog
  Input: typeof CommandInput
  List: typeof CommandList
  Group: typeof CommandGroup
  Item: typeof CommandItem
  Empty: typeof CommandEmpty
  Separator: typeof CommandSeparator
  Loading: typeof CommandLoading
}

export const Command: CommandComponents = {
  Menu: CommandMenu,
  Dialog: CommandDialog,
  Input: CommandInput,
  List: CommandList,
  Group: CommandGroup,
  Item: CommandItem,
  Empty: CommandEmpty,
  Separator: CommandSeparator,
  Loading: CommandLoading,
}

export {
  CommandMenu,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandItem,
  CommandEmpty,
  CommandSeparator,
  CommandLoading,
}
