import Repository from '@/core/models/Repository'

export default class AdminRepository extends Repository {
  constructor(client) {
    super('/admin', client)
  }
}
