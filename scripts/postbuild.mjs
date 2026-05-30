// Post-build script: generate a clean index.d.ts barrel export
// vite-plugin-dts has issues with Vue SFC type exports (TS2742),
// so we write the type entry point manually.
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = resolve(__dirname, '..', 'dist')

const content = `// vue-cmdk — type definitions
export { useCommandMenu } from './useCommandMenu'
export type { FilterFn, UseCommandMenuReturn } from './useCommandMenu'
export type * from './types'

import type { Component } from 'vue'

export const Command: {
  Menu: Component
  Dialog: Component
  Input: Component
  List: Component
  Group: Component
  Item: Component
  Empty: Component
  Separator: Component
  Loading: Component
}
export const CommandMenu: Component
export const CommandDialog: Component
export const CommandInput: Component
export const CommandList: Component
export const CommandGroup: Component
export const CommandItem: Component
export const CommandEmpty: Component
export const CommandSeparator: Component
export const CommandLoading: Component
`

writeFileSync(resolve(dist, 'index.d.ts'), content, 'utf-8')
console.log('✓ dist/index.d.ts written')
