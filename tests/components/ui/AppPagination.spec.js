import { mount } from '@vue/test-utils'
import AppPagination from '@/components/ui/AppPagination.vue'

describe('AppPagination', () => {
  const mountPagination = (page, totalPages) => mount(AppPagination, { props: { page, totalPages } })
  const pageButtons = (wrapper) => wrapper.findAll('[data-test="pages"] button').map((button) => button.text())

  it('shows numbered pages around the current one, with the first and the last', () => {
    expect(pageButtons(mountPagination(5, 45062))).toEqual(['1', '4', '5', '6', '7', '8', '45,062'])
    expect(mountPagination(5, 45062).findAll('[data-test="pages"] span[aria-hidden]')).toHaveLength(2)
  })

  it('marks the current page', () => {
    const current = mountPagination(5, 45062).find('[aria-current="page"]')

    expect(current.text()).toBe('6')
  })

  it('asks for the page whose number was clicked', async () => {
    const wrapper = mountPagination(5, 45062)

    await wrapper.find('[aria-label="Page 45,062"]').trigger('click')

    expect(wrapper.emitted('change')).toEqual([[45061]])
  })

  it('does not reload the page that is already open', async () => {
    const wrapper = mountPagination(5, 45062)

    await wrapper.find('[aria-current="page"]').trigger('click')

    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('asks for the next and previous pages', async () => {
    const wrapper = mountPagination(4, 40)

    await wrapper.find('[data-test="next"]').trigger('click')
    await wrapper.find('[data-test="previous"]').trigger('click')

    expect(wrapper.emitted('change')).toEqual([[5], [3]])
  })

  it('jumps to the first and last page from the mobile buttons', async () => {
    const wrapper = mountPagination(4, 40)

    await wrapper.find('[data-test="first"]').trigger('click')
    await wrapper.find('[data-test="last"]').trigger('click')

    expect(wrapper.emitted('change')).toEqual([[0], [39]])
  })

  it('shows a compact summary for small screens', () => {
    expect(mountPagination(5, 45062).find('[data-test="summary"]').text()).toBe('Page 6 of 45,062')
  })

  it('cannot go back from the first page', () => {
    const wrapper = mountPagination(0, 40)

    expect(wrapper.find('[data-test="previous"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-test="first"]').attributes('disabled')).toBeDefined()
  })

  it('cannot go forward from the last page', () => {
    const wrapper = mountPagination(39, 40)

    expect(wrapper.find('[data-test="next"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-test="last"]').attributes('disabled')).toBeDefined()
  })

  it('is hidden when everything fits in one page', () => {
    expect(mountPagination(0, 1).find('nav').exists()).toBe(false)
  })
})
