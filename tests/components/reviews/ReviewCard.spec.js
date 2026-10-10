import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ReviewCard from '@/components/reviews/ReviewCard.vue'
import ReviewModel from '@/core/models/ReviewModel'
import { reviewMapper } from '@/core/mappers/review-mapper'

describe('ReviewCard', () => {
  const dto = {
    id: 1,
    rating: 9,
    body: 'Zagreus forever.',
    spoiler: false,
    createdAt: '2026-10-08T18:00:00',
    updatedAt: '2026-10-08T18:00:00',
    author: { id: 2, username: 'demo', role: 'USER', avatarUrl: null },
    game: { id: 7, rawgId: 274755, title: 'Hades', coverUrl: 'https://img/hades.jpg', releaseDate: '2020-09-17', genres: [] },
  }

  const mountCard = (overrides = {}, props = {}) => {
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:any(.*)*', component: {} }] })
    const review = ReviewModel.createReview({ ...dto, ...overrides }, reviewMapper)
    return mount(ReviewCard, { props: { review, ...props }, global: { plugins: [router] } })
  }

  it('shows the author, the text and the stars', () => {
    const wrapper = mountCard()

    expect(wrapper.find('[data-test="author"]').text()).toBe('demo')
    expect(wrapper.find('[data-test="body"]').text()).toBe('Zagreus forever.')
    expect(wrapper.find('[role="img"][aria-label="Rated 4.5 out of 5"]').exists()).toBe(true)
  })

  it('links the author to their profile', () => {
    expect(mountCard().find('[data-test="author"]').attributes('href')).toBe('/users/demo')
  })

  it('shows which game was reviewed only when asked to', () => {
    expect(mountCard().find('[data-test="game"]').exists()).toBe(false)

    const game = mountCard({}, { showGame: true }).find('[data-test="game"]')
    expect(game.text()).toContain('Hades')
    expect(game.attributes('href')).toBe('/games/7')
  })

  it('hides spoilers until the reader asks to see them', async () => {
    const wrapper = mountCard({ spoiler: true })
    const body = () => wrapper.find('[data-test="body"]')

    expect(body().classes()).toContain('blur-sm')
    expect(body().attributes('aria-hidden')).toBe('true')

    await wrapper.find('[data-test="reveal"]').trigger('click')

    expect(body().classes()).not.toContain('blur-sm')
    expect(wrapper.find('[data-test="reveal"]').exists()).toBe(false)
  })

  it('says when the review is only a rating', () => {
    const wrapper = mountCard({ body: null })

    expect(wrapper.find('[data-test="body"]').exists()).toBe(false)
    expect(wrapper.find('[data-test="rating-only"]').exists()).toBe(true)
  })

  it('marks edited reviews', () => {
    expect(mountCard({ updatedAt: '2026-10-09T10:00:00' }).text()).toContain('edited')
  })
})
