import { describe, it, expect } from 'vitest'
import { parseShortcut, eventMatchesShortcut } from '../utils/shortcut'

function createEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return {
    key: '',
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    preventDefault: () => {},
    stopPropagation: () => {},
    ...overrides,
  } as KeyboardEvent
}

describe('parseShortcut', () => {
  it('returns null for empty/undefined shortcut', () => {
    expect(parseShortcut('')).toBeNull()
    expect(parseShortcut(null as unknown as string)).toBeNull()
    expect(parseShortcut(undefined as unknown as string)).toBeNull()
  })

  it('returns plain key when no modifiers', () => {
    const result = parseShortcut('a')
    expect(result).toEqual({ key: 'a' })
  })

  it('parses ⌘S → metaKey + s', () => {
    const r = parseShortcut('⌘S')
    expect(r).toEqual({ key: 's', metaKey: true })
  })

  it('parses ⌃C → ctrlKey + c', () => {
    const r = parseShortcut('⌃C')
    expect(r).toEqual({ key: 'c', ctrlKey: true })
  })

  it('parses ⌥X → altKey + x', () => {
    const r = parseShortcut('⌥X')
    expect(r).toEqual({ key: 'x', altKey: true })
  })

  it('parses ⇧Z → shiftKey + z', () => {
    const r = parseShortcut('⇧Z')
    expect(r).toEqual({ key: 'z', shiftKey: true })
  })

  it('parses ⌘⇧F → metaKey + shiftKey + f', () => {
    const r = parseShortcut('⌘⇧F')
    expect(r).toEqual({ key: 'f', metaKey: true, shiftKey: true })
  })

  it('lowercases the key portion', () => {
    const r = parseShortcut('⌘K')
    expect(r?.key).toBe('k')
  })

  it('handles plain key without modifier symbols', () => {
    const r = parseShortcut('Escape')
    expect(r).toEqual({ key: 'escape' })
  })
})

describe('eventMatchesShortcut', () => {
  it('matches a simple key', () => {
    const desc = parseShortcut('a')
    expect(eventMatchesShortcut(createEvent({ key: 'a' }), desc)).toBe(true)
  })

  it('rejects wrong key', () => {
    const desc = parseShortcut('a')
    expect(eventMatchesShortcut(createEvent({ key: 'b' }), desc)).toBe(false)
  })

  it('matches ⌘S correctly', () => {
    const desc = parseShortcut('⌘S')
    expect(eventMatchesShortcut(createEvent({ key: 's', metaKey: true }), desc)).toBe(true)
    expect(eventMatchesShortcut(createEvent({ key: 's' }), desc)).toBe(false)
    expect(eventMatchesShortcut(createEvent({ key: 's', ctrlKey: true }), desc)).toBe(false)
  })

  it('matches ⌘⇧F correctly', () => {
    const desc = parseShortcut('⌘⇧F')
    expect(
      eventMatchesShortcut(createEvent({ key: 'f', metaKey: true, shiftKey: true }), desc),
    ).toBe(true)
    expect(eventMatchesShortcut(createEvent({ key: 'f', metaKey: true }), desc)).toBe(false)
    expect(eventMatchesShortcut(createEvent({ key: 'f', shiftKey: true }), desc)).toBe(false)
  })

  it('returns false for null descriptor', () => {
    expect(eventMatchesShortcut(createEvent({ key: 'a' }), null)).toBe(false)
  })
})
