import { describe, it, expect, beforeEach } from 'vitest'
import { useCommandRoot } from '../useCommandRoot'
import type { CommandItemData } from '../types'

describe('useCommandRoot', () => {
  let emit: ReturnType<typeof createMockEmit>

  function createMockEmit() {
    const calls: Array<{ event: string; args: unknown[] }> = []
    const emitFn = (event: string, ...args: unknown[]) => {
      calls.push({ event, args })
    }
    return { calls, emit: emitFn }
  }

  beforeEach(() => {
    emit = createMockEmit()
  })

  it('creates state with default options', () => {
    const { state } = useCommandRoot({}, emit.emit)
    expect(state.visible.value).toBe(false)
    expect(state.searchQuery.value).toBe('')
    expect(state.activeIndex.value).toBe(0)
    expect(state.items.value).toEqual([])
  })

  it('creates state with custom options', () => {
    const { state } = useCommandRoot({ shouldFilter: false, loop: false }, emit.emit)
    expect(state).toBeDefined()
  })

  it('handleSelect emits select event', () => {
    const { handleSelect } = useCommandRoot({}, emit.emit)
    const item: CommandItemData = { value: 'test' }
    handleSelect(item)
    expect(emit.calls.some((c) => c.event === 'select')).toBe(true)
  })

  it('handleSelect emits select event with item', () => {
    const { handleSelect } = useCommandRoot({}, emit.emit)
    const item: CommandItemData = { value: 'home' }
    handleSelect(item)
    const selectCall = emit.calls.find((c) => c.event === 'select')
    expect(selectCall).toBeTruthy()
    expect((selectCall!.args[0] as CommandItemData).value).toBe('home')
  })

  it('handleSelect emits update:value event', () => {
    const { handleSelect } = useCommandRoot({}, emit.emit)
    handleSelect({ value: 'home' })
    const updateCall = emit.calls.find((c) => c.event === 'update:value')
    expect(updateCall).toBeTruthy()
    expect(updateCall!.args[0]).toBe('home')
  })

  it('handleSelect calls onItemSelect callback', () => {
    let selected: CommandItemData | undefined
    const { handleSelect } = useCommandRoot({}, emit.emit, (item) => {
      selected = item
    })
    const item: CommandItemData = { value: 'test' }
    handleSelect(item)
    expect(selected?.value).toBe('test')
  })

  it('closes state on select when closeOnSelect is true', () => {
    const { state, handleSelect } = useCommandRoot({ closeOnSelect: true }, emit.emit)
    state.visible.value = true
    handleSelect({ value: 'test' })
    expect(state.visible.value).toBe(false)
  })

  it('does not close state on select when closeOnSelect is false', () => {
    const { state, handleSelect } = useCommandRoot({ closeOnSelect: false }, emit.emit)
    state.visible.value = true
    handleSelect({ value: 'test' })
    expect(state.visible.value).toBe(true)
  })

  it('syncs value prop to selectedValue', () => {
    const { state } = useCommandRoot({ value: 'initial' }, emit.emit)
    expect(state.selectedValue.value).toBe('initial')
  })
})
