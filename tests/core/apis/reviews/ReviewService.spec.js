import ReviewService from '@/core/apis/reviews/ReviewService'
import ReviewModel from '@/core/models/ReviewModel'
import UserModel from '@/core/models/UserModel'
import GameModel from '@/core/models/GameModel'

describe('ReviewService', () => {
  const reviewDto = {
    id: 1,
    rating: 9,
    body: '  Best roguelike ever.  ',
    spoiler: false,
    createdAt: '2026-10-08T18:00:00',
    updatedAt: '2026-10-08T18:00:00',
    author: { id: 2, username: 'demo', role: 'USER', avatarUrl: null },
    game: { id: 7, rawgId: 274755, title: 'Hades', genres: ['Action'], rating: 8.8 },
  }
  let repository
  let service

  beforeEach(() => {
    repository = { get: vi.fn().mockResolvedValue({ content: [reviewDto], page: 0, size: 10, totalElements: 1, totalPages: 1 }) }
    service = new ReviewService(repository)
  })

  it('gets the most recent reviews page', async () => {
    const result = await service.getRecent()

    expect(repository.get).toHaveBeenCalledWith('/reviews', { page: 0 })
    expect(result.totalPages).toBe(1)
    expect(result.reviews[0]).toBeInstanceOf(ReviewModel)
  })

  it('builds the author and the game as models', async () => {
    const [review] = (await service.getRecent()).reviews

    expect(review.author).toBeInstanceOf(UserModel)
    expect(review.game).toBeInstanceOf(GameModel)
    expect(review.game.getDetailRoute()).toBe('/games/7')
  })

  it('trims the text and shows the rating in stars', async () => {
    const [review] = (await service.getRecent()).reviews

    expect(review.body).toBe('Best roguelike ever.')
    expect(review.getStars()).toBe(4.5)
  })

  it('accepts reviews with only a rating', async () => {
    repository.get.mockResolvedValue({ content: [{ ...reviewDto, body: null }], page: 0, totalPages: 1 })

    const [review] = (await service.getRecent()).reviews

    expect(review.hasBody()).toBe(false)
  })

  it('knows when a review was edited', async () => {
    repository.get.mockResolvedValue({
      content: [{ ...reviewDto, updatedAt: '2026-10-09T10:00:00' }],
      page: 0,
      totalPages: 1,
    })

    const [review] = (await service.getRecent()).reviews

    expect(review.wasEdited()).toBe(true)
  })
})
