export default class ReviewModel {
  constructor(id, rating, body, spoiler, createdAt, updatedAt, author, game) {
    this.id = id
    this.rating = rating
    this.body = body
    this.spoiler = spoiler
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.author = author
    this.game = game
  }

  getStars() {
    return this.rating / 2
  }

  hasBody() {
    return this.body.length > 0
  }

  wasEdited() {
    return this.updatedAt !== this.createdAt
  }

  static createReview(dto, mapper) {
    return new ReviewModel(
      mapper.id(dto),
      mapper.rating(dto),
      mapper.body(dto),
      mapper.spoiler(dto),
      mapper.createdAt(dto),
      mapper.updatedAt(dto),
      mapper.author(dto),
      mapper.game(dto),
    )
  }
}
