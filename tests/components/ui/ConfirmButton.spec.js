import { mount } from '@vue/test-utils'
import ConfirmButton from '@/components/ui/ConfirmButton.vue'

describe('ConfirmButton', () => {
  const mountButton = () => mount(ConfirmButton, { props: { label: 'Ban', confirmLabel: 'Click again to ban' } })

  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('asks for a second click before confirming', async () => {
    const wrapper = mountButton()

    await wrapper.trigger('click')
    expect(wrapper.text()).toBe('Click again to ban')
    expect(wrapper.emitted('confirm')).toBeUndefined()

    await wrapper.trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.text()).toBe('Ban')
  })

  it('calms down by itself after a few seconds', async () => {
    const wrapper = mountButton()

    await wrapper.trigger('click')
    await vi.advanceTimersByTimeAsync(4000)

    expect(wrapper.text()).toBe('Ban')
  })

  it('calms down when the focus leaves', async () => {
    const wrapper = mountButton()

    await wrapper.trigger('click')
    await wrapper.trigger('blur')
    await wrapper.trigger('click')

    expect(wrapper.emitted('confirm')).toBeUndefined()
  })
})
