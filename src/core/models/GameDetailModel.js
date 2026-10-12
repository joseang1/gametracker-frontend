import GameModel from '@/core/models/GameModel'

export default class GameDetailModel extends GameModel {
  constructor(id, rawgId, title, coverUrl, releaseDate, genres, rating, description, platforms, developer, stats) {
    super(id, rawgId, title, coverUrl, releaseDate, genres, rating)
    this.description = description
    this.platforms = platforms
    this.developer = developer
    this.stats = stats
  }

  static createGameDetail(dto, mapper) {
    return new GameDetailModel(
      mapper.id(dto),
      mapper.rawgId(dto),
      mapper.title(dto),
      mapper.coverUrl(dto),
      mapper.releaseDate(dto),
      mapper.genres(dto),
      mapper.rating(dto),
      mapper.description(dto),
      mapper.platforms(dto),
      mapper.developer(dto),
      mapper.stats(dto),
    )
  }
}
