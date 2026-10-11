const memberSince = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })

export default class ProfileModel {
  constructor(id, username, role, bio, avatarUrl, joinedAt, statusCounts, reviewCount, averageRating) {
    this.id = id
    this.username = username
    this.role = role
    this.bio = bio
    this.avatarUrl = avatarUrl
    this.joinedAt = joinedAt
    this.statusCounts = statusCounts
    this.reviewCount = reviewCount
    this.averageRating = averageRating
  }

  isAdmin() {
    return this.role === 'ADMIN'
  }

  getGamesCount() {
    return this.statusCounts.reduce((total, { count }) => total + count, 0)
  }

  getAverageStars() {
    return this.averageRating === null ? null : Math.round((this.averageRating / 2) * 10) / 10
  }

  getMemberSince() {
    return memberSince.format(new Date(this.joinedAt))
  }

  static createProfile(dto, mapper) {
    return new ProfileModel(
      mapper.id(dto),
      mapper.username(dto),
      mapper.role(dto),
      mapper.bio(dto),
      mapper.avatarUrl(dto),
      mapper.joinedAt(dto),
      mapper.statusCounts(dto),
      mapper.reviewCount(dto),
      mapper.averageRating(dto),
    )
  }
}
