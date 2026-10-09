import Repository from '@/core/models/Repository'

export default class GameRepository extends Repository {
  constructor(client) {
    super('/games', client)
  }
}
