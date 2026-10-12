import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NotFoundView from '@/views/NotFoundView.vue'

describe('NotFoundView', () => {
  it('explains the page does not exist and links back home', () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: {} }] })
    const wrapper = mount(NotFoundView, { global: { plugins: [router] } })

    expect(wrapper.text()).toContain('404')
    expect(wrapper.find('a').attributes('href')).toBe('/')
  })
})
