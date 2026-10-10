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

  #toPage(data) {
    return {
      reviews: data.content.map((dto) => ReviewModel.createReview(dto, reviewMapper)),
      page: data.page,
      totalPages: data.totalPages,
    }
  }
}
