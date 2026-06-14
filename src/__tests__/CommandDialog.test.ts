import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CommandDialog from '../CommandDialog.vue'
import type { CommandItemData } from '../types'

const items: CommandItemData[] = [
  { value: 'home', label: 'Home', group: 'Navigation' },
  { value: 'settings', label: 'Settings', shortcut: '⌘,', group: 'Actions' },
  { value: 'theme', label: 'Toggle theme' },
]

function mountDialog(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(CommandDialog, {
    props: { items, ...props },
    slots,
    attachTo: document.body,
  })
}

function query(sel: string): Element | null {
  return document.body.querySelector(sel)
}

describe('CommandDialog', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when visible is false', () => {
    mountDialog({ visible: false })
    expect(query('[data-cmdk-dialog]')).toBeNull()
  })

  it('renders dialog when visible is true', async () => {
    mountDialog({ visible: true })
    expect(query('[data-cmdk-dialog]')).toBeTruthy()
  })

  it('renders items via default body slot', async () => {
    mountDialog({ visible: true })
    expect(query('[data-cmdk-dialog]')?.textContent).toContain('Home')
    expect(query('[data-cmdk-dialog]')?.textContent).toContain('Settings')
    expect(query('[data-cmdk-dialog]')?.textContent).toContain('Toggle theme')
  })

  it('renders header slot content', () => {
    mountDialog({ visible: true }, { header: '<div data-test="custom-header">Custom Header</div>' })
    expect(query('[data-test="custom-header"]')).toBeTruthy()
  })

  it('renders footer slot when provided', () => {
    mountDialog({ visible: true }, { footer: '<div data-test="custom-footer">Footer</div>' })
    expect(query('[data-test="custom-footer"]')).toBeTruthy()
  })

  it('closes on mask click', async () => {
    const wrapper = mountDialog({ visible: true })
    const mask = query('[data-cmdk-dialog-mask]') as HTMLElement
    mask?.click()
    await wrapper.vm.$nextTick()
    expect(query('[data-cmdk-dialog]')).toBeNull()
  })

  it('closes on Escape key', async () => {
    const wrapper = mountDialog({ visible: true })
    const dialog = query('[data-cmdk-dialog]') as HTMLElement
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(query('[data-cmdk-dialog]')).toBeNull()
  })

  it('emits select when an item is clicked', async () => {
    const wrapper = mountDialog({ visible: true })
    const item = query('[data-cmdk-item]') as HTMLElement
    item?.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('select')).toBeTruthy()
  })

  it('syncs searchQuery v-model', async () => {
    const wrapper = mountDialog({
      visible: true,
      searchQuery: '',
      'onUpdate:searchQuery': (v: string) => wrapper.setProps({ searchQuery: v }),
    })
    const input = query('[data-cmdk-input]') as HTMLInputElement
    input.value = 'home'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:searchQuery')?.[0]).toEqual(['home'])
  })

  it('sets aria-label from label prop', () => {
    mountDialog({ visible: true, label: 'My commands' })
    expect(query('[data-cmdk-dialog]')?.getAttribute('aria-label')).toBe('My commands')
  })

  it('uses default aria-label when label not provided', () => {
    mountDialog({ visible: true })
    expect(query('[data-cmdk-dialog]')?.getAttribute('aria-label')).toBe('Command menu')
  })
})
