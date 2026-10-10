import { mount, flushPromises } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'
import GameModel from '@/core/models/GameModel'
import ReviewModel from '@/core/models/ReviewModel'
import UserModel from '@/core/models/UserModel'
import { gameSummaryMapper } from '@/core/mappers/game-mapper'
import { reviewMapper } from '@/core/mappers/review-mapper'

describe('HomeView', () => {
  const game = (id, title, coverUrl = `https://img/${id}.jpg`) =>
    GameModel.createGame({ id, rawgId: id * 10, title, coverUrl, genres: [] }, gameSummaryMapper)

  const review = (id) =>
    ReviewModel.createReview(
      {
        id,
        rating: 8,
        body: `Review ${id}`,
        createdAt: '2026-10-08T18:00:00',
        author: { id: 2, username: 'demo', role: 'USER' },
        game: { id: 1, rawgId: 10, title: 'Hades', genres: [] },
      },
      reviewMapper,
    )

  let gameService
  let reviewService

  const mountHome = async ({ loggedIn = false } = {}) => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:any(.*)*', component: {} }] })
    const pinia = createTestingPinia()
    const wrapper = mount(HomeView, {
      global: {
        plugins: [pinia, router],
        provide: { GameService: gameService, ReviewService: reviewService, AuthService: {} },
      },
    })

    if (loggedIn) {
      const auth = useAuthStore()
      auth.user = new UserModel(2, 'demo', 'USER', null)
      auth.isAuthenticated = true
    }
    await flushPromises()
    return wrapper
  }

  const actionLinks = (wrapper) =>
    wrapper.findAll('[data-test="hero-actions"] a').map((link) => [link.text(), link.attributes('href')])

  beforeEach(() => {
    gameService = { getTrending: vi.fn().mockResolvedValue([game(1, 'Hades'), game(2, 'Celeste'), game(3, 'Tunic')]) }
    reviewService = { getRecent: vi.fn().mockResolvedValue({ reviews: [review(1), review(2)], page: 0, totalPages: 1 }) }
  })

  it('invites guests to sign up or explore', async () => {
    const wrapper = await mountHome()

    expect(actionLinks(wrapper)).toEqual([
      ['Create free account', '/register'],
      ['Explore games', '/games'],
    ])
    expect(wrapper.find('[data-test="final-cta"]').exists()).toBe(true)
  })

  it('sends logged users to explore or to their profile', async () => {
    const wrapper = await mountHome({ loggedIn: true })

    expect(actionLinks(wrapper)).toEqual([
      ['Explore games', '/games'],
      ['My profile', '/users/demo'],
    ])
    expect(wrapper.find('[data-test="final-cta"]').exists()).toBe(false)
  })

  it('shows the trending games', async () => {
    const wrapper = await mountHome()

    expect(wrapper.findAll('h3').map((title) => title.text())).toEqual(
      expect.arrayContaining(['Hades', 'Celeste', 'Tunic']),
    )
  })

  it('uses three trending covers in the hero, skipping games without one', async () => {
    gameService.getTrending.mockResolvedValue([
      game(1, 'Hades'),
      game(2, 'No cover', null),
      game(3, 'Celeste'),
      game(4, 'Tunic'),
      game(5, 'Hollow Knight'),
    ])
    const wrapper = await mountHome()

    const covers = wrapper.findAll('[data-test="hero-cover"]').map((image) => image.attributes('src'))
    expect(covers).toEqual(['https://img/1.jpg', 'https://img/3.jpg', 'https://img/4.jpg'])
  })

  it('shows skeleton cards while trending games load', async () => {
    gameService.getTrending.mockReturnValue(new Promise(() => {}))
    const wrapper = await mountHome()

    expect(wrapper.find('[data-test="trending-loading"]').exists()).toBe(true)
  })

  it('lets the user retry when trending games fail', async () => {
    gameService.getTrending.mockRejectedValueOnce(new Error('Timeout'))
    const wrapper = await mountHome()

    await wrapper.find('[data-test="trending-error"] button').trigger('click')
    await flushPromises()

    expect(gameService.getTrending).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[data-test="trending-error"]').exists()).toBe(false)
  })

  it('shows the recent reviews with the game they are about', async () => {
    const wrapper = await mountHome()

    expect(wrapper.findAll('[data-test="body"]').map((body) => body.text())).toEqual(['Review 1', 'Review 2'])
    expect(wrapper.find('[data-test="game"]').exists()).toBe(true)
  })

  it('invites the community to write the first review when there are none', async () => {
    reviewService.getRecent.mockResolvedValue({ reviews: [], page: 0, totalPages: 0 })
    const wrapper = await mountHome()

    expect(wrapper.find('[data-test="reviews-empty"]').text()).toContain('No reviews yet')
  })

  it('keeps the page usable when reviews fail to load', async () => {
    reviewService.getRecent.mockRejectedValue(new Error('Timeout'))
    const wrapper = await mountHome()

    expect(wrapper.find('[data-test="reviews-error"]').exists()).toBe(true)
    expect(wrapper.findAll('h3').map((title) => title.text())).toContain('Hades')
  })
})
