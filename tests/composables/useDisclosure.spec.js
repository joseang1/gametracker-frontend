import { mount } from '@vue/test-utils'
import { useDisclosure } from '@/composables/useDisclosure'

const withSetup = (composable) => {
  let result
  const wrapper = mount({
    setup() {
      result = composable()
      return () => null
    },
  })
  return { result, wrapper }
}

describe('useDisclosure', () => {
  it('starts closed by default', () => {
    const { result } = withSetup(() => useDisclosure())

    expect(result.isOpen.value).toBe(false)
  })

  it('opens, closes and toggles', () => {
    const { result } = withSetup(() => useDisclosure())

    result.open()
    expect(result.isOpen.value).toBe(true)
    result.close()
    expect(result.isOpen.value).toBe(false)
    result.toggle()
    expect(result.isOpen.value).toBe(true)
  })

  it('closes when Escape is pressed', () => {
    const { result } = withSetup(() => useDisclosure(true))

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(result.isOpen.value).toBe(false)
  })

  it('stops listening once the component is unmounted', () => {
    const { result, wrapper } = withSetup(() => useDisclosure(true))
    wrapper.unmount()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(result.isOpen.value).toBe(true)
  })
})
