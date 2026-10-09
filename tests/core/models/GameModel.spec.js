import GameModel from '@/core/models/GameModel'
import { gameSummaryMapper } from '@/core/mappers/game-mapper'

describe('GameModel', () => {
  const dto = {
    id: 5,
    rawgId: 3328,
    title: 'The Witcher 3',
    coverUrl: 'https://img/witcher.jpg',
    releaseDate: '2015-05-18',
    genres: ['RPG', 'Action'],
    rating: 9,
    source: 'RAWG',
  }

  it('is created from the backend data through the mapper', () => {
    const game = GameModel.createGame(dto, gameSummaryMapper)

    expect(game.title).toBe('The Witcher 3')
    expect(game.genres).toEqual(['RPG', 'Action'])
  })

  it('fills missing optional fields with safe defaults', () => {
    const game = GameModel.createGame({ rawgId: 1, title: 'Unknown' }, gameSummaryMapper)

    expect(game.id).toBeNull()
    expect(game.coverUrl).toBeNull()
    expect(game.genres).toEqual([])
  })

  it('gets the release year without time zone surprises', () => {
    const game = GameModel.createGame({ ...dto, releaseDate: '2015-01-01' }, gameSummaryMapper)

    expect(game.getYear()).toBe(2015)
  })

  it('has no year when the release date is unknown', () => {
    expect(GameModel.createGame({ ...dto, releaseDate: null }, gameSummaryMapper).getYear()).toBeNull()
  })

  it.each([
    [10, 5],
    [7, 3.5],
    [1, 0.5],
  ])('turns a %s/10 rating into %s stars', (rating, stars) => {
    expect(GameModel.createGame({ ...dto, rating }, gameSummaryMapper).getStars()).toBe(stars)
  })

  it('has no stars when nobody rated it', () => {
    expect(GameModel.createGame({ ...dto, rating: null }, gameSummaryMapper).getStars()).toBeNull()
  })

  it('links to our id when the game is in the database', () => {
    expect(GameModel.createGame(dto, gameSummaryMapper).getDetailRoute()).toBe('/games/5')
  })

  it('links to the RAWG id when the game has not been imported yet', () => {
    const game = GameModel.createGame({ ...dto, id: null }, gameSummaryMapper)

    expect(game.getDetailRoute()).toBe('/games/rawg/3328')
  })
})
