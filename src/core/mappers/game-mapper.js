export const gameSummaryMapper = {
  id: (dto) => dto.id ?? null,
  rawgId: (dto) => dto.rawgId ?? null,
  title: (dto) => dto.title,
  coverUrl: (dto) => dto.coverUrl ?? null,
  releaseDate: (dto) => dto.releaseDate ?? null,
  genres: (dto) => dto.genres ?? [],
  rating: (dto) => dto.rating ?? null,
}
