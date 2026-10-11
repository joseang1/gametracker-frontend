import { gameLogMapper } from '@/core/mappers/game-log-mapper'
import { reviewMapper } from '@/core/mappers/review-mapper'
import GameLogModel from '@/core/models/GameLogModel'
import ReviewModel from '@/core/models/ReviewModel'

const toHours = (value) => (value === '' || value === null || value === undefined ? null : Number(value))

export default class GameLogService {
  #repo

  constructor(repository) {
    this.#repo = repository
  }

  async getMyEntry(gameId) {
    const data = await this.#repo.get(`/games/${gameId}/me`)
    return {
      log: data.log ? GameLogModel.createGameLog(data.log, gameLogMapper) : null,
      review: data.review ? ReviewModel.createReview(data.review, reviewMapper) : null,
    }
  }

  async saveLog(gameId, { status, platform, hoursPlayed, favorite }) {
    const data = await this.#repo.put(`/games/${gameId}/log`, {
      status,
      platform: platform?.trim() || null,
      hoursPlayed: toHours(hoursPlayed),
      favorite: Boolean(favorite),
    })
    return GameLogModel.createGameLog(data, gameLogMapper)
  }

  deleteLog(gameId) {
    return this.#repo.delete(`/games/${gameId}/log`)
  }
}
