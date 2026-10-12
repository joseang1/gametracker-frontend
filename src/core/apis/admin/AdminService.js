import { adminUserMapper } from '@/core/mappers/admin-user-mapper'
import { reviewMapper } from '@/core/mappers/review-mapper'
import AdminUserModel from '@/core/models/AdminUserModel'
import ReviewModel from '@/core/models/ReviewModel'

export default class AdminService {
  #repo

  constructor(repository) {
    this.#repo = repository
  }

  getStats() {
    return this.#repo.get('/stats')
  }

  async getUsers(search = '', page = 0) {
    const data = await this.#repo.get('/users', { search: search.trim(), page })
    return {
      users: data.content.map((dto) => AdminUserModel.createAdminUser(dto, adminUserMapper)),
      page: data.page,
      totalPages: data.totalPages,
    }
  }

  async setBanned(userId, banned) {
    const data = await this.#repo.patch(`/users/${userId}/${banned ? 'ban' : 'unban'}`)
    return AdminUserModel.createAdminUser(data, adminUserMapper)
  }

  async getReviews(page = 0) {
    const data = await this.#repo.get('/reviews', { page })
    return {
      reviews: data.content.map((dto) => ReviewModel.createReview(dto, reviewMapper)),
      page: data.page,
      totalPages: data.totalPages,
    }
  }

  deleteReview(reviewId) {
    return this.#repo.delete(`/reviews/${reviewId}`)
  }
}
