import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useClickOutside } from '@/composables/useClickOutside'

describe('useClickOutside', () => {
  const mountWith = (handler) =>
    mount(
      {
        setup() {
          const box = ref(null)
          useClickOutside(box, handler)
          return { box }
        },
        template: '<div><div ref="box"><button id="inside">in</button></div><button id="outside">out</button></div>',
      },
      { attachTo: document.body },
    )

  it('calls the handler on a click outside the element', async () => {
    const handler = vi.fn()
    const wrapper = mountWith(handler)

    await wrapper.find('#outside').trigger('click')

    expect(handler).toHaveBeenCalledOnce()
    wrapper.unmount()
  })

  it('ignores clicks inside the element', async () => {
    const handler = vi.fn()
    const wrapper = mountWith(handler)

    await wrapper.find('#inside').trigger('click')

    expect(handler).not.toHaveBeenCalled()
    wrapper.unmount()
  })
})
