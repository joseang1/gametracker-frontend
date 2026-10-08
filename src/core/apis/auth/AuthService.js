import { userMapper } from '@/core/mappers/user-mapper'
import UserModel from '@/core/models/UserModel'

export default class AuthService {
  #repo

  constructor(repository) {
    this.#repo = repository
  }

  // Both return { token, user } so the store can start the session
  async login(username, password) {
    const data = await this.#repo.post('/login', { username, password })
    return this.#toSession(data)
  }

  async register(username, email, password) {
    const data = await this.#repo.post('/register', { username, email, password })
    return this.#toSession(data)
  }

  async getCurrentUser() {
    const data = await this.#repo.get('/me')
    return UserModel.createUser(data, userMapper)
  }

  #toSession(data) {
    return { token: data.token, user: UserModel.createUser(data.user, userMapper) }
  }
}
