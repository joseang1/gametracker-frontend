export default class GameLogModel {
  constructor(id, status, platform, hoursPlayed, favorite, updatedAt, game) {
    this.id = id
    this.status = status
    this.platform = platform
    this.hoursPlayed = hoursPlayed
    this.favorite = favorite
    this.updatedAt = updatedAt
    this.game = game
  }

  static createGameLog(dto, mapper) {
    return new GameLogModel(
      mapper.id(dto),
      mapper.status(dto),
      mapper.platform(dto),
      mapper.hoursPlayed(dto),
      mapper.favorite(dto),
      mapper.updatedAt(dto),
      mapper.game(dto),
    )
  }
}
