import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import { useAuthStore } from '@/stores/auth'
import ApiError from '@/core/http/ApiError'

describe('LoginView', () => {
  const mountLogin = async (query = {}) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/login', name: 'login', component: LoginView },
        { path: '/register', name: 'register', component: { template: '<div />' } },
        { path: '/library', component: { template: '<div />' } },
      ],
    })
    router.push({ path: '/login', query })
    await router.isReady()

    const wrapper = mount(LoginView, {
      global: { plugins: [createTestingPinia(), router], provide: { AuthService: {} } },
    })
    return { wrapper, router, auth: useAuthStore() }
  }

  const fillAndSubmit = async (wrapper, username, password) => {
    const [user, pass] = wrapper.findAll('input')
    await user.setValue(username)
    await pass.setValue(password)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
  }

  it('shows field errors and does not call the backend when empty', async () => {
    const { wrapper, auth } = await mountLogin()

    await fillAndSubmit(wrapper, '', '')

    expect(wrapper.text()).toContain('Username cannot be empty')
    expect(wrapper.text()).toContain('Password cannot be empty')
    expect(auth.login).not.toHaveBeenCalled()
  })

  it('logs in with the trimmed username and goes home', async () => {
    const { wrapper, router, auth } = await mountLogin()

    await fillAndSubmit(wrapper, '  demo ', 'demo1234')

    expect(auth.login).toHaveBeenCalledWith('demo', 'demo1234')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('goes back to the page the user wanted after logging in', async () => {
    const { wrapper, router } = await mountLogin({ redirect: '/library' })

    await fillAndSubmit(wrapper, 'demo', 'demo1234')

    expect(router.currentRoute.value.path).toBe('/library')
  })

  it('ignores redirects to other websites', async () => {
    const { wrapper, router } = await mountLogin({ redirect: 'https://evil.site' })

    await fillAndSubmit(wrapper, 'demo', 'demo1234')

    expect(router.currentRoute.value.path).toBe('/')
  })

  it('shows the backend message when the credentials are wrong', async () => {
    const { wrapper, router, auth } = await mountLogin()
    auth.login.mockRejectedValue(new ApiError(401, 'Invalid username or password'))

    await fillAndSubmit(wrapper, 'demo', 'wrong-password')

    expect(wrapper.find('[data-test="form-error"]').text()).toContain('Invalid username or password')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('links to register keeping the redirect', async () => {
    const { wrapper } = await mountLogin({ redirect: '/library' })

    expect(wrapper.find('a[href^="/register"]').attributes('href')).toBe('/register?redirect=/library')
  })
})
