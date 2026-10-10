import Repository from '@/core/models/Repository'

export default class ReviewRepository extends Repository {
  constructor(client) {
    super('', client)
  }
}
