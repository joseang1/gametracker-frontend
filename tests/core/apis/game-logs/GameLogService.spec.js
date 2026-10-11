import GameLogService from '@/core/apis/game-logs/GameLogService'
import GameLogModel from '@/core/models/GameLogModel'
import ReviewModel from '@/core/models/ReviewModel'

describe('GameLogService', () => {
  const game = { id: 2, rawgId: 274755, title: 'Hades', genres: [] }
  const logDto = {
    id: 4,
    status: 'PLAYING',
    platform: 'PC',
    hoursPlayed: 12,
    favorite: true,
    updatedAt: '2026-10-11T10:00:00',
    game,
  }
  const reviewDto = {
    id: 9,
    rating: 9,
    body: 'Great',
    spoiler: false,
    createdAt: '2026-10-11T10:00:00',
    author: { id: 1, username: 'demo', role: 'USER' },
    game,
  }
  let repository
  let service

  beforeEach(() => {
    repository = { get: vi.fn(), put: vi.fn().mockResolvedValue(logDto), delete: vi.fn().mockResolvedValue('') }
    service = new GameLogService(repository)
  })

  it('gets my log and review for a game', async () => {
    repository.get.mockResolvedValue({ log: logDto, review: reviewDto })

    const entry = await service.getMyEntry(2)

    expect(repository.get).toHaveBeenCalledWith('/games/2/me')
    expect(entry.log).toBeInstanceOf(GameLogModel)
    expect(entry.log.favorite).toBe(true)
    expect(entry.review).toBeInstanceOf(ReviewModel)
  })

  it('returns null for the parts I have not created yet', async () => {
    repository.get.mockResolvedValue({ log: null, review: null })

    expect(await service.getMyEntry(2)).toEqual({ log: null, review: null })
  })

  it('saves a log with clean values', async () => {
    await service.saveLog(2, { status: 'COMPLETED', platform: '  Switch ', hoursPlayed: '25', favorite: undefined })

    expect(repository.put).toHaveBeenCalledWith('/games/2/log', {
      status: 'COMPLETED',
      platform: 'Switch',
      hoursPlayed: 25,
      favorite: false,
    })
  })

  it('sends empty optional fields as null, not as empty text or zero', async () => {
    await service.saveLog(2, { status: 'BACKLOG', platform: '   ', hoursPlayed: '', favorite: false })

    expect(repository.put).toHaveBeenCalledWith('/games/2/log', {
      status: 'BACKLOG',
      platform: null,
      hoursPlayed: null,
      favorite: false,
    })
  })

  it('keeps zero hours as zero', async () => {
    await service.saveLog(2, { status: 'DROPPED', hoursPlayed: 0 })

    expect(repository.put.mock.calls[0][1].hoursPlayed).toBe(0)
  })

  it('removes the game from my library', async () => {
    await service.deleteLog(2)

    expect(repository.delete).toHaveBeenCalledWith('/games/2/log')
  })

  describe('a user library', () => {
    beforeEach(() => {
      repository.get.mockResolvedValue({ content: [logDto], page: 0, size: 24, totalElements: 1, totalPages: 1 })
    })

    it('gets the whole library by default', async () => {
      const library = await service.getByUser('demo')

      expect(repository.get).toHaveBeenCalledWith('/users/demo/logs', { page: 0 })
      expect(library.logs[0]).toBeInstanceOf(GameLogModel)
      expect(library.totalElements).toBe(1)
    })

    it('filters by status and favourites', async () => {
      await service.getByUser('demo', { status: 'PLAYING', favorites: true, page: 2 })

      expect(repository.get).toHaveBeenCalledWith('/users/demo/logs', { page: 2, status: 'PLAYING', favorites: true })
    })
  })
})
