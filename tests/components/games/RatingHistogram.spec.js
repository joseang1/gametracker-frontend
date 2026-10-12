import { mount } from '@vue/test-utils'
import RatingHistogram from '@/components/games/RatingHistogram.vue'
import RatingStatsModel from '@/core/models/RatingStatsModel'

describe('RatingHistogram', () => {
  const stats = RatingStatsModel.createStats({ reviewCount: 4, average: 8, distribution: [0, 0, 0, 0, 0, 0, 1, 2, 0, 1] })

  it('draws one bar per possible rating', () => {
    expect(mount(RatingHistogram, { props: { stats } }).findAll('[data-test="bar"]')).toHaveLength(10)
  })

  it('makes the most common rating the tallest bar and keeps empty ones visible', () => {
    const heights = mount(RatingHistogram, { props: { stats } })
      .findAll('[data-test="bar-fill"]')
      .map((fill) => fill.attributes('style'))

    expect(heights[7]).toBe('height: 100%;')
    expect(heights[6]).toBe('height: 50%;')
    expect(heights[0]).toBe('height: 4%;')
  })

  it('describes every bar for screen readers', () => {
    const labels = mount(RatingHistogram, { props: { stats } })
      .findAll('[data-test="bar"]')
      .map((bar) => bar.attributes('aria-label'))

    expect(labels[7]).toBe('4 stars: 2 reviews')
    expect(labels[9]).toBe('5 stars: 1 review')
  })

  it('shows the count and percentage on hover', () => {
    expect(mount(RatingHistogram, { props: { stats } }).findAll('[data-test="bar"]')[7].text()).toContain('2 (50%)')
  })

  it('highlights the chosen rating', () => {
    const fills = mount(RatingHistogram, { props: { stats, highlight: 7 } }).findAll('[data-test="bar-fill"]')

    expect(fills[6].classes()).toContain('bg-accent')
    expect(fills[7].classes()).not.toContain('bg-accent')
  })
})
