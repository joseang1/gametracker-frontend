import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import RegisterView from '@/views/auth/RegisterView.vue'
import { useAuthStore } from '@/stores/auth'
import ApiError from '@/core/http/ApiError'

describe('RegisterView', () => {
  const valid = { username: 'new_player', email: 'player@mail.com', password: 'secret123', confirmPassword: 'secret123' }

  const mountRegister = async (query = {}) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div />' } },
        { path: '/login', name: 'login', component: { template: '<div />' } },
        { path: '/register', name: 'register', component: RegisterView },
        { path: '/games', component: { template: '<div />' } },
      ],
    })
    router.push({ path: '/register', query })
    await router.isReady()

    const wrapper = mount(RegisterView, {
      global: { plugins: [createTestingPinia(), router], provide: { AuthService: {} } },
    })
    return { wrapper, router, auth: useAuthStore() }
  }

  const fillAndSubmit = async (wrapper, values) => {
    const [username, email, password, confirmPassword] = wrapper.findAll('input')
    await username.setValue(values.username)
    await email.setValue(values.email)
    await password.setValue(values.password)
    await confirmPassword.setValue(values.confirmPassword)
    await wrapper.find('form').trigger('submit')
    await flushPromises()
  }

  it('creates the account and goes home', async () => {
    const { wrapper, router, auth } = await mountRegister()

    await fillAndSubmit(wrapper, valid)

    expect(auth.register).toHaveBeenCalledWith('new_player', 'player@mail.com', 'secret123')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('returns to the page the user came from', async () => {
    const { wrapper, router } = await mountRegister({ redirect: '/games' })

    await fillAndSubmit(wrapper, valid)

    expect(router.currentRoute.value.path).toBe('/games')
  })

  it('does not send the form when the passwords do not match', async () => {
    const { wrapper, auth } = await mountRegister()

    await fillAndSubmit(wrapper, { ...valid, confirmPassword: 'different1' })

    expect(wrapper.text()).toContain('Passwords do not match')
    expect(auth.register).not.toHaveBeenCalled()
  })

  it('shows a taken username under the username field', async () => {
    const { wrapper, auth } = await mountRegister()
    auth.register.mockRejectedValue(new ApiError(409, "Username 'new_player' is already taken"))

    await fillAndSubmit(wrapper, valid)

    const usernameError = wrapper.findAll('[role="alert"]')[0]
    expect(usernameError.text()).toBe("Username 'new_player' is already taken")
    expect(wrapper.find('[data-test="form-error"]').exists()).toBe(false)
  })

  it('shows a registered email under the email field', async () => {
    const { wrapper, auth } = await mountRegister()
    auth.register.mockRejectedValue(new ApiError(409, 'Email is already registered'))

    await fillAndSubmit(wrapper, valid)

    const emailInput = wrapper.findAll('input')[1]
    expect(emailInput.attributes('aria-invalid')).toBe('true')
    expect(wrapper.text()).toContain('Email is already registered')
  })

  it('shows network problems at the top of the form', async () => {
    const { wrapper, auth } = await mountRegister()
    auth.register.mockRejectedValue(new ApiError(0, 'Cannot reach the server. Is the backend running?'))

    await fillAndSubmit(wrapper, valid)

    expect(wrapper.find('[data-test="form-error"]').text()).toContain('Cannot reach the server')
  })
})
