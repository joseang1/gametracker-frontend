import UserModel from '@/core/models/UserModel'
import GameModel from '@/core/models/GameModel'
import { userMapper } from '@/core/mappers/user-mapper'
import { gameSummaryMapper } from '@/core/mappers/game-mapper'

export const reviewMapper = {
  id: (dto) => dto.id,
  rating: (dto) => dto.rating,
  body: (dto) => dto.body?.trim() ?? '',
  spoiler: (dto) => Boolean(dto.spoiler),
  createdAt: (dto) => dto.createdAt,
  updatedAt: (dto) => dto.updatedAt ?? dto.createdAt,
  author: (dto) => UserModel.createUser(dto.author, userMapper),
  game: (dto) => GameModel.createGame(dto.game, gameSummaryMapper),
}
