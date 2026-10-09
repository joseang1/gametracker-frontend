import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import GameCard from '@/components/games/GameCard.vue'
import GameModel from '@/core/models/GameModel'
import { gameSummaryMapper } from '@/core/mappers/game-mapper'

describe('GameCard', () => {
  const witcher = {
    id: 5,
    rawgId: 3328,
    title: 'The Witcher 3',
    coverUrl: 'https://img/witcher.jpg',
    releaseDate: '2015-05-18',
    genres: ['RPG', 'Action', 'Adventure'],
    rating: 9,
  }

  const mountCard = (overrides = {}) => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:any(.*)*', component: {} }] })
    const game = GameModel.createGame({ ...witcher, ...overrides }, gameSummaryMapper)
    return mount(GameCard, { props: { game }, global: { plugins: [router] } })
  }

  it('shows the cover, title, year and first two genres', () => {
    const wrapper = mountCard()

    expect(wrapper.find('[data-test="cover"]').attributes('src')).toBe('https://img/witcher.jpg')
    expect(wrapper.find('h3').text()).toBe('The Witcher 3')
    expect(wrapper.text()).toContain('2015 · RPG · Action')
    expect(wrapper.text()).not.toContain('Adventure')
  })

  it('links to the game page', () => {
    expect(mountCard().find('a').attributes('href')).toBe('/games/5')
  })

  it('shows the rating out of 5 stars', () => {
    expect(mountCard({ rating: 7 }).find('[data-test="rating"]').text()).toBe('3.5')
  })

  it('hides the rating badge when nobody rated the game', () => {
    expect(mountCard({ rating: null }).find('[data-test="rating"]').exists()).toBe(false)
  })

  it('shows a placeholder when there is no cover', () => {
    const wrapper = mountCard({ coverUrl: null })

    expect(wrapper.find('[data-test="cover"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="cover-placeholder"]').exists()).toBe(true)
  })

  it('switches to the placeholder when the cover fails to load', async () => {
    const wrapper = mountCard()

    await wrapper.find('[data-test="cover"]').trigger('error')

    expect(wrapper.find('[data-test="cover-placeholder"]').exists()).toBe(true)
  })

  it('says TBA when the release date is unknown', () => {
    expect(mountCard({ releaseDate: null }).text()).toContain('TBA')
  })
})
