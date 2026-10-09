import GameService from '@/core/apis/games/GameService'
import GameModel from '@/core/models/GameModel'

describe('GameService', () => {
  const witcher = { id: null, rawgId: 3328, title: 'The Witcher 3', genres: ['RPG'], rating: 9 }
  let repository
  let service

  beforeEach(() => {
    repository = { get: vi.fn() }
    service = new GameService(repository)
  })

  describe('search', () => {
    beforeEach(() => {
      repository.get.mockResolvedValue({ content: [witcher], page: 2, size: 20, totalElements: 61, totalPages: 4 })
    })

    it('sends the trimmed term and the page as query parameters', async () => {
      await service.search('  witcher ', 2)

      expect(repository.get).toHaveBeenCalledWith('', { search: 'witcher', page: 2 })
    })

    it('returns game models with the page information', async () => {
      const result = await service.search('witcher', 2)

      expect(result.games[0]).toBeInstanceOf(GameModel)
      expect(result.games[0].title).toBe('The Witcher 3')
      expect(result).toMatchObject({ page: 2, totalPages: 4, totalElements: 61 })
    })

    it('searches everything on the first page by default', async () => {
      await service.search()

      expect(repository.get).toHaveBeenCalledWith('', { search: '', page: 0 })
    })
  })

  it('gets trending games as models', async () => {
    repository.get.mockResolvedValue([witcher])

    const games = await service.getTrending()

    expect(repository.get).toHaveBeenCalledWith('/trending')
    expect(games[0].getDetailRoute()).toBe('/games/rawg/3328')
  })
})
