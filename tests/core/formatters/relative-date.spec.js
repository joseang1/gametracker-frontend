import { formatRelativeDate } from '@/core/formatters/relative-date'

describe('formatRelativeDate', () => {
  const now = new Date('2026-10-10T12:00:00')

  it.each([
    ['2026-10-10T11:59:40', 'just now'],
    ['2026-10-10T11:45:00', '15 minutes ago'],
    ['2026-10-10T09:00:00', '3 hours ago'],
    ['2026-10-09T12:00:00', 'yesterday'],
    ['2026-10-07T12:00:00', '3 days ago'],
  ])('shows %s as "%s"', (value, expected) => {
    expect(formatRelativeDate(value, now)).toBe(expected)
  })

  it('shows the real date for anything older than a month', () => {
    expect(formatRelativeDate('2026-08-02T12:00:00', now)).toBe('Aug 2, 2026')
  })
})
