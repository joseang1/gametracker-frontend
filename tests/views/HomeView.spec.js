import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

describe('HomeView', () => {
  it('shows the app title from the environment', () => {
    const wrapper = mount(HomeView)

    expect(wrapper.find('h1').text()).toBe(import.meta.env.VITE_APP_TITLE)
  })
})
