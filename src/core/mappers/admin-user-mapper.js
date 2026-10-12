export const adminUserMapper = {
  id: (dto) => dto.id,
  username: (dto) => dto.username,
  email: (dto) => dto.email,
  role: (dto) => dto.role,
  banned: (dto) => Boolean(dto.banned),
  createdAt: (dto) => dto.createdAt,
}
