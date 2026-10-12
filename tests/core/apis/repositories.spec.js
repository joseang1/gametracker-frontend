import AuthRepository from '@/core/apis/auth/AuthRepository'
import GameRepository from '@/core/apis/games/GameRepository'
import ReviewRepository from '@/core/apis/reviews/ReviewRepository'
import GameLogRepository from '@/core/apis/game-logs/GameLogRepository'
import UserRepository from '@/core/apis/users/UserRepository'
import AdminRepository from '@/core/apis/admin/AdminRepository'

describe('API repositories', () => {
  it.each([
    [AuthRepository, '/auth'],
    [GameRepository, '/games'],
    [UserRepository, '/users'],
    [AdminRepository, '/admin'],
    [ReviewRepository, ''],
    [GameLogRepository, ''],
  ])('%o points to "%s"', async (RepositoryClass, uri) => {
    const client = { get: vi.fn().mockResolvedValue({ data: 'ok' }) }
    const repository = new RepositoryClass(client)

    await repository.get('/x')

    expect(repository.getUri()).toBe(uri)
    expect(client.get).toHaveBeenCalledWith(`${uri}/x`, { params: {} })
  })
})
