import RatingStatsModel from '@/core/models/RatingStatsModel'

describe('RatingStatsModel', () => {
  it('scales every bar against the most common score', () => {
    const stats = RatingStatsModel.createStats({ reviewCount: 8, average: 7.5, distribution: [0, 0, 0, 0, 0, 1, 2, 4, 1, 0] })

    expect(stats.getBarHeights()).toEqual([0, 0, 0, 0, 0, 0.25, 0.5, 1, 0.25, 0])
  })

  it('has flat bars and no average without reviews', () => {
    const stats = RatingStatsModel.createStats({ reviewCount: 0, average: null, distribution: Array(10).fill(0) })

    expect(stats.hasReviews()).toBe(false)
    expect(stats.getAverageStars()).toBeNull()
    expect(stats.getBarHeights()).toEqual(Array(10).fill(0))
  })

  it('turns the 1-10 average into stars with one decimal', () => {
    expect(RatingStatsModel.createStats({ reviewCount: 3, average: 7.333, distribution: [] }).getAverageStars()).toBe(3.7)
  })

  it('survives missing stats from the backend', () => {
    const stats = RatingStatsModel.createStats(undefined)

    expect(stats.reviewCount).toBe(0)
    expect(stats.distribution).toHaveLength(10)
  })
})
