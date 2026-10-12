import { profileMapper } from '@/core/mappers/profile-mapper'
import ProfileModel from '@/core/models/ProfileModel'

export default class UserService {
  #repo

  constructor(repository) {
    this.#repo = repository
  }

  async getProfile(username) {
    const data = await this.#repo.get(`/${encodeURIComponent(username)}`)
    return ProfileModel.createProfile(data, profileMapper)
  }

  async updateMyProfile({ bio, avatarUrl }) {
    const data = await this.#repo.put('/me', {
      bio: bio?.trim() || null,
      avatarUrl: avatarUrl?.trim() || null,
    })
    return ProfileModel.createProfile(data, profileMapper)
  }
}
