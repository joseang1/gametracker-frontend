import GameService from '@/core/apis/games/GameService'
import GameModel from '@/core/models/GameModel'
import GameDetailModel from '@/core/models/GameDetailModel'

describe('GameService', () => {
  const witcher = { id: null, rawgId: 3328, title: 'The Witcher 3', genres: ['RPG'], rating: 9 }
  let repository
  let service

  beforeEach(() => {
    repository = { get: vi.fn(), delete: vi.fn().mockResolvedValue('') }
    service = new GameService(repository)
  })

  it('deletes a game', async () => {
    await service.deleteGame(2)

    expect(repository.delete).toHaveBeenCalledWith('/2')
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

  describe('game details', () => {
    const detailDto = {
      id: 2,
      rawgId: 274755,
      title: 'Hades',
      coverUrl: 'https://img/hades.jpg',
      description: ' A rogue-like dungeon crawler. ',
      releaseDate: '2020-09-17',
      genres: ['Action'],
      platforms: ['PC', 'Nintendo Switch'],
      developer: 'Supergiant Games',
      source: 'RAWG',
      stats: { reviewCount: 2, average: 9, distribution: [0, 0, 0, 0, 0, 0, 0, 1, 0, 1] },
    }

    it('gets a game by our id', async () => {
      repository.get.mockResolvedValue(detailDto)

      const game = await service.getById(2)

      expect(repository.get).toHaveBeenCalledWith('/2')
      expect(game).toBeInstanceOf(GameDetailModel)
      expect(game.developer).toBe('Supergiant Games')
      expect(game.description).toBe('A rogue-like dungeon crawler.')
    })

    it('gets a game by its RAWG id', async () => {
      repository.get.mockResolvedValue(detailDto)

      const game = await service.getByRawgId(274755)

      expect(repository.get).toHaveBeenCalledWith('/rawg/274755')
      expect(game.getDetailRoute()).toBe('/games/2')
    })

    it('uses the community average as the game rating', async () => {
      repository.get.mockResolvedValue(detailDto)

      const game = await service.getById(2)

      expect(game.getStars()).toBe(4.5)
      expect(game.stats.reviewCount).toBe(2)
    })
  })
})
