import { reviewMapper } from '@/core/mappers/review-mapper'
import ReviewModel from '@/core/models/ReviewModel'

export default class ReviewService {
  #repo

  constructor(repository) {
    this.#repo = repository
  }

  async getRecent(page = 0) {
    const data = await this.#repo.get('/reviews', { page })
    return this.#toPage(data)
  }

  async getByGame(gameId, page = 0) {
    const data = await this.#repo.get(`/games/${gameId}/reviews`, { page })
    return this.#toPage(data)
  }

  async getByUser(username, page = 0) {
    const data = await this.#repo.get(`/users/${encodeURIComponent(username)}/reviews`, { page })
    return this.#toPage(data)
  }

  async saveReview(gameId, { rating, body, spoiler }) {
    const data = await this.#repo.put(`/games/${gameId}/review`, {
      rating,
      body: body?.trim() || null,
      spoiler: Boolean(spoiler),
    })
    return ReviewModel.createReview(data, reviewMapper)
  }

  deleteReview(gameId) {
    return this.#repo.delete(`/games/${gameId}/review`)
  }

  #toPage(data) {
    return {
      reviews: data.content.map((dto) => ReviewModel.createReview(dto, reviewMapper)),
      page: data.page,
      totalPages: data.totalPages,
    }
  }
}
