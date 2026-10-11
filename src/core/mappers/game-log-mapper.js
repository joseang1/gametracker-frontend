import GameModel from '@/core/models/GameModel'
import { gameSummaryMapper } from '@/core/mappers/game-mapper'

export const gameLogMapper = {
  id: (dto) => dto.id,
  status: (dto) => dto.status,
  platform: (dto) => dto.platform ?? '',
  hoursPlayed: (dto) => dto.hoursPlayed ?? null,
  favorite: (dto) => Boolean(dto.favorite),
  updatedAt: (dto) => dto.updatedAt,
  game: (dto) => GameModel.createGame(dto.game, gameSummaryMapper),
}
