import { gameSummaryMapper } from '@/core/mappers/game-mapper'
import GameModel from '@/core/models/GameModel'

export default class GameService {
  #repo

  constructor(repository) {
    this.#repo = repository
  }

  async search(term = '', page = 0) {
    const data = await this.#repo.get('', { search: term.trim(), page })

    return {
      games: data.content.map((dto) => GameModel.createGame(dto, gameSummaryMapper)),
      page: data.page,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
    }
  }

  async getTrending() {
    const data = await this.#repo.get('/trending')
    return data.map((dto) => GameModel.createGame(dto, gameSummaryMapper))
  }
}
