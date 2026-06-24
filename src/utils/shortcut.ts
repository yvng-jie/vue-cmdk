/** Map display characters to KeyboardEvent modifier properties */
const MODIFIER_MAP: Record<string, 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey'> = {
  '⌘': 'metaKey',
  '⌃': 'ctrlKey',
  '⌥': 'altKey',
  '⇧': 'shiftKey',
}

/** Regex to match leading modifier symbols followed by a key character */
const MODIFIER_PATTERN = /^([⌘⌃⌥⇧]+)(.+)$/

/** Parsed shortcut descriptor */
export interface ShortcutDescriptor {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}

/** Parse a shortcut string like "⌘S" or "⌘⇧F" into a key+modifiers descriptor */
export function parseShortcut(shortcut: string): ShortcutDescriptor | null {
  if (!shortcut) return null
  const match = MODIFIER_PATTERN.exec(shortcut)
  if (!match) return { key: shortcut.toLowerCase() }

  const [, modSymbols, key] = match
  const mods: Partial<Record<'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey', boolean>> = {}
  for (const ch of modSymbols) {
    const prop = MODIFIER_MAP[ch]
    if (prop) mods[prop] = true
  }
  return { ...mods, key: key.toLowerCase() }
}

/** Check if a KeyboardEvent matches a parsed shortcut descriptor */
export function eventMatchesShortcut(e: KeyboardEvent, desc: ShortcutDescriptor | null): boolean {
  if (!desc) return false
  return (
    e.key.toLowerCase() === desc.key &&
    !!e.metaKey === !!desc.metaKey &&
    !!e.ctrlKey === !!desc.ctrlKey &&
    !!e.altKey === !!desc.altKey &&
    !!e.shiftKey === !!desc.shiftKey
  )
}
