// Backend UserDTOResponse: { id, username, role, avatarUrl }
export const userMapper = {
  id: (dto) => dto.id,
  username: (dto) => dto.username,
  role: (dto) => dto.role,
  avatarUrl: (dto) => dto.avatarUrl ?? null,
}
