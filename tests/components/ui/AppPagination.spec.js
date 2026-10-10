import { mount } from '@vue/test-utils'
import AppPagination from '@/components/ui/AppPagination.vue'

describe('AppPagination', () => {
  const mountPagination = (page, totalPages) => mount(AppPagination, { props: { page, totalPages } })

  it('shows the page counting from 1', () => {
    expect(mountPagination(0, 40).text()).toContain('Page 1 of 40')
  })

  it('asks for the next and previous pages', async () => {
    const wrapper = mountPagination(4, 40)

    await wrapper.find('[data-test="next"]').trigger('click')
    await wrapper.find('[data-test="previous"]').trigger('click')

    expect(wrapper.emitted('change')).toEqual([[5], [3]])
  })

  it('cannot go back from the first page', () => {
    expect(mountPagination(0, 40).find('[data-test="previous"]').attributes('disabled')).toBeDefined()
  })

  it('cannot go forward from the last page', () => {
    expect(mountPagination(39, 40).find('[data-test="next"]').attributes('disabled')).toBeDefined()
  })

  it('is hidden when everything fits in one page', () => {
    expect(mountPagination(0, 1).find('nav').exists()).toBe(false)
  })
})
