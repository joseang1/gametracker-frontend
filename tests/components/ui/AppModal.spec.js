import { mount } from '@vue/test-utils'
import AppModal from '@/components/ui/AppModal.vue'

describe('AppModal', () => {
  const mountModal = (open = true) =>
    mount(AppModal, {
      props: { open, title: 'Log Hades' },
      slots: { default: '<p data-test="content">Form here</p>' },
      global: { stubs: { teleport: true } },
      attachTo: document.body,
    })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('shows the title and the content when open', () => {
    const wrapper = mountModal()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.find('h2').text()).toBe('Log Hades')
    expect(wrapper.find('[data-test="content"]').exists()).toBe(true)
  })

  it('renders nothing when closed', () => {
    expect(mountModal(false).find('[role="dialog"]').exists()).toBe(false)
  })

  it('names the dialog after its title for screen readers', () => {
    const wrapper = mountModal()

    expect(wrapper.find('[role="dialog"]').attributes('aria-labelledby')).toBe(wrapper.find('h2').attributes('id'))
  })

  it.each([
    ['the close button', (wrapper) => wrapper.find('[data-test="close"]').trigger('click')],
    ['the backdrop', (wrapper) => wrapper.find('[data-test="backdrop"]').trigger('click')],
    ['the Escape key', () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))],
  ])('asks to close with %s', async (_, close) => {
    const wrapper = mountModal()

    await close(wrapper)

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('locks the page scroll while open and unlocks it when closed', async () => {
    const wrapper = mountModal()
    expect(document.body.style.overflow).toBe('hidden')

    await wrapper.setProps({ open: false })

    expect(document.body.style.overflow).toBe('')
  })

  it('stops listening to Escape once closed', async () => {
    const wrapper = mountModal()
    await wrapper.setProps({ open: false })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('close')).toBeUndefined()
  })
})
