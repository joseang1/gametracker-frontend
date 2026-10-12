import Repository from '@/core/models/Repository'

export default class GameLogRepository extends Repository {
  constructor(client) {
    super('', client)
  }
}
