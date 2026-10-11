import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import ProfileView from '@/views/ProfileView.vue'
import { useAuthStore } from '@/stores/auth'
import ProfileModel from '@/core/models/ProfileModel'
import GameLogModel from '@/core/models/GameLogModel'
import ReviewModel from '@/core/models/ReviewModel'
import UserModel from '@/core/models/UserModel'
import ApiError from '@/core/http/ApiError'
import { profileMapper } from '@/core/mappers/profile-mapper'
import { gameLogMapper } from '@/core/mappers/game-log-mapper'
import { reviewMapper } from '@/core/mappers/review-mapper'

describe('ProfileView', () => {
  const profileDto = {
    id: 2,
    username: 'demo',
    role: 'USER',
    bio: 'Roguelike fan',
    avatarUrl: null,
    joinedAt: '2026-10-07T15:44:59',
    statusCounts: { COMPLETED: 3, PLAYING: 1, BACKLOG: 0, WISHLIST: 2, DROPPED: 0 },
    reviewCount: 1,
    averageRating: 9,
  }
  const profile = (overrides = {}) => ProfileModel.createProfile({ ...profileDto, ...overrides }, profileMapper)
  const game = { id: 2, rawgId: 274755, title: 'Hades', genres: [] }
  const log = GameLogModel.createGameLog({ id: 4, status: 'PLAYING', favorite: true, game }, gameLogMapper)
  const review = ReviewModel.createReview(
    { id: 9, rating: 9, body: 'So good', createdAt: '2026-10-11T10:00:00', author: { id: 2, username: 'demo' }, game },
    reviewMapper,
  )

  let userService
  let gameLogService
  let reviewService

  const mountProfile = async (path, { loggedInAs = null } = {}) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/users/:username', name: 'profile', component: ProfileView },
        { path: '/:any(.*)*', component: { template: '<div />' } },
      ],
    })
    router.push(path)
    await router.isReady()

    const wrapper = mount(ProfileView, {
      global: {
        plugins: [createTestingPinia(), router],
        provide: { UserService: userService, GameLogService: gameLogService, ReviewService: reviewService, AuthService: {} },
        stubs: { teleport: true },
      },
      attachTo: document.body,
    })
    const auth = useAuthStore()
    if (loggedInAs) {
      auth.user = new UserModel(2, loggedInAs, 'USER', null)
      auth.isAuthenticated = true
    }
    await flushPromises()
    return { wrapper, router, auth }
  }

  beforeEach(() => {
    userService = { getProfile: vi.fn().mockResolvedValue(profile()), updateMyProfile: vi.fn() }
    gameLogService = { getByUser: vi.fn().mockResolvedValue({ logs: [log], page: 0, totalPages: 1 }) }
    reviewService = { getByUser: vi.fn().mockResolvedValue({ reviews: [review], page: 0, totalPages: 1 }) }
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  it('shows who the player is', async () => {
    const { wrapper } = await mountProfile('/users/demo')

    expect(userService.getProfile).toHaveBeenCalledWith('demo')
    expect(wrapper.find('[data-test="username"]').text()).toBe('demo')
    expect(wrapper.find('[data-test="bio"]').text()).toBe('Roguelike fan')
    expect(wrapper.text()).toContain('Member since October 2026')
  })

  it('shows the game counts per status and the average rating', async () => {
    const { wrapper } = await mountProfile('/users/demo')

    const stats = wrapper.find('[data-test="stats"]').text()
    expect(stats).toContain('Games6')
    expect(wrapper.find('[data-test="stat-COMPLETED"]').text()).toContain('3')
    expect(wrapper.find('[data-test="average"] [aria-label="Rated 4.5 out of 5"]').exists()).toBe(true)
  })

  it('marks admins', async () => {
    userService.getProfile.mockResolvedValue(profile({ username: 'admin', role: 'ADMIN' }))
    const { wrapper } = await mountProfile('/users/admin')

    expect(wrapper.find('[data-test="admin-badge"]').exists()).toBe(true)
  })

  it('shows the library with each game status', async () => {
    const { wrapper } = await mountProfile('/users/demo')

    expect(gameLogService.getByUser).toHaveBeenCalledWith('demo', { page: 0 })
    const library = wrapper.find('[data-test="library"]')
    expect(library.find('h3').text()).toBe('Hades')
    expect(library.text()).toContain('Playing')
    expect(library.find('[aria-label="Favourite"]').exists()).toBe(true)
  })

  it('filters the library from the URL', async () => {
    await mountProfile('/users/demo?filter=FAVORITES')

    expect(gameLogService.getByUser).toHaveBeenCalledWith('demo', { favorites: true, page: 0 })
  })

  it('filters by status when a stat is clicked', async () => {
    const { wrapper, router } = await mountProfile('/users/demo')

    await wrapper.find('[data-test="stat-WISHLIST"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ filter: 'WISHLIST' })
    expect(gameLogService.getByUser).toHaveBeenLastCalledWith('demo', { status: 'WISHLIST', page: 0 })
  })

  it('ignores unknown filters in the URL', async () => {
    await mountProfile('/users/demo?filter=NOPE')

    expect(gameLogService.getByUser).toHaveBeenCalledWith('demo', { page: 0 })
  })

  it('switches to the reviews tab', async () => {
    const { wrapper, router } = await mountProfile('/users/demo')

    await wrapper.find('[data-test="tab-reviews"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ tab: 'reviews' })
    expect(reviewService.getByUser).toHaveBeenCalledWith('demo', 0)
    expect(wrapper.find('[data-test="reviews"]').text()).toContain('So good')
  })

  it('invites the owner to explore when the library is empty', async () => {
    gameLogService.getByUser.mockResolvedValue({ logs: [], page: 0, totalPages: 0 })
    const { wrapper } = await mountProfile('/users/demo', { loggedInAs: 'demo' })

    expect(wrapper.find('[data-test="library-empty"]').text()).toContain('Your library is empty')
  })

  it('tells visitors when someone else has no games', async () => {
    gameLogService.getByUser.mockResolvedValue({ logs: [], page: 0, totalPages: 0 })
    const { wrapper } = await mountProfile('/users/demo', { loggedInAs: 'admin' })

    expect(wrapper.find('[data-test="library-empty"]').text()).toContain("demo hasn't logged any games yet")
  })

  it('only lets the owner edit the profile', async () => {
    const { wrapper: visitor } = await mountProfile('/users/demo', { loggedInAs: 'admin' })
    expect(visitor.find('[data-test="edit-profile"]').exists()).toBe(false)
    visitor.unmount()

    const { wrapper: owner } = await mountProfile('/users/Demo', { loggedInAs: 'demo' })
    expect(owner.find('[data-test="edit-profile"]').exists()).toBe(true)
  })

  it('updates the profile and the header avatar after editing', async () => {
    const { wrapper, auth } = await mountProfile('/users/demo', { loggedInAs: 'demo' })
    await wrapper.find('[data-test="edit-profile"]').trigger('click')

    wrapper
      .findComponent({ name: 'EditProfileForm' })
      .vm.$emit('saved', profile({ bio: 'New bio', avatarUrl: 'https://img/me.png' }))
    await flushPromises()

    expect(wrapper.find('[data-test="bio"]').text()).toBe('New bio')
    expect(auth.user.avatarUrl).toBe('https://img/me.png')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('says when the player does not exist', async () => {
    userService.getProfile.mockRejectedValue(new ApiError(404, "User 'ghost' not found"))
    const { wrapper } = await mountProfile('/users/ghost')

    expect(wrapper.find('[data-test="not-found"]').text()).toContain('There is no player called “ghost”')
  })
})
