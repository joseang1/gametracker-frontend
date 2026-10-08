import Repository from '@/core/models/Repository'

export default class AuthRepository extends Repository {
  constructor(client) {
    super('/auth', client)
  }
}
