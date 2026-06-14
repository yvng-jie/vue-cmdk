import { describe, it, expect } from 'vitest'
import { injectStrict } from '../utils/injectStrict'
import { CMDK_STATE } from '../injectionKeys'
import { createApp, defineComponent, h, type InjectionKey } from 'vue'

describe('injectStrict', () => {
  it('returns the injected value when available', () => {
    const key: InjectionKey<string> = Symbol('test')
    const component = defineComponent({
      setup() {
        const value = injectStrict(key, 'TestComponent')
        expect(value).toBe('hello')
      },
      render: () => null,
    })

    const app = createApp({
      setup() {
        return () => h(component)
      },
      provide: {
        [key as symbol]: 'hello',
      },
    })

    // Mount should not throw
    const root = document.createElement('div')
    app.mount(root)
    app.unmount()
  })

  it('throws when value is undefined', () => {
    const key: InjectionKey<string> = Symbol('test-missing')
    const component = defineComponent({
      setup() {
        expect(() => injectStrict(key, 'MissingComp')).toThrow(
          '[vue-cmdk] <MissingComp> must be used inside <CommandMenu> or <CommandDialog>.',
        )
      },
      render: () => null,
    })

    const app = createApp({
      setup() {
        return () => h(component)
      },
    })

    const root = document.createElement('div')
    app.mount(root)
    app.unmount()
  })

  it('throws with component name in error message', () => {
    expect(() => injectStrict(CMDK_STATE, 'CommandInput')).toThrow('CommandInput')
  })
})
