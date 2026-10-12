import RatingStatsModel from '@/core/models/RatingStatsModel'

export const gameSummaryMapper = {
  id: (dto) => dto.id ?? null,
  rawgId: (dto) => dto.rawgId ?? null,
  title: (dto) => dto.title,
  coverUrl: (dto) => dto.coverUrl ?? null,
  releaseDate: (dto) => dto.releaseDate ?? null,
  genres: (dto) => dto.genres ?? [],
  rating: (dto) => dto.rating ?? null,
}

export const gameDetailMapper = {
  ...gameSummaryMapper,
  rating: (dto) => dto.stats?.average ?? null,
  description: (dto) => dto.description?.trim() ?? '',
  platforms: (dto) => dto.platforms ?? [],
  developer: (dto) => dto.developer ?? null,
  stats: (dto) => RatingStatsModel.createStats(dto.stats),
}
