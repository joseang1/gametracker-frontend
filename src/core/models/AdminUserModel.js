export default class AdminUserModel {
  constructor(id, username, email, role, banned, createdAt) {
    this.id = id
    this.username = username
    this.email = email
    this.role = role
    this.banned = banned
    this.createdAt = createdAt
  }

  isAdmin() {
    return this.role === 'ADMIN'
  }

  static createAdminUser(dto, mapper) {
    return new AdminUserModel(
      mapper.id(dto),
      mapper.username(dto),
      mapper.email(dto),
      mapper.role(dto),
      mapper.banned(dto),
      mapper.createdAt(dto),
    )
  }
}
