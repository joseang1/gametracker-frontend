import { guard } from '@/router/guards'

const store = { isAuthenticated: false, isAdmin: false }

vi.mock('@/stores/auth', () => ({ useAuthStore: () => store }))

describe('router guard', () => {
  const route = (meta, fullPath = '/somewhere') => ({ meta, fullPath })
  const loginAs = (role) => {
    store.isAuthenticated = role !== 'guest'
    store.isAdmin = role === 'admin'
  }

  it('lets anyone into public routes', () => {
    loginAs('guest')

    expect(guard(route({}))).toBeUndefined()
  })

  it('sends guests to login and remembers where they wanted to go', () => {
    loginAs('guest')

    expect(guard(route({ requiresAuth: true }, '/library'))).toEqual({
      name: 'login',
      query: { redirect: '/library' },
    })
  })

  it('lets logged users into private routes', () => {
    loginAs('user')

    expect(guard(route({ requiresAuth: true }))).toBeUndefined()
  })

  it('keeps normal users out of admin routes', () => {
    loginAs('user')

    expect(guard(route({ requiresAuth: true, requiresAdmin: true }))).toEqual({ name: 'home' })
  })

  it('sends guests from admin routes to login', () => {
    loginAs('guest')

    expect(guard(route({ requiresAdmin: true }, '/admin')).name).toBe('login')
  })

  it('lets admins into admin routes', () => {
    loginAs('admin')

    expect(guard(route({ requiresAuth: true, requiresAdmin: true }))).toBeUndefined()
  })

  it('sends logged users away from login and register', () => {
    loginAs('user')

    expect(guard(route({ guestOnly: true }))).toEqual({ name: 'home' })
  })
})
