export default class UserModel {
  constructor(id, username, role, avatarUrl) {
    this.id = id
    this.username = username
    this.role = role
    this.avatarUrl = avatarUrl
  }

  isAdmin() {
    return this.role === 'ADMIN'
  }

  static createUser(dto, mapper) {
    return new UserModel(mapper.id(dto), mapper.username(dto), mapper.role(dto), mapper.avatarUrl(dto))
  }
}
