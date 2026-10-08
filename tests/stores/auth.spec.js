import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { tokenStorage } from '@/core/http/token-storage'
import UserModel from '@/core/models/UserModel'

describe('auth store', () => {
  const demo = new UserModel(2, 'demo', 'USER', null)
  const admin = new UserModel(1, 'admin', 'ADMIN', null)
  let authService

  // The store injects AuthService, so it needs an app that provides it
  const createStore = () => {
    const app = createApp({})
    app.provide('AuthService', authService)
    const pinia = createPinia()
    app.use(pinia)
    setActivePinia(pinia)
    return useAuthStore()
  }

  beforeEach(() => {
    localStorage.clear()
    authService = { login: vi.fn(), register: vi.fn(), getCurrentUser: vi.fn() }
  })

  it('starts logged out', () => {
    const store = createStore()

    expect(store.isAuthenticated).toBe(false)
    expect(store.isAdmin).toBe(false)
  })

  it('saves the token and the user after login', async () => {
    authService.login.mockResolvedValue({ token: 'jwt', user: demo })
    const store = createStore()

    await store.login('demo', 'demo1234')

    expect(store.isAuthenticated).toBe(true)
    expect(store.user.username).toBe('demo')
    expect(tokenStorage.get()).toBe('jwt')
  })

  it('knows when the user is an admin', async () => {
    authService.register.mockResolvedValue({ token: 'jwt', user: admin })
    const store = createStore()

    await store.register('admin', 'admin@mail.com', 'admin1234')

    expect(store.isAdmin).toBe(true)
  })

  it('does not start a session when login fails', async () => {
    authService.login.mockRejectedValue(new Error('Invalid username or password'))
    const store = createStore()

    await expect(store.login('demo', 'wrong')).rejects.toThrow()
    expect(store.isAuthenticated).toBe(false)
    expect(tokenStorage.get()).toBeNull()
  })

  it('clears everything on logout', async () => {
    authService.login.mockResolvedValue({ token: 'jwt', user: demo })
    const store = createStore()
    await store.login('demo', 'demo1234')

    store.logout()

    expect(store.isAuthenticated).toBe(false)
    expect(tokenStorage.get()).toBeNull()
  })

  describe('restoreSession', () => {
    it('loads the user when a saved token is still valid', async () => {
      tokenStorage.set('saved-jwt')
      authService.getCurrentUser.mockResolvedValue(demo)
      const store = createStore()

      await store.restoreSession()

      expect(store.isAuthenticated).toBe(true)
    })

    it('logs out when the saved token was rejected', async () => {
      tokenStorage.set('expired-jwt')
      authService.getCurrentUser.mockRejectedValue(new Error('401'))
      const store = createStore()

      await store.restoreSession()

      expect(store.isAuthenticated).toBe(false)
      expect(tokenStorage.get()).toBeNull()
    })

    it('does not call the backend without a saved token', async () => {
      const store = createStore()

      await store.restoreSession()

      expect(authService.getCurrentUser).not.toHaveBeenCalled()
    })
  })
})
