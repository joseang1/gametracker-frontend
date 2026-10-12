import { formatReleaseDate } from '@/core/formatters/release-date'

describe('formatReleaseDate', () => {
  it('writes the full date', () => {
    expect(formatReleaseDate('2020-09-17')).toBe('September 17, 2020')
  })

  it('keeps New Year on the right year whatever the time zone', () => {
    expect(formatReleaseDate('2015-01-01')).toBe('January 1, 2015')
  })

  it('says when a game has no date yet', () => {
    expect(formatReleaseDate(null)).toBe('To be announced')
  })
})
