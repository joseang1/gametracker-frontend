import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppFooter from '@/components/layout/AppFooter.vue'

describe('AppFooter', () => {
  it('credits RAWG with a link, as its terms require', () => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: {} }] })
    const wrapper = mount(AppFooter, { global: { plugins: [router] } })

    const rawgLink = wrapper.find('a[href="https://rawg.io"]')
    expect(rawgLink.exists()).toBe(true)
    expect(rawgLink.attributes('rel')).toBe('noopener')
  })
})
