import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import { useAuthStore } from '@/stores/auth'
import UserModel from '@/core/models/UserModel'

describe('AppHeader', () => {
  const mountHeader = async (role = 'guest') => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/:pathMatch(.*)*', component: { template: '<div />' } }],
    })
    router.push('/')
    await router.isReady()

    const pinia = createTestingPinia()
    const wrapper = mount(AppHeader, {
      attachTo: document.body,
      global: { plugins: [pinia, router], provide: { AuthService: {} } },
    })

    const auth = useAuthStore()
    if (role !== 'guest') {
      auth.user = new UserModel(1, 'demo', role === 'admin' ? 'ADMIN' : 'USER', null)
      auth.isAuthenticated = true
      auth.isAdmin = role === 'admin'
    }
    await flushPromises()

    return { wrapper, router, auth }
  }

  afterEach(() => (document.body.innerHTML = ''))

  it('offers log in and sign up to guests', async () => {
    const { wrapper } = await mountHeader()

    expect(wrapper.text()).toContain('Log in')
    expect(wrapper.text()).toContain('Sign up')
    expect(wrapper.find('[data-test="user-menu-button"]').exists()).toBe(false)
  })

  it('shows the username and opens the user menu when logged in', async () => {
    const { wrapper } = await mountHeader('user')

    expect(wrapper.text()).not.toContain('Sign up')
    await wrapper.find('[data-test="user-menu-button"]').trigger('click')

    expect(wrapper.find('[data-test="user-menu"]').text()).toContain('My profile')
  })

  it('only shows the admin portal link to admins', async () => {
    const { wrapper: user } = await mountHeader('user')
    await user.find('[data-test="user-menu-button"]').trigger('click')
    expect(user.find('[data-test="admin-link"]').exists()).toBe(false)
    user.unmount()

    const { wrapper: admin } = await mountHeader('admin')
    await admin.find('[data-test="user-menu-button"]').trigger('click')
    expect(admin.find('[data-test="admin-link"]').exists()).toBe(true)
  })

  it('logs out and goes home', async () => {
    const { wrapper, router, auth } = await mountHeader('user')
    await router.push('/games')
    await wrapper.find('[data-test="user-menu-button"]').trigger('click')

    await wrapper.find('[data-test="user-menu"] button').trigger('click')
    await flushPromises()

    expect(auth.logout).toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('closes the user menu when clicking outside', async () => {
    const { wrapper } = await mountHeader('user')
    await wrapper.find('[data-test="user-menu-button"]').trigger('click')

    document.body.click()
    await flushPromises()

    expect(wrapper.find('[data-test="user-menu"]').exists()).toBe(false)
  })

  it('toggles the mobile menu and closes it after navigating', async () => {
    const { wrapper, router } = await mountHeader()
    const button = wrapper.find('[data-test="mobile-menu-button"]')

    await button.trigger('click')
    expect(wrapper.find('#mobile-menu').exists()).toBe(true)

    await router.push('/games')
    await flushPromises()
    expect(wrapper.find('#mobile-menu').exists()).toBe(false)
  })
})
