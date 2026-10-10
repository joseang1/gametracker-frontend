const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const absolute = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

const units = [
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

export function formatRelativeDate(value, now = new Date()) {
  const date = new Date(value)
  const seconds = Math.round((date - now) / 1000)

  if (Math.abs(seconds) >= 30 * 86400) return absolute.format(date)

  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit)
  }
  return 'just now'
}
