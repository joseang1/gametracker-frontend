import { mount } from '@vue/test-utils'
import StarRating from '@/components/ui/StarRating.vue'

describe('StarRating', () => {
  const widths = (value) =>
    mount(StarRating, { props: { value } })
      .findAll('[data-test="star-fill"]')
      .map((fill) => fill.attributes('style'))

  it('always draws five stars', () => {
    expect(mount(StarRating, { props: { value: 2 } }).findAll('[data-test="star"]')).toHaveLength(5)
  })

  it('fills whole and half stars', () => {
    expect(widths(3.5)).toEqual(['width: 100%;', 'width: 100%;', 'width: 100%;', 'width: 50%;', 'width: 0%;'])
  })

  it('describes the rating for screen readers', () => {
    expect(mount(StarRating, { props: { value: 4.5 } }).attributes('aria-label')).toBe('Rated 4.5 out of 5')
  })
})
