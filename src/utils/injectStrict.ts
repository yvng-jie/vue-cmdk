import { inject, type InjectionKey } from 'vue'

/**
 * Type-safe inject that throws a clear error when a required value is missing.
 *
 * Use this instead of `inject(key)!` to get early feedback when a child
 * component is used outside of `<CommandMenu>` or `<CommandDialog>`.
 */
export function injectStrict<T>(key: InjectionKey<T>, componentName: string): T {
  const value = inject(key)
  if (value === undefined || value === null) {
    throw new Error(
      `[vue-cmdk] <${componentName}> must be used inside <CommandMenu> or <CommandDialog>.`,
    )
  }
  return value
}
