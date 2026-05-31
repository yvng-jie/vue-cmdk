// Post-build script: generate a clean index.d.ts barrel export
// vite-plugin-dts has issues with Vue SFC type exports (TS2742),
// so we write the type entry point manually.
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dist = resolve(__dirname, '..', 'dist')

const COMPONENTS = [
  'CommandMenu',
  'CommandDialog',
  'CommandInput',
  'CommandList',
  'CommandGroup',
  'CommandItem',
  'CommandEmpty',
  'CommandSeparator',
  'CommandLoading',
]

const cmdTypeEntries = COMPONENTS.map((c) => `  ${c}: Component`).join('\n')
const namedExports = COMPONENTS.map((c) => `export const ${c}: Component`).join('\n')

const content = `// vue-cmdk — type definitions
export { useCommandMenu } from './useCommandMenu'
export type { FilterFn, UseCommandMenuReturn } from './useCommandMenu'
export type * from './types'

import type { Component } from 'vue'

export const Command: {
${cmdTypeEntries}
}
${namedExports}
`

writeFileSync(resolve(dist, 'index.d.ts'), content, 'utf-8')
console.log('✓ dist/index.d.ts written')
