const EMPTY_DISTRIBUTION = Array(10).fill(0)

export default class RatingStatsModel {
  constructor(reviewCount, average, distribution) {
    this.reviewCount = reviewCount
    this.average = average
    this.distribution = distribution
  }

  hasReviews() {
    return this.reviewCount > 0
  }

  getAverageStars() {
    return this.average === null ? null : Math.round((this.average / 2) * 10) / 10
  }

  getBarHeights() {
    const highest = Math.max(...this.distribution)
    return this.distribution.map((count) => (highest === 0 ? 0 : count / highest))
  }

  static createStats(dto) {
    return new RatingStatsModel(
      dto?.reviewCount ?? 0,
      dto?.average ?? null,
      dto?.distribution?.length === 10 ? dto.distribution : EMPTY_DISTRIBUTION,
    )
  }
}
