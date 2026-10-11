import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import GameDetailView from '@/views/GameDetailView.vue'
import { useAuthStore } from '@/stores/auth'
import GameDetailModel from '@/core/models/GameDetailModel'
import ReviewModel from '@/core/models/ReviewModel'
import UserModel from '@/core/models/UserModel'
import GameLogModel from '@/core/models/GameLogModel'
import ApiError from '@/core/http/ApiError'
import { gameDetailMapper } from '@/core/mappers/game-mapper'
import { gameLogMapper } from '@/core/mappers/game-log-mapper'
import { reviewMapper } from '@/core/mappers/review-mapper'

describe('GameDetailView', () => {
  const detail = (overrides = {}) =>
    GameDetailModel.createGameDetail(
      {
        id: 2,
        rawgId: 274755,
        title: 'Hades',
        coverUrl: 'https://img/hades.jpg',
        description: 'A rogue-like dungeon crawler.',
        releaseDate: '2020-09-17',
        genres: ['Action', 'RPG'],
        platforms: ['PC', 'Nintendo Switch'],
        developer: 'Supergiant Games',
        stats: { reviewCount: 2, average: 9, distribution: [0, 0, 0, 0, 0, 0, 0, 1, 0, 1] },
        ...overrides,
      },
      gameDetailMapper,
    )

  const review = (id) =>
    ReviewModel.createReview(
      {
        id,
        rating: 10,
        body: `Review ${id}`,
        createdAt: '2026-10-08T18:00:00',
        author: { id: 3, username: `player${id}`, role: 'USER' },
        game: { id: 2, rawgId: 274755, title: 'Hades', genres: [] },
      },
      reviewMapper,
    )

  let gameService
  let reviewService
  let gameLogService

  const mountDetail = async (path, { loggedIn = false } = {}) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/games/:id(\\d+)', name: 'game', component: GameDetailView },
        { path: '/games/rawg/:rawgId(\\d+)', name: 'game-rawg', component: GameDetailView },
        { path: '/login', name: 'login', component: { template: '<div />' } },
        { path: '/:any(.*)*', component: { template: '<div />' } },
      ],
    })
    router.push(path)
    await router.isReady()

    const pinia = createTestingPinia()
    const wrapper = mount(GameDetailView, {
      global: {
        plugins: [pinia, router],
        provide: {
          GameService: gameService,
          ReviewService: reviewService,
          GameLogService: gameLogService,
          AuthService: {},
        },
        stubs: { teleport: true },
      },
      attachTo: document.body,
    })
    if (loggedIn) {
      const auth = useAuthStore()
      auth.user = new UserModel(1, 'demo', 'USER', null)
      auth.isAuthenticated = true
    }
    await flushPromises()
    return { wrapper, router }
  }

  beforeEach(() => {
    gameService = { getById: vi.fn().mockResolvedValue(detail()), getByRawgId: vi.fn().mockResolvedValue(detail()) }
    reviewService = { getByGame: vi.fn().mockResolvedValue({ reviews: [review(1), review(2)], page: 0, totalPages: 1 }) }
    gameLogService = { getMyEntry: vi.fn().mockResolvedValue({ log: null, review: null }) }
  })

  afterEach(() => {
    document.body.innerHTML = ''
    document.body.style.overflow = ''
  })

  describe('my entry', () => {
    const myLog = GameLogModel.createGameLog(
      { id: 4, status: 'COMPLETED', favorite: true, game: { id: 2, rawgId: 274755, title: 'Hades', genres: [] } },
      gameLogMapper,
    )
    const myReview = ReviewModel.createReview(
      {
        id: 9,
        rating: 8,
        body: 'Mine',
        createdAt: '2026-10-11T10:00:00',
        author: { id: 1, username: 'demo' },
        game: { id: 2, rawgId: 274755, title: 'Hades', genres: [] },
      },
      reviewMapper,
    )

    it('does not ask guests for their entry', async () => {
      await mountDetail('/games/2')

      expect(gameLogService.getMyEntry).not.toHaveBeenCalled()
    })

    it('offers to log a game the user has not logged yet', async () => {
      const { wrapper } = await mountDetail('/games/2', { loggedIn: true })

      expect(gameLogService.getMyEntry).toHaveBeenCalledWith(2)
      expect(wrapper.find('[data-test="log-cta"]').text()).toBe('Log, rate or review')
      expect(wrapper.find('[data-test="login-cta"]').exists()).toBe(false)
    })

    it('shows what the user already logged and rated', async () => {
      gameLogService.getMyEntry.mockResolvedValue({ log: myLog, review: myReview })
      const { wrapper } = await mountDetail('/games/2', { loggedIn: true })

      const entry = wrapper.find('[data-test="my-entry"]')
      expect(entry.text()).toContain('Completed')
      expect(entry.find('[aria-label="Favourite"]').exists()).toBe(true)
      expect(entry.find('[aria-label="Rated 4 out of 5"]').exists()).toBe(true)
    })

    it('highlights my rating in the histogram', async () => {
      gameLogService.getMyEntry.mockResolvedValue({ log: null, review: myReview })
      const { wrapper } = await mountDetail('/games/2', { loggedIn: true })

      const fills = wrapper.findAll('[data-test="bar-fill"]')
      expect(fills[7].classes()).toContain('bg-accent')
    })

    it('opens the form in a modal', async () => {
      const { wrapper } = await mountDetail('/games/2', { loggedIn: true })

      await wrapper.find('[data-test="log-cta"]').trigger('click')

      expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="statuses"]').exists()).toBe(true)
    })

    it('refreshes the rating and the reviews after saving', async () => {
      const { wrapper } = await mountDetail('/games/2', { loggedIn: true })
      await wrapper.find('[data-test="log-cta"]').trigger('click')
      gameService.getById.mockClear()
      reviewService.getByGame.mockClear()

      wrapper.findComponent({ name: 'LogGameForm' }).vm.$emit('change', { log: myLog, review: myReview })
      await flushPromises()

      expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
      expect(gameService.getById).toHaveBeenCalledWith('2')
      expect(reviewService.getByGame).toHaveBeenCalledWith(2, 0)
      expect(wrapper.find('[data-test="my-entry"]').exists()).toBe(true)
    })
  })

  it('shows the game information', async () => {
    const { wrapper } = await mountDetail('/games/2')

    expect(gameService.getById).toHaveBeenCalledWith('2')
    expect(wrapper.find('[data-test="title"]').text()).toBe('Hades')
    expect(wrapper.text()).toContain('by Supergiant Games')
    expect(wrapper.find('[data-test="details"]').text()).toContain('September 17, 2020')
    expect(wrapper.find('[data-test="details"]').text()).toContain('Nintendo Switch')
  })

  it('shows the community rating', async () => {
    const { wrapper } = await mountDetail('/games/2')

    const rating = wrapper.find('[data-test="community-rating"]').text()
    expect(rating).toContain('4.5')
    expect(rating).toContain('2 reviews')
  })

  it('says when nobody rated the game yet', async () => {
    gameService.getById.mockResolvedValue(detail({ stats: { reviewCount: 0, average: null, distribution: Array(10).fill(0) } }))
    const { wrapper } = await mountDetail('/games/2')

    expect(wrapper.find('[data-test="community-rating"]').text()).toContain('Not rated yet')
  })

  it('imports a RAWG game and switches to its own address', async () => {
    const { router } = await mountDetail('/games/rawg/274755')

    expect(gameService.getByRawgId).toHaveBeenCalledWith('274755')
    expect(router.currentRoute.value.path).toBe('/games/2')
    expect(gameService.getById).not.toHaveBeenCalled()
  })

  it('loads the reviews of the game', async () => {
    const { wrapper } = await mountDetail('/games/2')

    expect(reviewService.getByGame).toHaveBeenCalledWith(2, 0)
    expect(wrapper.findAll('[data-test="author"]').map((author) => author.text())).toEqual(['player1', 'player2'])
  })

  it('invites to write the first review when there are none', async () => {
    reviewService.getByGame.mockResolvedValue({ reviews: [], page: 0, totalPages: 0 })
    const { wrapper } = await mountDetail('/games/2')

    expect(wrapper.find('[data-test="reviews-empty"]').text()).toContain('Be the first')
  })

  it('cuts long descriptions with a read more button', async () => {
    gameService.getById.mockResolvedValue(detail({ description: 'Long text. '.repeat(80) }))
    const { wrapper } = await mountDetail('/games/2')
    const description = () => wrapper.find('[data-test="description"]')

    expect(description().classes()).toContain('line-clamp-6')
    await wrapper.find('[data-test="toggle-description"]').trigger('click')
    expect(description().classes()).not.toContain('line-clamp-6')
  })

  it('does not offer read more for short descriptions', async () => {
    const { wrapper } = await mountDetail('/games/2')

    expect(wrapper.find('[data-test="toggle-description"]').exists()).toBe(false)
  })

  it('asks guests to log in and come back to the game', async () => {
    const { wrapper } = await mountDetail('/games/2')

    expect(wrapper.find('[data-test="login-cta"]').attributes('href')).toBe('/login?redirect=/games/2')
  })

  it('does not ask logged users to log in', async () => {
    const { wrapper } = await mountDetail('/games/2', { loggedIn: true })

    expect(wrapper.find('[data-test="login-cta"]').exists()).toBe(false)
  })

  it('says when the game does not exist', async () => {
    gameService.getById.mockRejectedValue(new ApiError(404, 'Game not found. Id 999 does not exist.'))
    const { wrapper } = await mountDetail('/games/999')

    expect(wrapper.find('[data-test="not-found"]').text()).toContain('Game not found')
    expect(reviewService.getByGame).not.toHaveBeenCalled()
  })

  it('lets the user retry other errors', async () => {
    gameService.getById.mockRejectedValueOnce(new ApiError(0, 'Cannot reach the server. Is the backend running?'))
    const { wrapper } = await mountDetail('/games/2')

    await wrapper.find('[data-test="error"] button').trigger('click')
    await flushPromises()

    expect(wrapper.find('[data-test="title"]').text()).toBe('Hades')
  })

  it('loads the new game when moving to another one', async () => {
    const { router } = await mountDetail('/games/2')
    gameService.getById.mockResolvedValue(detail({ id: 5, title: 'Celeste' }))

    await router.push('/games/5')
    await flushPromises()

    expect(gameService.getById).toHaveBeenLastCalledWith('5')
    expect(reviewService.getByGame).toHaveBeenLastCalledWith(5, 0)
  })
})
