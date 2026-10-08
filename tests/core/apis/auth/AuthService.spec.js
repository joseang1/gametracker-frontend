import AuthService from '@/core/apis/auth/AuthService'
import UserModel from '@/core/models/UserModel'

describe('AuthService', () => {
  const userDto = { id: 7, username: 'demo', role: 'USER', avatarUrl: null }
  let repository
  let service

  beforeEach(() => {
    repository = { get: vi.fn(), post: vi.fn() }
    service = new AuthService(repository)
  })

  it('logs in and returns the token with a UserModel', async () => {
    repository.post.mockResolvedValue({ token: 'jwt', user: userDto })

    const session = await service.login('demo', 'demo1234')

    expect(repository.post).toHaveBeenCalledWith('/login', { username: 'demo', password: 'demo1234' })
    expect(session.token).toBe('jwt')
    expect(session.user).toBeInstanceOf(UserModel)
    expect(session.user.username).toBe('demo')
  })

  it('registers with username, email and password', async () => {
    repository.post.mockResolvedValue({ token: 'jwt', user: userDto })

    await service.register('demo', 'demo@mail.com', 'demo1234')

    expect(repository.post).toHaveBeenCalledWith('/register', {
      username: 'demo',
      email: 'demo@mail.com',
      password: 'demo1234',
    })
  })

  it('gets the current user from /me', async () => {
    repository.get.mockResolvedValue({ ...userDto, role: 'ADMIN' })

    const user = await service.getCurrentUser()

    expect(repository.get).toHaveBeenCalledWith('/me')
    expect(user.isAdmin()).toBe(true)
  })

  it('lets backend errors reach the caller', async () => {
    repository.post.mockRejectedValue(new Error('Invalid username or password'))

    await expect(service.login('demo', 'wrong')).rejects.toThrow('Invalid username or password')
  })
})
