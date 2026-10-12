import Repository from '@/core/models/Repository'

export default class UserRepository extends Repository {
  constructor(client) {
    super('/users', client)
  }
}
