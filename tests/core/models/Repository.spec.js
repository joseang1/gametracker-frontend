import Repository from '@/core/models/Repository'

describe('Repository', () => {
  const fakeClient = () => ({
    get: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    post: vi.fn().mockResolvedValue({ data: { created: true } }),
    put: vi.fn().mockResolvedValue({ data: {} }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: '' }),
  })

  it('builds the URL from its resource path and returns only the body', async () => {
    const client = fakeClient()
    const repository = new Repository('/games', client)

    const data = await repository.get('/42', { page: 1 })

    expect(client.get).toHaveBeenCalledWith('/games/42', { params: { page: 1 } })
    expect(data).toEqual({ id: 1 })
  })

  it('sends the body on post', async () => {
    const client = fakeClient()
    const repository = new Repository('/auth', client)

    const data = await repository.post('/login', { username: 'demo' })

    expect(client.post).toHaveBeenCalledWith('/auth/login', { username: 'demo' })
    expect(data).toEqual({ created: true })
  })

  it('exposes its uri', () => {
    expect(new Repository('/reviews', fakeClient()).getUri()).toBe('/reviews')
  })
})
