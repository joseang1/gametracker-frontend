import { LOG_STATUSES } from '@/core/game-log/log-statuses'

export const profileMapper = {
  id: (dto) => dto.id,
  username: (dto) => dto.username,
  role: (dto) => dto.role,
  bio: (dto) => dto.bio?.trim() ?? '',
  avatarUrl: (dto) => dto.avatarUrl ?? null,
  joinedAt: (dto) => dto.joinedAt,
  statusCounts: (dto) =>
    Object.keys(LOG_STATUSES).map((status) => ({ status, count: dto.statusCounts?.[status] ?? 0 })),
  reviewCount: (dto) => dto.reviewCount ?? 0,
  averageRating: (dto) => dto.averageRating ?? null,
}
