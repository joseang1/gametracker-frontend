export default class GameModel {
  constructor(id, rawgId, title, coverUrl, releaseDate, genres, rating) {
    this.id = id
    this.rawgId = rawgId
    this.title = title
    this.coverUrl = coverUrl
    this.releaseDate = releaseDate
    this.genres = genres
    this.rating = rating
  }

  getYear() {
    return this.releaseDate ? Number(this.releaseDate.slice(0, 4)) : null
  }

  getStars() {
    return this.rating === null ? null : this.rating / 2
  }

  getDetailRoute() {
    return this.id !== null ? `/games/${this.id}` : `/games/rawg/${this.rawgId}`
  }

  static createGame(dto, mapper) {
    return new GameModel(
      mapper.id(dto),
      mapper.rawgId(dto),
      mapper.title(dto),
      mapper.coverUrl(dto),
      mapper.releaseDate(dto),
      mapper.genres(dto),
      mapper.rating(dto),
    )
  }
}
