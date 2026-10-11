import AdminService from '@/core/apis/admin/AdminService'
import AdminUserModel from '@/core/models/AdminUserModel'
import ReviewModel from '@/core/models/ReviewModel'

describe('AdminService', () => {
  const userDto = { id: 2, username: 'demo', email: 'demo@mail.com', role: 'USER', banned: false, createdAt: '2026-10-07T15:44:59' }
  let repository
  let service

  beforeEach(() => {
    repository = { get: vi.fn(), patch: vi.fn(), delete: vi.fn().mockResolvedValue('') }
    service = new AdminService(repository)
  })

  it('gets the site stats', async () => {
    repository.get.mockResolvedValue({ users: 2, bannedUsers: 0, games: 5, customGames: 0, reviews: 1, logs: 3 })

    expect((await service.getStats()).games).toBe(5)
    expect(repository.get).toHaveBeenCalledWith('/stats')
  })

  it('searches users', async () => {
    repository.get.mockResolvedValue({ content: [userDto], page: 0, totalPages: 1 })

    const result = await service.getUsers('  dem ', 1)

    expect(repository.get).toHaveBeenCalledWith('/users', { search: 'dem', page: 1 })
    expect(result.users[0]).toBeInstanceOf(AdminUserModel)
    expect(result.users[0].isAdmin()).toBe(false)
  })

  it.each([
    [true, '/users/2/ban'],
    [false, '/users/2/unban'],
  ])('bans or unbans a user (banned: %s)', async (banned, path) => {
    repository.patch.mockResolvedValue({ ...userDto, banned })

    const user = await service.setBanned(2, banned)

    expect(repository.patch).toHaveBeenCalledWith(path)
    expect(user.banned).toBe(banned)
  })

  it('lists and deletes reviews', async () => {
    repository.get.mockResolvedValue({
      content: [{ id: 9, rating: 2, body: 'Spam', createdAt: 'x', author: userDto, game: { id: 2, rawgId: 1, title: 'Hades', genres: [] } }],
      page: 0,
      totalPages: 1,
    })

    const { reviews } = await service.getReviews()
    await service.deleteReview(9)

    expect(reviews[0]).toBeInstanceOf(ReviewModel)
    expect(repository.delete).toHaveBeenCalledWith('/reviews/9')
  })
})
