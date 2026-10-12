import UserService from '@/core/apis/users/UserService'
import ProfileModel from '@/core/models/ProfileModel'

describe('UserService', () => {
  const profileDto = {
    id: 2,
    username: 'demo',
    role: 'USER',
    bio: null,
    avatarUrl: null,
    joinedAt: '2026-10-07T15:44:59.178268',
    statusCounts: { COMPLETED: 3, PLAYING: 1, BACKLOG: 5, WISHLIST: 0 },
    reviewCount: 2,
    averageRating: 7.5,
  }
  let repository
  let service

  beforeEach(() => {
    repository = { get: vi.fn().mockResolvedValue(profileDto), put: vi.fn().mockResolvedValue(profileDto) }
    service = new UserService(repository)
  })

  it('gets a profile by username', async () => {
    const profile = await service.getProfile('demo')

    expect(repository.get).toHaveBeenCalledWith('/demo')
    expect(profile).toBeInstanceOf(ProfileModel)
  })

  it('lists every status in a fixed order, with zero for missing ones', async () => {
    const profile = await service.getProfile('demo')

    expect(profile.statusCounts).toEqual([
      { status: 'COMPLETED', count: 3 },
      { status: 'PLAYING', count: 1 },
      { status: 'BACKLOG', count: 5 },
      { status: 'WISHLIST', count: 0 },
      { status: 'DROPPED', count: 0 },
    ])
    expect(profile.getGamesCount()).toBe(9)
  })

  it('shows the average in stars and when the user joined', async () => {
    const profile = await service.getProfile('demo')

    expect(profile.getAverageStars()).toBe(3.8)
    expect(profile.getMemberSince()).toBe('October 2026')
    expect(profile.bio).toBe('')
  })

  it('updates my profile sending empty fields as null', async () => {
    await service.updateMyProfile({ bio: '  Souls fan  ', avatarUrl: '   ' })

    expect(repository.put).toHaveBeenCalledWith('/me', { bio: 'Souls fan', avatarUrl: null })
  })
})
