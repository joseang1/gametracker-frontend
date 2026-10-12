import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '@/App.vue'

describe('App', () => {
  it('wraps every page with the header and the footer', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: { template: '<p data-test="page">Page</p>' } }],
    })
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [createTestingPinia(), router], provide: { AuthService: {} } },
    })
    await flushPromises()

    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.find('main [data-test="page"]').exists()).toBe(true)
    expect(wrapper.find('footer').exists()).toBe(true)
  })
})
