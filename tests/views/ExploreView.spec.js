import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ExploreView from '@/views/ExploreView.vue'
import GameModel from '@/core/models/GameModel'
import { gameSummaryMapper } from '@/core/mappers/game-mapper'

describe('ExploreView', () => {
  const game = (id, title) =>
    GameModel.createGame({ id, rawgId: id * 10, title, genres: ['RPG'], rating: 8 }, gameSummaryMapper)

  let gameService

  const mountExplore = async (query = {}) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/games', component: ExploreView },
        { path: '/games/:id', component: { template: '<div />' } },
      ],
    })
    router.push({ path: '/games', query })
    await router.isReady()

    const wrapper = mount(ExploreView, {
      global: { plugins: [router], provide: { GameService: gameService } },
    })
    await flushPromises()
    return { wrapper, router }
  }

  beforeEach(() => {
    window.scrollTo = vi.fn()
    gameService = {
      search: vi.fn().mockResolvedValue({ games: [game(1, 'Hades'), game(2, 'Celeste')], page: 0, totalPages: 3 }),
    }
  })

  it('shows a card for every game found', async () => {
    const { wrapper } = await mountExplore()

    const titles = wrapper.findAll('h3').map((title) => title.text())
    expect(titles).toEqual(['Hades', 'Celeste'])
    expect(wrapper.text()).toContain('Page 1 of 3')
  })

  it('restores the search and page from the URL', async () => {
    const { wrapper } = await mountExplore({ q: 'hades', page: '2' })

    expect(gameService.search).toHaveBeenCalledWith('hades', 1)
    expect(wrapper.find('[data-test="search"]').element.value).toBe('hades')
  })

  it('ignores a broken page number in the URL', async () => {
    await mountExplore({ page: 'abc' })

    expect(gameService.search).toHaveBeenCalledWith('', 0)
  })

  it('keeps the search in the URL while typing', async () => {
    const { wrapper, router } = await mountExplore()

    await wrapper.find('[data-test="search"]').setValue('celeste')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ q: 'celeste' })
  })

  it('loads the next page from the pagination', async () => {
    const { wrapper, router } = await mountExplore()

    await wrapper.find('[data-test="next"]').trigger('click')
    await flushPromises()

    expect(gameService.search).toHaveBeenLastCalledWith('', 1)
    expect(router.currentRoute.value.query).toEqual({ page: '2' })
  })

  it('shows skeleton cards while loading', async () => {
    gameService.search.mockReturnValue(new Promise(() => {}))
    const { wrapper } = await mountExplore()

    expect(wrapper.find('[data-test="loading"]').exists()).toBe(true)
  })

  it('tells the user when nothing was found', async () => {
    gameService.search.mockResolvedValue({ games: [], page: 0, totalPages: 1 })
    const { wrapper } = await mountExplore({ q: 'zzzz' })

    expect(wrapper.find('[data-test="empty"]').text()).toContain('Nothing matches “zzzz”')
  })

  it('shows the error and lets the user try again', async () => {
    gameService.search.mockRejectedValueOnce(new Error('Cannot reach the server. Is the backend running?'))
    const { wrapper } = await mountExplore()

    expect(wrapper.find('[data-test="error"]').text()).toContain('Cannot reach the server')

    await wrapper.find('[data-test="error"] button').trigger('click')
    await flushPromises()

    expect(wrapper.findAll('h3')).toHaveLength(2)
  })
})
